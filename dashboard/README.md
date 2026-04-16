# 🎯 Full-Stack Portfolio Dashboard

A single-page dashboard showcasing all your Codepath 102 & 103 projects in one place.

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd dashboard
npm install

cd server
npm install
cd ..

# 2. Build all projects (first time only)
cd server
npm run build-projects
cd ..

# 3. Start the dashboard
npm start
```

Dashboard opens at **http://localhost:5173**

## How It Works

All projects are served from the **same port** (5173) under different routes:
- Dashboard: `http://localhost:5173/`
- Projects: `http://localhost:5173/projects/{project-id}/`

When you click "Open" on a project card, it opens in a new tab at `/projects/{id}/`.

## 🎨 Features

- **📊 Single Dashboard**: All projects in one place
- **🎮 One-Click Access**: Click to open any project
- **💻 No Port Juggling**: Everything runs on one port
- **🎭 Stylish UI**: Modern, dark-themed interface

## 📁 Project Structure

```
dashboard/
├── src/               # Dashboard frontend (React + Vite)
├── server/
│   ├── server.js      # Express server serving dashboard + projects
│   ├── projects.js    # Project metadata
│   └── build-all-projects.js  # Build script
└── vite.config.js
```

## 🛠️ Commands

```bash
# Start dashboard (dev mode)
npm start

# Build all projects with correct paths
cd server
npm run build-projects

# Add a new project
# Edit server/projects.js and add your project config
```

## 🎯 Adding New Projects

1. Edit `server/projects.js`
2. Add your project configuration
3. Run `npm run build-projects` from server folder
4. Restart dashboard

## 🐛 Troubleshooting

**"Project shows Not Built"**
- Run `npm run build-projects` from the server folder
- Make sure the project has a `vite.config.js`

**"Page loads but is blank"**
- Rebuild the project: `cd server && npm run build-projects`
- Check browser console for errors

---

**Built for Codepath coursework showcase**
