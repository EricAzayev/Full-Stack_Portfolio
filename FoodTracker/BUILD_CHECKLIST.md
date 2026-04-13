# ✅ Pre-Build Checklist

Run through this checklist before building your .exe:

## 📋 Verification Steps

### ✅ 1. Dependencies Installed
```bash
# Check root dependencies
npm list electron electron-builder
# Should show both packages installed

# Check server dependencies  
cd server
npm list express cors
cd ..
```

### ✅ 2. Frontend Builds Successfully
```bash
npm run build
```
**Expected:** 
- ✅ No errors
- ✅ `dist/` folder created
- ✅ `dist/index.html` exists
- ✅ `dist/assets/` contains CSS and JS files

### ✅ 3. Electron App Runs
```bash
npm run dev:electron
```
**Expected:**
- ✅ Console shows: "✅ Express server started successfully"
- ✅ Console shows: "🚀 Server listening on http://localhost:3001"
- ✅ Window opens with your app
- ✅ UI loads and works correctly
- ✅ No errors in console (cache warnings are OK)

### ✅ 4. File Structure Correct
```
FoodTracker/
├── ✅ electron/
│   ├── ✅ main.cjs
│   └── ✅ dataPath.js
├── ✅ server/
│   ├── ✅ server.js
│   ├── ✅ routes/
│   └── ✅ data/
├── ✅ dist/
│   ├── ✅ index.html
│   └── ✅ assets/
├── ✅ package.json (with "main": "electron/main.cjs")
└── ✅ vite.config.js
```

### ✅ 5. Configuration Files
Check these files exist and are correct:

**package.json:**
```json
{
  "main": "electron/main.cjs",
  "scripts": {
    "build:app": "npm run build && electron-builder"
  }
}
```

**vite.config.js:**
```javascript
{
  base: './',
  build: {
    outDir: 'dist'
  }
}
```

**electron/main.cjs:**
- ✅ Uses CommonJS (`require`)
- ✅ Imports server with `pathToFileURL`
- ✅ Calls `startServer()`
- ✅ Loads `dist/index.html`

### ✅ 6. Server Configuration
**server/server.js:**
- ✅ Exports `startServer` function
- ✅ Still works standalone
- ✅ Uses port 3001

## 🚀 Ready to Build?

If all checks pass, you're ready to build your .exe:

```bash
npm run build:app
```

This will:
1. ⏳ Build the frontend (~30 seconds)
2. ⏳ Package with Electron (~1-2 minutes)
3. ⏳ Create Windows installer
4. ✅ Output: `release/FoodTracker Setup 1.0.0.exe`

## 🐛 Common Pre-Build Issues

### Issue: "Cannot find module 'electron'"
**Solution:** Run `npm install` in root directory

### Issue: dist/ folder is empty or missing
**Solution:** Run `npm run build` first

### Issue: Electron window opens but is blank
**Solution:** 
1. Check `dist/index.html` exists
2. Verify `base: './'` in vite.config.js
3. Rebuild: `npm run build`

### Issue: Server doesn't start
**Solution:**
1. Check `server/server.js` exports `startServer`
2. Verify server dependencies: `cd server && npm install`
3. Test server standalone: `cd server && npm start`

### Issue: "Port 3001 already in use"
**Solution:**
1. Close any running instances
2. Kill process on port 3001:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   ```

## 📊 Expected Build Output

When build completes successfully:

```
release/
├── FoodTracker Setup 1.0.0.exe   ← This is your installer!
│   Size: ~150-200 MB
│
├── win-unpacked/                  ← Unpacked files (for testing)
│   ├── FoodTracker.exe
│   ├── resources/
│   │   ├── app.asar
│   │   └── ...
│   └── ...
│
└── builder-*.yaml                 ← Build metadata
```

## ✨ After Build

### Test the Installer
1. Double-click `FoodTracker Setup 1.0.0.exe`
2. Install the app
3. Run it from Start Menu
4. Verify everything works

### Share Your App
1. Copy `FoodTracker Setup 1.0.0.exe`
2. Share via email, USB, cloud storage, etc.
3. Recipients install like any Windows app
4. No additional software required!

---

**All checks passed?** Proceed with `npm run build:app` 🚀
