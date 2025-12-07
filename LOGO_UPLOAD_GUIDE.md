# Logo Upload Guide

## Supported Image Formats ✅

Your platform accepts the following image formats for company logos:

### Recommended Formats:
- **JPG/JPEG** - Best for photographs and complex images
- **PNG** - Best for logos with transparency or sharp edges
- **WebP** - Modern format, smaller file sizes

### Also Supported:
- **GIF** - Animated or static images

## Image Specifications

### File Size:
- **Maximum:** 5MB per image
- **Recommended:** Under 1MB for faster loading
- Files larger than 5MB will be rejected with a helpful error message

### Dimensions:
- **Recommended:** Square format (e.g., 400×400px, 512×512px, or 1024×1024px)
- **Minimum:** 200×200px (for good quality)
- **Maximum:** No hard limit, but keep file size under 5MB

### Quality Tips:
1. **Use square images** - They display best in circular or square avatars
2. **Keep it simple** - Logos should be recognizable even at small sizes
3. **High contrast** - Ensure your logo looks good on both light and dark backgrounds
4. **No text-heavy logos** - Text should be readable at thumbnail sizes

## How Logo Upload Works

### In the Edit Modal:
1. Click "Upload Logo" button
2. Select your image file
3. **Instant preview** shows before saving
4. **Instant validation** alerts you if file is too large or wrong format
5. Save changes to update the logo

### In Add Startup Modal:
1. Fill in company details
2. Select logo image when adding the startup
3. Logo is uploaded along with company information

## Technical Details

### Backend Processing:
- Django's `ImageField` with Pillow handles image processing
- Images are stored in `/logos/` directory
- The backend automatically validates image integrity

### Frontend Validation (Client-Side):
✓ File type check (JPG, PNG, GIF, WebP)
✓ File size check (Max 5MB)
✓ Immediate user feedback with error messages
✓ Live preview before upload

### Display Optimization:
- `object-fit: cover` ensures images scale properly
- Graceful fallback to letter avatars if image fails to load
- Images work on both leaderboard (32×32px) and profile pages (80×80px)

## Common Issues & Solutions

### "File size too large"
- **Problem:** Image over 5MB
- **Solution:** Compress image using tools like:
  - [TinyPNG](https://tinypng.com/) - PNG compression
  - [CompressJPEG](https://compressjpeg.com/) - JPG compression
  - Or resize to smaller dimensions

### "Invalid file type"
- **Problem:** Unsupported format (e.g., BMP, TIFF, SVG)
- **Solution:** Convert to JPG, PNG, or WebP using:
  - Online converters
  - Image editing software (Photoshop, GIMP, etc.)
  - macOS Preview (Export As...)

### Logo appears stretched or cut off
- **Problem:** Non-square image dimensions
- **Solution:** Crop to square format before uploading

## Best Practices

1. **Use PNG for true logos** - Supports transparency, sharp edges
2. **Use JPG for photos** - Smaller file size for complex images  
3. **Test at different sizes** - View on leaderboard AND profile page
4. **Keep branding consistent** - Use same logo across all platforms
5. **Optimize before upload** - Reduce file size without quality loss

## Example File Sizes

| Dimensions | Format | Typical Size |
|------------|--------|--------------|
| 400×400px  | PNG    | 50-200KB     |
| 400×400px  | JPG    | 30-100KB     |
| 1024×1024px| PNG    | 200KB-1MB    |
| 1024×1024px| JPG    | 100-500KB    |

---

**Note:** Always preview your logo after upload to ensure it displays correctly!
