# Debugging Guide - Compression Errors

## Issue Fixed: Unsupported Codecs

**Problem:** H.265 (HEVC) and AV1 codecs are not included in standard FFmpeg.wasm build

**Solution:** Removed unsupported codecs. Now only offering:
- ✅ **H.264** (libx264) - Fully supported, fast, universal compatibility
- ✅ **VP9** (libvpx-vp9) - Fully supported, good compression, WebM output

## Changes Made

### 1. JavaScript (`app.js`)
- Removed H.265 and AV1 from CODECS configuration
- Added detailed console logging for debugging
- Improved error messages with specific guidance
- Fixed target size mode missing scale filter
- Improved VP9 codec settings
- Added `Math.floor()` for bitrate calculations

### 2. HTML (`index.html`)
- Removed H.265 and AV1 options from codec dropdown
- Updated help text to be more accurate

## How to Test After Fix

1. **Refresh the browser page** (Ctrl+F5 or Cmd+Shift+R)
2. Open DevTools Console (F12 → Console tab)
3. Upload your test video: `2026feb_jeju_FOODIE_30s.mp4`
4. Keep default settings (Quality-Based, Medium, H.264)
5. Click "Compress Video"
6. Watch console for detailed logs:
   ```
   Video duration: XX seconds
   Initializing FFmpeg...
   FFmpeg loaded successfully!
   FFmpeg command: -i input.mp4 -c:v libx264 -crf 32 -preset fast ...
   Built FFmpeg args: [...]
   ```
7. Compression should now work!

## Console Debug Information

You will now see these helpful logs:
- **"FFmpeg command:"** - The full command being executed
- **"Built FFmpeg args:"** - The arguments array
- **Error details** - Full error message and stack trace if something fails

## If You Still Get Errors

Check the console for specific error messages:

### Error: "Decoder ... not found"
- Video format might not be supported
- Try converting video to MP4 first

### Error: "Invalid data found when processing input"
- Video file might be corrupted
- Try a different video file

### Error: "Could not write header"
- Output format issue
- This should be fixed now with our updates

### Progress bar stuck
- Wait longer - encoding can take time
- Check console for errors
- Video might be too large/complex

## Test Scenarios

### Quick Test (Should Work Now)
- Mode: Quality-Based
- Preset: Medium
- Codec: H.264
- Expected time: 30-60 seconds

### VP9 Test
- Mode: Quality-Based  
- Preset: Medium
- Codec: VP9
- Expected time: 1-2 minutes
- Output: .webm file

### Target Size Test
- Mode: Target Size
- Size: 10 MB
- Codec: H.264
- Expected: Output ~10MB ±1-2MB

## Common Working Settings

**Fast & Compatible:**
- H.264, Quality-Based, Medium = Best general purpose

**Maximum Compression:**
- VP9, Quality-Based, Maximum = Smallest files

**Specific File Size:**
- H.264, Target Size, 10MB = Good for sharing

## What Was Causing the Error

The most likely cause was:
1. **Unsupported codec selected** - H.265 or AV1 tried to use encoders not in FFmpeg.wasm
2. **Missing scale filter** - Target size mode didn't scale video properly
3. **VP9 wrong settings** - VP9 needs different flags than H.264

All of these are now fixed!
