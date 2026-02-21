# 🧪 Server-Side Testing Guide

## Server Successfully Started!

✅ **Server is running on:** http://localhost:3000  
✅ **Uploads folder:** `uploads/`  
✅ **Outputs folder:** `outputs/`

---

## Testing Steps

### Step 1: Open the Application
1. Open your browser (Chrome/Edge)
2. Navigate to: **http://localhost:3000**
3. Open Developer Console (**F12** → **Console tab**)

**Expected:**
```
Video Compressor initialized!
Backend API: http://localhost:3000
```

### Step 2: Upload Video
1. Click the upload zone or drag your file
2. Select: `2026feb_jeju_FOODIE_30s.mp4`
3. Wait for file info to appear

**Expected:**
- File name and size displayed
- Settings panel appears
- Console shows video duration

### Step 3: Configure Settings (Optional)
Default settings are good for testing:
- **Mode:** Quality-Based
- **Quality:** Medium
- **Codec:** H.264

### Step 4: Start Compression
1. Click **"🚀 Compress Video"** button
2. Watch the console and UI

**Expected Flow:**
```
Console:
- Upload complete. Job ID: [timestamp-id]
- (Server logs compression progress)

UI:
- "Uploading video to server..." (0%)
- "Starting compression..." (5%)
- "Compressing video..." (10-99%)
- Results appear at 100%
```

**Timeline:**
- Upload: ~5-10 seconds
- Compression: ~30-90 seconds (for 30s video)
- Total: ~1-2 minutes

### Step 5: Download Result
1. When compression completes, results section appears showing:
   - Original size: ~133 MB
   - Compressed size: ~X MB
   - Compression ratio: ~X%
2. Click **"⬇️ Download Compressed Video"**
3. Verify downloaded video plays correctly

---

## What to Watch For

### ✅ Success Indicators
- No errors in console
- Progress updates from 0% to 100%
- Results section shows file sizes
- Download works
- Compressed video plays

### ❌ Potential Issues

**Issue: Server not responding**
- Check if server is running in terminal
- Should see: "✅ Video Compressor Server running..."
- If stopped, restart: `node server.js`

**Issue: Upload fails**
- Check console for error messages
- File might be too large (500MB limit)
- Check server terminal for errors

**Issue: FFmpeg error during compression**
- Check if FFmpeg is properly installed
- Run: `where ffmpeg` (should show path)
- Check server terminal for detailed FFmpeg errors

**Issue: Progress stuck at X%**
- This is normal for FFmpeg - it can pause at certain frames
- Wait at least 2-3 minutes before assuming it's stuck
- Check server terminal for activity

---

## Server Terminal Output

You should see output like this in the terminal running the server:

```
✅ Video Compressor Server running on http://localhost:3000
📁 Uploads: C:\Users\...\uploads
📁 Outputs: C:\Users\...\outputs
FFmpeg command: ffmpeg -i uploads\[file].mp4 -codec:v libx264...
Job [id]: 15%
Job [id]: 34%
Job [id]: 57%
Job [id]: 89%
Job [id]: Completed
```

---

## Cleanup

The server automatically deletes uploaded and compressed files after 1 hour. This prevents disk space from filling up.

To manually clean up:
- Delete files in `uploads/` folder
- Delete files in `outputs/` folder

---

## Stopping the Server

When you're done testing:
1. Go to the terminal running the server
2. Press **Ctrl + C** to stop it

---

## Comparison: Old vs New

| Feature | FFmpeg.wasm (Old) | Node.js Server (New) |
|---------|-------------------|----------------------|
| Loading | ❌ CORS/CSP errors | ✅ Works immediately |
| Processing | Browser (slow) | Server (fast) |
| Progress | ❌ Unreliable | ✅ Real-time |
| Compatibility | ❌ Limited codecs | ✅ Full FFmpeg |
| Setup | None | Node.js + FFmpeg |

---

## Next Steps

If everything works:
1. ✅ Mark testing as complete
2. ✅ Consider additional features:
   - Multiple concurrent compressions
   - Video preview
   - More codec options
   - Batch processing

If issues occur:
- Screenshot console errors
- Copy server terminal output
- Report what step failed
