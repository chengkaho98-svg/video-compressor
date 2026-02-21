# Manual Testing Guide for Video Compressor

## Test Video Information
**File:** `2026feb_jeju_FOODIE_30s.mp4`
**Location:** `C:\Users\upsde\.gemini\antigravity\scratch\video-compressor\`
**Duration:** ~30 seconds

## Access the Application
**URL:** http://localhost:8000

(The Python HTTP server is already running)

---

## Test Suite

### Test 1: Basic Quality-Based Compression (H.264)
**Objective:** Verify default compression works

**Steps:**
1. Open http://localhost:8000 in your browser (Chrome/Edge recommended)
2. Drag and drop `2026feb_jeju_FOODIE_30s.mp4` onto the upload zone OR click to browse
3. Verify file info appears with filename and size
4. Ensure "Quality-Based" mode is selected (should be default)
5. Ensure "Medium" preset is selected
6. Ensure "H.264" codec is selected
7. Click "🚀 Compress Video"
8. Wait for FFmpeg to load (first time ~30MB download)
9. Watch progress bar during compression (~30-60 seconds)
10. After completion, verify:
    - Original size is shown
    - Compressed size is shown (should be ~50% of original)
    - Savings percentage is calculated
11. Click "💾 Download Compressed Video"
12. Verify downloaded file plays correctly

**Expected Results:**
- ✅ File uploads successfully
- ✅ Compression completes without errors
- ✅ Output is ~50% of original size
- ✅ Video plays correctly

---

### Test 2: Target Size Compression
**Objective:** Verify target size mode calculates bitrate correctly

**Steps:**
1. Refresh the page or click "🔄 Compress Another Video"
2. Upload `2026feb_jeju_FOODIE_30s.mp4` again
3. Click "📏 Target Size" mode button
4. Verify:
   - Quality presets disappear
   - Target size input appears
5. Enter "10" MB as target size
6. Keep H.264 codec selected
7. Click "🚀 Compress Video"
8. Wait for compression
9. After completion, verify output size is close to 10MB

**Expected Results:**
- ✅ Mode toggle works smoothly
- ✅ UI updates correctly
- ✅ Output size is approximately 10MB (±1MB acceptable due to encoding variations)
- ✅ Video quality is reasonable for the target size

---

### Test 3: Codec Comparison
**Objective:** Test different codecs

**Test 3a: H.265/HEVC**
1. Upload video
2. Quality-Based mode, Medium preset
3. Select "H.265/HEVC" codec
4. Compress
5. Expected: ~20-30% smaller than H.264, but 2-3x slower

**Test 3b: VP9**
1. Upload video
2. Quality-Based mode, Medium preset
3. Select "VP9" codec
4. Compress
5. Expected: Output is .webm file, similar compression to H.265

**Test 3c: AV1** (Optional - very slow!)
1. Upload video
2. Quality-Based mode, High preset (better quality for slower codec)
3. Select "AV1" codec
4. Compress
5. Expected: Best compression, but 10-20x slower than H.264

**Expected Results:**
- ✅ All codecs complete without errors
- ✅ File extensions match codec (.mp4 for H.264/H.265/AV1, .webm for VP9)
- ✅ Compression ratios improve: H.264 < H.265 ≈ VP9 < AV1
- ✅ All output videos play correctly

---

### Test 4: Quality Presets
**Objective:** Verify preset quality levels

**Steps:**
1. Upload video
2. Quality-Based mode
3. Test each preset:
   - **High Quality**: ~80% of original size, best quality
   - **Medium**: ~50% of original size, balanced
   - **Maximum**: ~30% of original size, smallest file

**Expected Results:**
- ✅ High > Medium > Maximum in both size and quality
- ✅ All produce watchable videos
- ✅ File sizes match approximate percentages

---

### Test 5: Edge Cases

**Test 5a: Very Small Target Size**
1. Upload video
2. Target Size mode
3. Set to 2 MB
4. Compress with H.264
5. Expected: Low quality but functional video

**Test 5b: Maximum Quality + H.265**
1. Upload video
2. Quality-Based, High preset
3. H.265 codec
4. Expected: Excellent quality at smaller size than H.264

**Test 5c: Drag and Drop**
1. Drag video file directly from File Explorer
2. Drop onto purple upload zone
3. Expected: File uploads same as click-to-browse

---

## Console Checking

Open Browser DevTools (F12) and check Console tab for:

**Expected Messages:**
```
Video Compressor initialized!
FFmpeg will load when you compress your first video.
Video duration: 30 seconds (approx)
Initializing FFmpeg...
FFmpeg loaded successfully!
Selected codec: h264 (or other)
```

**Check for Errors:**
- ❌ No red error messages
- ⚠️ Warnings about favicon.ico are OK (harmless)

---

## Common Issues & Solutions

### Issue: FFmpeg fails to load
**Solution:** 
- Check internet connection (FFmpeg downloads from CDN)
- Try refreshing the page
- Clear browser cache

### Issue: Compression gets stuck at X%
**Solution:**
- Wait longer (AV1especially can be very slow)
- Check console for errors
- Try a different codec

### Issue: Target size doesn't match exactly
**Explanation:**
- Bitrate calculation is an estimate
- Final size within ±10% is normal
- Video codec overhead affects final size

### Issue: Download doesn't start
**Solution:**
- Check browser popup blocker
- Ensure compression completed (saw results screen)
- Try clicking Download button again

### Issue: Compressed video won't play
**Possible causes:**
- Check file extension matches codec
- Ensure downloaded file isn't corrupt (check size > 0)
- Try different video player
- VP9/WebM may need VLC or Chrome to play
- AV1 may need very recent player

---

## Performance Benchmarks (Approximate)

For a 30-second video:

| Codec | Speed | Compression Time |
|-------|-------|------------------|
| H.264 | ⚡⚡⚡⚡ | 30-60 sec |
| H.265 | ⚡⚡⚡ | 60-120 sec |
| VP9 | ⚡⚡ | 90-180 sec |
| AV1 | ⚡ | 5-15 min |

*Times vary based on computer performance*

---

## Quick Test Script

For fastest verification, run this quick test:

1. Open http://localhost:8000
2. Upload `2026feb_jeju_FOODIE_30s.mp4`
3. Keep defaults (Quality, Medium, H.264)
4. Click Compress
5. Wait for completion
6. Download and verify file plays

**Total time:** ~2-3 minutes

---

## Bug Reporting

If you encounter issues, note:
- Browser and version
- Codec selected
- Compression mode
- Any console errors (F12, Console tab)
- Screenshot if UI looks broken
