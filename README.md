# Video Compressor

A local web-based video compression tool with a Node.js backend powered by FFmpeg.

## Features

- 🎯 **Two Compression Modes**:
  - Quality-based (High/Medium/Low presets)
  - Target size (specify exact output file size)
- 📊 **Real-time Progress** tracking
- 🎥 **Multiple Codecs** (H.264, VP9)
- 🎨 **Modern UI** with glassmorphism design
- 🔒 **Fully Local** - no external uploads
- 🧹 **Auto-cleanup** of temporary files

## Quick Start

```powershell
# Install dependencies
npm install

# Start server
node server.js

# Open browser
http://localhost:3000
```

That's it! Drag a video to compress.

## Requirements

- Node.js v18+ (all FFmpeg dependencies bundled automatically)

## How It Works

1. **Upload** video to local server
2. **Server** processes with FFmpeg
3. **Download** compressed result
4. Files auto-delete after 1 hour

## Target Size Accuracy

When using target size mode, the output file will be within **~5-10%** of your specified target. The tool:
- Analyzes video duration with ffprobe
- Calculates precise bitrate accounting for audio overhead
- Adjusts video quality to hit the target

## Documentation

- **SKILL.md** - Complete usage guide
- **docs/** - Development troubleshooting history

## Project Structure

```
video-compressor/
├── index.html          # Frontend UI
├── app.js              # Frontend logic
├── styles.css          # Modern styling
├── server.js           # Backend API
├── package.json        # Dependencies
├── uploads/            # Temp uploads (auto-cleaned)
├── outputs/            # Compressed videos (auto-cleaned)
└── SKILL.md            # Full documentation
```

## Troubleshooting

**Server won't start?**
```powershell
Stop-Process -Name node -Force
node server.js
```

**Need to clean temp files?**
```powershell
Remove-Item .\uploads\*, .\outputs\* -Force
```

See **SKILL.md** for detailed troubleshooting.

## Tech Stack

- **Backend**: Node.js + Express + FFmpeg
- **Frontend**: Vanilla JavaScript + Modern CSS
- **Processing**: fluent-ffmpeg wrapper
- **Codecs**: H.264 (libx264), VP9 (libvpx-vp9)

## License

Free to use for personal projects.
