# 🧪 Manual Testing Guide

Since I can't use the browser directly, here's a step-by-step testing guide for you to follow.

## Prerequisites

Make sure your Python HTTP server is running:
```powershell
cd c:\Users\upsde\.gemini\antigravity\scratch\video-compressor
python -m http.server 8000
```

## Testing Steps

### Step 1: Open the Application
1. Open your browser (Chrome/Edge recommended)
2. Navigate to: **http://localhost:8000**
3. Open Developer Console (**F12** → **Console tab**)

**Expected:** You should see:
```
Video Compressor initialized!
FFmpeg will load when you compress your first video.
```

### Step 2: Upload Your Test Video
1. Click the **purple upload zone** or drag your file
2. Select: `2026feb_jeju_FOODIE_30s.mp4`
3. Wait for the file to process

**Expected:** 
- Upload zone disappears
- File info appears showing:
  - Filename: `2026feb_jeju_FOODIE_30s.mp4`
  - Size: `~133 MB`
- Console shows: `Video duration: 29.77975 seconds`
- Settings panel appears with compression options

### Step 3: Configure Compression (Default is Fine)
Default settings are:
- **Mode:** Quality-Based
- **Quality:** Medium (CRF 28)
- **Codec:** H.264

**You can change these if you want, but default works well for testing.**

### Step 4: Start Compression
1. Click the **"🚀 Compress Video"** button
2. **Watch the console closely** - this is where we'll see what's happening

**Expected Console Output:**
```
Video duration: 29.77975 seconds
Initializing FFmpeg...
Loading FFmpeg core files...
✅ FFmpeg loaded successfully!
FFmpeg ready! Starting compression...
FFmpeg command: -i input.mp4 -c:v libx264 -crf 28 -preset fast -vf scale=1280:-2 -c:a aac -b:a 128k -movflags +faststart output.mp4
Starting compression...
FFmpeg: frame=    0 fps=0.0 q=0.0 size=       0kB time=00:00:00.00 bitrate=N/A speed=   0x    
Compression progress: 15%
Compression progress: 23%
Compression progress: 34%
...
Compression progress: 95%
Compression progress: 99%
```

**Expected UI:**
- Progress section appears at top
- Purple progress bar shows percentage
- Status messages update:
  - "Initializing FFmpeg..."
  - "Loading FFmpeg core..."
  - "FFmpeg ready! Starting compression..."
  - "Preparing video..."
  - "Loading video into FFmpeg..."
  - "Compressing with H264..."
  - "Finalizing..."

### Step 5: Wait for Completion
Compression time: **~1-2 minutes** for your 30-second video

**Successful completion:**
- Console shows: Final frame processing
- Progress bar reaches 100%
- Results section appears showing:
  - Original size: ~133 MB
  - Compressed size: ~X MB
  - Compression ratio: ~X%
  - "⬇️ Download Compressed Video" button

### Step 6: Download and Verify
1. Click **"Download Compressed Video"**
2. Save the file (will be named like `2026feb_jeju_FOODIE_30s_compressed.mp4`)
3. Play it to verify:
   - Video plays correctly
   - Audio is present
   - Quality is acceptable

## 🚨 What to Watch For

### ✅ Success Indicators
- Console shows "✅ FFmpeg loaded successfully!"
- Progress updates appear (15%, 23%, 34%...)
- No red errors in console
- Results section appears with download button
- Downloaded video plays correctly

### ❌ Error Indicators
- **Async Error:** `Uncaught (in promise) Error: A listener indicated...`
  - This means FFmpeg is still having worker issues
  - Screenshot the console and let me know
  
- **CORS Error:** `SecurityError: Failed to construct 'Worker'...`
  - Still having CDN/CORS issues
  - Screenshot and let me know

- **Loading Stuck:** FFmpeg keeps loading but never shows "✅ loaded"
  - Let it run for 30 seconds max
  - If still stuck, screenshot and report

## 📸 What I Need From You

Please test and report back with:

### If It Works ✅
1. Screenshot of the **Results section** showing file sizes
2. Confirm the video downloaded and plays correctly
3. Note the compression time

### If It Fails ❌
1. **Screenshot of the full Console** showing all errors
2. **Screenshot of the UI** showing what's visible
3. Tell me at what step it failed:
   - FFmpeg loading?
   - Compression start?
   - Mid-compression?
4. Copy-paste any error messages from console

## Expected Behavior Summary

| Stage | Duration | What You'll See |
|-------|----------|-----------------|
| Page Load | 1 sec | "Video Compressor initialized!" |
| Upload File | 2 sec | File info appears, duration calculated |
| FFmpeg Load | 3-5 sec | "Loading..." → "✅ loaded!" |
| Compression | 60-120 sec | Progress: 15% → 99% |
| Finalize | 2-3 sec | "Finalizing..." → Results appear |

**Total Time:** About 1.5-2.5 minutes from upload to download

---

## 🐛 Troubleshooting

**If you see the async error again:**
- The direct loading approach didn't work
- We'll need to try a different FFmpeg library or approach

**If compression is very slow (>5 minutes):**
- This is unusual but not broken
- FFmpeg might be running single-threaded
- Let it complete if you can

**If browser freezes:**
- FFmpeg uses a lot of CPU - this is normal
- Your computer might slow down during compression
- The browser tab might show "Not Responding" but should recover

---

Ready when you are! Just follow the steps and let me know what happens. 🚀
