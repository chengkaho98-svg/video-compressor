const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Set FFmpeg and FFprobe paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);
console.log('FFmpeg path:', ffmpegPath);
console.log('FFprobe path:', ffprobePath);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files (frontend)
app.use(express.static(__dirname));

// Create directories for uploads and outputs
const uploadsDir = path.join(__dirname, 'uploads');
const outputsDir = path.join(__dirname, 'outputs');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(outputsDir)) fs.mkdirSync(outputsDir);

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

// Store compression jobs
const jobs = new Map();

// Upload endpoint
app.post('/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const jobId = path.basename(req.file.filename, path.extname(req.file.filename));
    jobs.set(jobId, {
        status: 'uploaded',
        inputPath: req.file.path,
        originalName: req.file.originalname,
        size: req.file.size,
        progress: 0
    });

    res.json({
        jobId: jobId,
        filename: req.file.originalname,
        size: req.file.size
    });
});

// Compression endpoint
app.post('/compress/:jobId', (req, res) => {
    const { jobId } = req.params;
    const { quality, codec, mode, targetSize, preset } = req.body;

    const job = jobs.get(jobId);
    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status === 'compressing') {
        return res.status(400).json({ error: 'Already compressing' });
    }

    // Determine output file extension
    const codecExt = codec === 'vp9' ? 'webm' : 'mp4';
    const outputPath = path.join(outputsDir, `${jobId}.${codecExt}`);

    job.status = 'compressing';
    job.outputPath = outputPath;
    job.progress = 0;

    // Build FFmpeg command
    let command = ffmpeg(job.inputPath)
        .on('start', (commandLine) => {
            console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
            job.progress = Math.min(Math.round(progress.percent || 0), 99);
            console.log(`Job ${jobId}: ${job.progress}%`);
        })
        .on('end', () => {
            job.status = 'completed';
            job.progress = 100;
            job.outputSize = fs.statSync(outputPath).size;
            console.log(`Job ${jobId}: Completed`);
        })
        .on('error', (err) => {
            job.status = 'error';
            job.error = err.message;
            console.error(`Job ${jobId}: Error -`, err.message);
        });

    // Video codec settings
    if (codec === 'h264') {
        command.videoCodec('libx264');
        command.outputOptions('-preset', 'fast');
    } else if (codec === 'vp9') {
        command.videoCodec('libvpx-vp9');
        command.outputOptions('-speed', '2');
    }

    // Audio codec
    command.audioCodec('aac').audioBitrate('128k');

    // Compression mode
    if (mode === 'quality') {
        // Quality-based (CRF)
        const crfValue = quality || 28;
        command.outputOptions('-crf', crfValue.toString());

        // Scale based on preset
        if (preset === 'high') {
            command.size('1920x?');
        } else if (preset === 'medium') {
            command.size('1280x?');
        } else if (preset === 'low') {
            command.size('854x?');
        } else if (preset === 'very-low') {
            command.size('640x?');
        }
    } else if (mode === 'target') {
        // Target size-based - get actual duration and calculate bitrate
        // We need to get duration from the video file first
        ffmpeg.ffprobe(job.inputPath, (err, metadata) => {
            if (err) {
                job.status = 'error';
                job.error = 'Failed to analyze video: ' + err.message;
                console.error(`Job ${jobId}: Failed to get duration -`, err.message);
                return;
            }

            const durationInSeconds = metadata.format.duration;
            const targetSizeMB = targetSize || 10;
            const targetSizeKB = targetSizeMB * 1024;

            // Account for audio bitrate (128k = ~16KB/s)
            const audioBitrateKBps = 128 / 8; // 16 KB/s
            const audioSizeKB = audioBitrateKBps * durationInSeconds;

            // Calculate video bitrate needed to hit target
            const videoSizeKB = targetSizeKB - audioSizeKB;
            const videoBitrateKbps = Math.floor((videoSizeKB * 8) / durationInSeconds);

            // Ensure minimum bitrate
            const finalBitrate = Math.max(videoBitrateKbps, 100); // Minimum 100kbps

            console.log(`Target size: ${targetSizeMB}MB, Duration: ${durationInSeconds}s, Video bitrate: ${finalBitrate}kbps`);

            command.videoBitrate(finalBitrate);
            command.size('1280x?');

            // Additional options for better web compatibility
            command.outputOptions('-movflags', '+faststart');

            // Save to output
            command.save(outputPath);
        });

        // Return early - the ffprobe callback will handle the rest
        return res.json({ message: 'Compression started', jobId });
    }

    // Additional options for better web compatibility
    command.outputOptions('-movflags', '+faststart');

    // Save to output
    command.save(outputPath);

    res.json({ message: 'Compression started', jobId });
});

// Status endpoint
app.get('/status/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
        jobId,
        status: job.status,
        progress: job.progress,
        error: job.error,
        originalSize: job.size,
        compressedSize: job.outputSize
    });
});

// Download endpoint
app.get('/download/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'completed') {
        return res.status(400).json({ error: 'Compression not completed' });
    }

    const filename = job.originalName.replace(/\.[^.]+$/, '_compressed' + path.extname(job.outputPath));
    res.download(job.outputPath, filename);
});

// Cleanup old files (run every hour)
setInterval(() => {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    jobs.forEach((job, jobId) => {
        const age = now - parseInt(jobId.split('-')[0]);
        if (age > maxAge) {
            // Delete files
            if (fs.existsSync(job.inputPath)) fs.unlinkSync(job.inputPath);
            if (job.outputPath && fs.existsSync(job.outputPath)) fs.unlinkSync(job.outputPath);
            jobs.delete(jobId);
            console.log(`Cleaned up job: ${jobId}`);
        }
    });
}, 60 * 60 * 1000); // Run every hour

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', jobs: jobs.size });
});

app.listen(PORT, () => {
    console.log(`✅ Video Compressor Server running on http://localhost:${PORT}`);
    console.log(`📁 Uploads: ${uploadsDir}`);
    console.log(`📁 Outputs: ${outputsDir}`);
});
