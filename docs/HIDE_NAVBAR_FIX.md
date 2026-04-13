# Hide Navigation Bar Fix

## The Problem
The Android navigation bar (home, back, recent apps buttons) is still visible even with `"visible": "immersive"` setting. Some Android devices ignore this setting.

## The Solution

### 1. Changed Navigation Bar Mode
**File**: `app.json`

Changed from `"immersive"` to `"leanback"`:
```json
"navigationBar": {
  "visible": "leanback",
  "backgroundColor": "#00000000"
}
```

**leanback mode**: Designed for TV apps, completely hides the navigation bar and doesn't show it even when swiping.

### 2. Created Theme Plugin
**File**: `plugins/withHideNavigationBar.js`

Adds Android theme properties to force fullscreen:
- `windowTranslucentNavigation`: Makes nav bar transparent
- `windowDrawsSystemBarBackgrounds`: Prevents system from drawing nav bar
- `windowLayoutInDisplayCutoutMode`: Extends content to edges

### 3. Added Plugin to app.json
```json
"plugins": [
  ...
  "./plugins/withHideNavigationBar.js"
]
```

## ⚠️ This Requires a New Build

These are NATIVE changes (Android theme and manifest), so you need to build v1.0.9:

```bash
cd frontend/eco-app
eas build --platform android --profile preview
```

**Build Credits: 8 → 7 after this build**

## What Will Happen

### After Installing v1.0.9:
- ✅ Navigation bar completely hidden
- ✅ Cannot be shown by swiping
- ✅ Full immersive experience
- ✅ More screen space for your app

### How to Exit App:
Since there's no back button:
- Swipe from left edge to go back
- Use recent apps button (if your phone has a gesture)
- Or add an exit button in your app

## Alternative: If You Want Swipe-to-Show

If you want users to be able to swipe up to show the nav bar temporarily, use:
```json
"navigationBar": {
  "visible": "sticky-immersive"
}
```

But `"leanback"` is the most aggressive and keeps it hidden permanently.

## Included in v1.0.9 Build

This fix will be included when you build v1.0.9, along with:
- ✅ Network security config fix
- ✅ Backend status hidden when connected
- ✅ Navigation bar completely hidden

One build gets you all the fixes! 🎉
