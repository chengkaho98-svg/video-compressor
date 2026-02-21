# Video Compressor - Feature Enhancements Summary

## New Features Added

### 1. Compression Mode Toggle

Users can now choose between two compression approaches:

**Quality-Based Compression (Default)**
- Uses CRF (Constant Rate Factor) for consistent quality
- Three preset options: High Quality, Medium, Maximum Compression
- Best when quality is the priority

**Target Size Compression**
- Allows specifying a desired output file size
- Automatically calculates required bitrate
- Input field with MB/KB unit selection
- Best when file size constraints are important (e.g., email attachments, upload limits)

### 2. Codec Selection

Four video codecs are now supported:

**H.264 (libx264)** - Default
- Best compatibility across all devices and browsers
- Fast encoding speed
- Good compression ratio
- Outputs: MP4

**H.265/HEVC (libx265)**
- Better compression than H.264 (~25-50% smaller files)
- Slower encoding speed
- Not universally supported (newer devices only)
- Outputs: MP4

**VP9 (libvpx-vp9)**
- Open-source codec by Google
- Good compression, similar to H.265
- Moderate encoding speed
- Outputs: WebM

**AV1 (libaom-av1)**
- Newest codec with best compression
- Extremely slow encoding (can be 10x slower than H.264)
- Growing browser support
- Outputs: MP4

## Technical Implementation

### Target Size Calculation

The application now:
1. Detects video duration when a file is uploaded
2. Calculates required video bitrate based on:
   - Target file size (user input)
   - Video duration
   - Reserved audio bitrate (128kbps)
3. Applies calculated bitrate during compression

**Formula:**
```
Audio Bytes = (128 kbps * Duration) / 8
Video Bytes = Target Size - Audio Bytes
Video Bitrate = (Video Bytes * 8) / Duration / 1000
```

### FFmpeg Command Building

The `buildFFmpegCommand()` function dynamically constructs FFmpeg arguments based on:
- Selected codec
- Compression mode (quality vs target size)
- Quality preset (if quality mode)
- Target size (if target size mode)

**Example Commands:**

Quality Mode (H.264, Medium):
```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 32 -preset fast -vf scale=1280:-2 -c:a aac -b:a 128k -movflags +faststart output.mp4
```

Target Size Mode (50MB, H.265):
```bash
ffmpeg -i input.mp4 -c:v libx265 -b:v 2500k -maxrate 3750k -bufsize 5000k -c:a aac -b:a 128k -movflags +faststart output.mp4
```

## UI Updates

### New UI Elements

1. **Mode Toggle** - Two buttons to switch between compression modes
2. **Target Size Input** - Number input with MB/KB dropdown
3. **Codec Dropdown** - Select from 4 codec options with descriptions
4. **Help Text** - Explanatory text under each setting
5. **Dynamic Content** - Quality/Target Size panels toggle visibility

### Styling

All new elements match the existing premium design:
- Purple glassmorphic styling
- Smooth hover animations
- Focus states with purple glow
- Responsive layout

## Files Modified

1. **index.html** - Added mode toggle, target size input, codec select
2. **styles.css** - Added 123 lines of styles for new components
3. **app.js** - Added 150+ lines including:
   - Video duration detection
   - Target size calculation
   - Bitrate calculation
   - Dynamic FFmpeg command building
   - Codec configuration
   - Mode switching logic

## Usage Examples

### Example 1: Compress to 50MB
1. Upload video
2. Switch to "Target Size" mode
3. Enter "50" MB as target size
4. Select codec (e.g., H.264 for compatibility)
5. Click "Compress Video"
6. Download result (~50MB output)

### Example 2: Maximum Compression with AV1
1. Upload video
2. Keep "Quality-Based" mode
3. Select "Maximum" preset
4. Choose "AV1" codec
5. Click "Compress Video"
6. Download result (smallest possible size, but very slow encoding)

### Example 3: Quick Compression for Sharing
1. Upload video
2. Target Size mode
3. Set to 25MB
4. Use H.264 codec
5. Compress and share

## Browser Compatibility

All features work in modern browsers with WebAssembly support:
- Chrome 57+
- Firefox 52+
- Safari 11+
- Edge 16+

**Note:** AV1 and H.265 encoding may be slower on some systems due to codec complexity.

## Performance Considerations

- **H.264**: Fastest, good for everyday use
- **H.265**: 2-3x slower than H.264, better compression
- **VP9**: 3-5x slower than H.264, good for web
- **AV1**: 10-20x slower than H.264, best compression

Target size compression requires video duration detection, which adds ~100-500ms to initial upload processing.

## Future Enhancements (Potential)

- Two-pass encoding for more accurate target size
- Custom resolution input
- Frame rate adjustment
- Codec-specific advanced options
- Batch processing
- Progress time estimates
