# Asset Generation Guide

## Required Assets for Cinematic Slider

This guide outlines the specific assets you need to create for the four star projects in the cinematic slider.

### Video Demos (Priority)

Create 12-20 second looping video demos for each star project:

#### 1. Food Tracker (`food-tracker-demo.mp4`)
**Capture Sequence:**
- Start with empty dashboard
- Click "Add Food" button
- Fill in food details (e.g., "Chicken Breast, 200g")
- Show charts updating in real-time
- Display macro breakdown (protein/carbs/fat)
- Loop back to dashboard view

**Recording Settings:**
- Resolution: 1920×1080 or 1280×720
- Format: MP4 (H.264 codec)
- Duration: 15 seconds
- FPS: 30fps
- Bitrate: 2-3 Mbps
- Audio: None (muted)

#### 2. RPG Chess (`rpg-chess-demo.mp4`)
**Capture Sequence:**
- Show initial chess board setup
- Display RPG stats on hover (HP, Attack, etc.)
- Make an opening move with animation
- Show piece capture with special effects
- Display stat changes from RPG mechanics
- Loop back to board

#### 3. Adirondack 46ers (`adirondack-demo.mp4`)
**Capture Sequence:**
- Show monthly calendar view
- Scroll through events
- Click on an event card
- Event details slide in
- Show mountain information
- Navigate back to calendar

#### 4. Rising Economies (`rising-economies-demo.mp4`)
**Capture Sequence:**
- Display country list/grid
- Click on a country (e.g., "India")
- Data visualization animates in
- Show interactive chart elements
- Hover over data points
- Return to country list

### Tools for Recording

**Recommended: OBS Studio**
1. Download: https://obsproject.com/
2. Settings → Video → Base Resolution: 1920×1080
3. Settings → Output → Recording Format: MP4
4. Settings → Output → Encoder: x264
5. Settings → Video → FPS: 30

**Alternative: Windows Game Bar**
- Press `Win + G` to open
- Click Record button
- Good for quick captures, less control

### Video Optimization

After recording, compress videos using **HandBrake**:

```
Settings:
- Preset: Web > Gmail Large 3 Minutes 720p30
- Framerate: 30fps Constant
- Quality: RF 22
- Remove audio track
```

**FFmpeg Command (Advanced):**
```bash
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 22 -vf scale=1280:720 -an output.mp4
```

### Static Thumbnails (Fallback)

Create high-quality screenshots as fallbacks:

**Format:** WebP with PNG fallback  
**Resolution:** 1200×675 (16:9)  
**Content:** Hero shot of main app view with data visible

**File Names:**
- `food-tracker.webp`
- `rpg-chess.webp`
- `adirondack46ers.webp`
- `rising-economies.webp`

### Current Status

The cinematic slider is **fully functional** without videos. It will:
- Show placeholder thumbnails (gradient backgrounds)
- Display all text content and stats
- Have working animations and interactions

Videos will enhance the experience but aren't required for launch.

### How to Add Assets

1. Record videos following the sequences above
2. Optimize videos with HandBrake
3. Place videos in: `public/assets/videos/`
4. Place thumbnails in: `public/assets/thumbnails/`

The app will automatically detect and use them!

### Testing Without Assets

The app works great as-is with:
- Gradient placeholders
- Emoji thumbnails for grid projects
- All animations and interactions functional

Create assets at your own pace - the UX is designed to degrade gracefully.
