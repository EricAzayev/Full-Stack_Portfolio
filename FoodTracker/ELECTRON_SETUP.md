# FoodTracker Desktop App

A fully local Windows desktop application for tracking your daily food intake and nutrition goals.

## 🚀 Features

- **Fully Offline**: All data stored locally as JSON files
- **Native Desktop App**: Runs as a Windows executable (.exe)
- **React Frontend**: Modern UI built with React and Vite
- **Express Backend**: Node.js backend for data management
- **No Browser Required**: Opens in a native Electron window

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

## 🛠 Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies (includes Electron)
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Run in Development Mode

#### Option A: Run Frontend and Backend Separately (Web Version)
```bash
# Terminal 1: Start the backend
cd server
npm start

# Terminal 2: Start the frontend
npm run dev
```

#### Option B: Run as Electron App (Desktop Version)
```bash
# Build the frontend first
npm run build

# Run the Electron app
npm run dev:electron
```

## 📦 Building the Desktop App (.exe)

### Step 1: Build the Frontend
```bash
npm run build
```

This compiles your React app into static files in the `dist/` folder.

### Step 2: Build the Electron App
```bash
npm run build:app
```

This will:
1. Build the Vite frontend
2. Package everything with Electron
3. Create a Windows installer

### Output

Your executable will be in:
```
release/FoodTracker Setup 1.0.0.exe
```

## 📁 Project Structure

```
FoodTracker/
├── client/              # React frontend source
│   ├── components/      # React components
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # React entry point
│   └── style.css       # Styles
├── server/              # Express backend
│   ├── data/           # JSON data storage
│   ├── routes/         # API routes
│   └── server.js       # Express server
├── electron/            # Electron configuration
│   ├── main.cjs        # Electron main process
│   └── dataPath.js     # Data path helper
├── dist/                # Built frontend (generated)
├── release/             # Built executables (generated)
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
└── package.json        # Project configuration
```

## 🔧 How It Works

### Electron Main Process (`electron/main.cjs`)
- Starts the Express backend automatically
- Creates a native window using Chromium
- Loads the built React frontend
- Handles app lifecycle events

### Express Backend (`server/server.js`)
- Exports a `startServer()` function for Electron
- Serves API endpoints for food tracking
- Reads/writes JSON files for data storage
- Can still run standalone with `npm start`

### React Frontend (`client/`)
- Built with Vite for fast development
- Communicates with backend via fetch API
- Displays in Electron window instead of browser

## 📝 NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run Vite dev server (web version) |
| `npm run dev:electron` | Run Electron app in development |
| `npm run build` | Build frontend to `dist/` |
| `npm run build:app` | Build complete desktop app (.exe) |
| `npm run preview` | Preview built frontend |

## 🗂 Data Storage

In the packaged app, data files are stored in:
```
%APPDATA%/FoodTracker/data/
```

This ensures your data persists between app updates and uninstalls.

## 🐛 Troubleshooting

### "Cannot find module" errors
Make sure you've installed dependencies in both root and server:
```bash
npm install
cd server && npm install
```

### Electron window opens but shows blank screen
1. Make sure you've built the frontend: `npm run build`
2. Check that `dist/index.html` exists
3. Look for errors in the Electron DevTools (enabled in development)

### Backend not starting
Check the Electron console output for server startup messages:
```
✅ Express server started successfully
🚀 Server listening on http://localhost:3001
```

### Changes not appearing in built app
Always rebuild before testing:
```bash
npm run build
npm run dev:electron
```

## 🎯 Distribution

To share your app with others:

1. Build the installer:
   ```bash
   npm run build:app
   ```

2. Share the file:
   ```
   release/FoodTracker Setup 1.0.0.exe
   ```

3. Users can install it like any Windows app:
   - Double-click the installer
   - Follow installation prompts
   - Launch from Start Menu or Desktop shortcut

## 🔒 Security Notes

- The app runs entirely locally - no internet required
- All data stored on the user's computer
- No telemetry or external connections
- Context isolation enabled for security

## 📄 License

This project is private and not licensed for distribution.

## 🙏 Acknowledgments

Built with:
- [Electron](https://www.electronjs.org/) - Desktop app framework
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Frontend build tool
- [Express](https://expressjs.com/) - Backend framework
