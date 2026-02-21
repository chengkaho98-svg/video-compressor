---
description: Browser-based video compression tool with Node.js backend
---

# Video Compressor Tool

A local web application for compressing videos using FFmpeg with a modern UI.

## What This Tool Does

Compresses videos with two modes:
- **Quality-Based**: Choose preset quality levels (High/Medium/Low)
- **Target Size**: Specify exact output file size (accurate within ~5-10%)

## Features

- ✅ Real-time compression progress tracking
- ✅ Multiple codecs (H.264, VP9)
- ✅ Accurate target size compression
- ✅ Browser-based UI with local processing
- ✅ Auto-cleanup of temporary files
- ✅ No external uploads (localhost only)

---

## Setup & Installation

### Prerequisites

- **Node.js** v18+ (you have v25.6.0)
- All FFmpeg dependencies are bundled automatically

### First-Time Setup

```powershell
# Navigate to project
cd c:\Users\upsde\.gemini\antigravity\scratch\video-compressor

# Install dependencies (if not already installed)
powershell -ExecutionPolicy Bypass -Command "npm install"
```

Dependencies installed:
- `express` - Web server
- `multer` - File upload handling
- `fluent-ffmpeg` - FFmpeg wrapper
- `@ffmpeg-installer/ffmpeg` - Bundled FFmpeg binary
- `@ffprobe-installer/ffprobe` - Bundled FFprobe binary
- `cors` - CORS support

---

## How to Use

### 1. Start the Server

```powershell
cd c:\Users\upsde\.gemini\antigravity\scratch\video-compressor
powershell -ExecutionPolicy Bypass -Command "node server.js"
```

**Expected output:**
```
FFmpeg path: ...\node_modules\@ffmpeg-installer\win32-x64\ffmpeg.exe
FFprobe path: ...\node_modules\@ffprobe-installer\win32-x64\ffprobe.exe
✅ Video Compressor Server running on http://localhost:3000
📁 Uploads: ...\uploads
📁 Outputs: ...\outputs
```

### 2. Open the Application

Open your browser and go to: **http://localhost:3000**

### 3. Compress a Video

**Option A: Quality-Based Compression**

1. Click upload zone or drag video file
2. Select compression quality:
   - **High** (~80% of original size)
   - **Medium** (~50% default)
   - **Low** (~30% maximum compression)
3. Choose codec (H.264 recommended)
4. Click "🚀 Compress Video"
5. Wait for progress bar to complete (~30-120 seconds)
6. Click "💾 Download Compressed Video"

**Option B: Target Size Compression**

1. Upload video
2. Switch to "Target Size" mode
3. Enter desired file size (e.g., 50 MB)
4. Click "Compress Video"
5. Output will be accurate within ~5-10% of target

### 4. Stop the Server

When done, press `Ctrl + C` in the terminal running the server.

---

## Project Structure

```
video-compressor/
├── index.html          # Frontend UI
├── app.js              # Frontend logic (API calls, progress tracking)
├── styles.css          # Modern UI styling
├── server.js           # Backend API (upload, compress, download)
├── package.json        # Node.js dependencies
├── uploads/            # Temporary uploaded videos (auto-deleted after 1h)
├── outputs/            # Compressed videos (auto-deleted after 1h)
├── samples/            # Sample test videos
├── docs/               # Debug documentation from development
└── node_modules/       # Dependencies (includes bundled FFmpeg)
```

---

## Technical Details

### How Target Size Works

The tool calculates the exact video bitrate needed:

1. **Get duration** using ffprobe
2. **Calculate audio size**: `128 kbps × duration`
3. **Calculate video budget**: `target_size - audio_size`
4. **Set video bitrate**: `(video_budget × 8) / duration`

**Example for 50MB target, 28s video:**
- Total: 50 MB = 51,200 KB
- Audio: 128 kbps × 28s = ~448 KB
- Video budget: 51,200 - 448 = 50,752 KB
- Video bitrate: (50,752 × 8) / 28 = ~14,500 kbps

Result: Output file ~48-52 MB (highly accurate!)

### Supported Formats

**Input:** Any format FFmpeg supports (MP4, MOV, AVI, MKV, WebM, etc.)

**Output:**
- H.264: `.mp4` (best compatibility)
- VP9: `.webm` (better compression, open source)

### Performance

- **Processing speed**: ~0.5-2x realtime (30s video = 30-120s compression)
- **Quality loss**: Minimal with CRF 23-28
- **File size reduction**: Typically 50-80% depending on settings

---

## Troubleshooting

### Server won't start - "EADDRINUSE"

Port 3000 is in use. Kill existing Node processes:

```powershell
Stop-Process -Name node -Force
node server.js
```

### Compression fails - "Cannot find ffprobe"

Dependencies missing. Reinstall:

```powershell
npm install @ffmpeg-installer/ffmpeg @ffprobe-installer/ffprobe
```

### Target size not accurate

- First compression? Allow 1-2 attempts for calibration
- Very short videos (<10s) are harder to target accurately
- Expected accuracy: ±5-10% of target

### Browser shows old version

Hard refresh: `Ctrl + Shift + R`

---

## Maintenance

### Auto-Cleanup

Files in `uploads/` and `outputs/` are **automatically deleted after 1 hour**.

Manual cleanup:

```powershell
Remove-Item .\uploads\* -Force
Remove-Item .\outputs\* -Force
```

### Updating Dependencies

```powershell
npm update
```

---

## Development Notes

### Why Server-Side?

Originally attempted browser-based compression with FFmpeg.wasm but encountered:
- CORS errors with CDN loading
- Content Security Policy blocks
- Web Worker communication issues
- Limited codec support

**Solution:** Node.js backend with real FFmpeg = reliable, fast, full-featured.

### Key Files Modified from Original Attempt

- `index.html`: Removed FFmpeg.wasm scripts, simplified CSP
- `app.js`: Replaced FFmpeg.wasm with REST API calls
- `server.js`: New backend with upload/compress/download endpoints

### Debug Documentation

See `docs/` folder for detailed troubleshooting history:
- `CORS-FIX.md` - CDN CORS issues (original attempt)
- `SERVER-TEST-GUIDE.md` - Backend testing procedures
- `PROGRESS-IMPROVEMENTS.md` - UI feedback enhancements

---

## Quick Reference

```powershell
# Start server
node server.js

# Check if running
curl http://localhost:3000/health

# Stop all node processes
Stop-Process -Name node -Force

# Clean temporary files
Remove-Item .\uploads\*, .\outputs\* -Force
```

**URLs:**
- App: http://localhost:3000
- Health check: http://localhost:3000/health
- Upload API: POST http://localhost:3000/upload
- Compress API: POST http://localhost:3000/compress/:jobId
- Status API: GET http://localhost:3000/status/:jobId
- Download: GET http://localhost:3000/download/:jobId

---

## Credits

Built using:
- **FFmpeg** - Video processing
- **Express** - Web server
- **Fluent-FFmpeg** - FFmpeg Node.js wrapper
- Modern CSS - Glassmorphism UI design
