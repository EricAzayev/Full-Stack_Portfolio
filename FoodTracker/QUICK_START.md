# 🎯 Quick Start - Build Your FoodTracker .exe

Follow these steps to create a Windows desktop application:

## ✅ Step-by-Step Instructions

### 1️⃣ Install Dependencies (if not already done)
```bash
npm install
cd server
npm install
cd ..
```

### 2️⃣ Build the Frontend
```bash
npm run build
```
**Expected Output:**
```
✓ 44 modules transformed.
dist/index.html
dist/assets/index-*.css
dist/assets/index-*.js
✓ built in ~600ms
```

### 3️⃣ Test in Electron (Optional but Recommended)
```bash
npm run dev:electron
```
- A window should open with your app
- Check that everything works correctly
- Close the window when done

### 4️⃣ Build the Executable
```bash
npm run build:app
```
**This will:**
- ✅ Build the frontend
- ✅ Package the backend
- ✅ Create Windows installer
- ⏱ Takes 1-2 minutes

**Expected Output:**
```
• electron-builder  version=...
• building        target=nsis file=release/FoodTracker Setup 1.0.0.exe
```

### 5️⃣ Find Your App
```
📁 release/
   └── FoodTracker Setup 1.0.0.exe  ← This is your app!
```

### 6️⃣ Install and Run
1. Double-click `FoodTracker Setup 1.0.0.exe`
2. Follow the installation wizard
3. Launch FoodTracker from your Start Menu or Desktop

## 🎉 Done!

Your app now:
- ✅ Runs completely offline
- ✅ Opens in a native window (not a browser)
- ✅ Stores data locally on the computer
- ✅ Works like any other desktop app

## 🚨 Common Issues

**Error: "Cannot find dist/index.html"**
- Solution: Run `npm run build` first

**Error: "Port 3001 already in use"**
- Solution: Close any running instances of the server or Electron app

**Blank window when opening app**
- Solution: Make sure `dist/` folder exists and has files
- Run `npm run build` again

**Changes not showing up**
- Solution: Always rebuild before testing:
  ```bash
  npm run build
  npm run dev:electron
  ```

## 📤 Sharing Your App

To give your app to others:
1. Copy `release/FoodTracker Setup 1.0.0.exe`
2. Send to anyone with Windows
3. They install it like any other program
4. No Node.js or development tools required!

## 🔄 Making Updates

When you change your code:
1. Make your changes in `client/` or `server/`
2. Rebuild: `npm run build:app`
3. New installer created in `release/`
4. Users install new version over old one

---

**Need help?** Check `ELECTRON_SETUP.md` for detailed documentation.
