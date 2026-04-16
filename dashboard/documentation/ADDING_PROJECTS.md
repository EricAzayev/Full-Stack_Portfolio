# Adding New Projects to the Dashboard

This guide explains how to add new projects to the portfolio dashboard and deploy them to Vercel.

## Overview

The dashboard serves individual projects from `public/projects/{project-id}/`. When you add a new project, you need to:
1. Define the project metadata
2. Build the project
3. Copy it to the dashboard
4. Deploy to Vercel

## Step-by-Step Instructions

### 1. Add Project Metadata

Edit `dashboard/server/projects.js` and add your new project to the `projects` array:

```javascript
{
  id: 'my-new-project',           // URL-friendly identifier (lowercase, hyphens)
  name: 'My New Project',         // Display name
  category: 'Frontend',           // 'Frontend' or 'Full-Stack'
  description: 'Brief description of what the project does',
  path: '../Web102/MyNewProject', // Relative path from dashboard folder
  port: null,                     // Server port (if has backend) or null
  clientPort: 5180,               // Dev server port
  hasServer: false,               // true if project has backend API
  hasClient: true,                // true if project has frontend
  techStack: ['React', 'Vite', 'CSS3'],  // Technologies used
  features: [                     // Key features (3-5 bullet points)
    'Feature 1',
    'Feature 2',
    'Feature 3'
  ],
  thumbnail: '🚀',                // Emoji icon
  highlight: false                // Optional: set true to highlight card
}
```

**Important:** The `id` field must be URL-friendly (lowercase, no spaces, use hyphens).

### 2. Build Your New Project

Navigate to your project folder and build it:

```powershell
# Navigate to your project
cd Web102/MyNewProject  # Adjust path as needed

# Install dependencies (if not done already)
npm install

# Create production build
npm run build
```

This creates a `dist` folder with the compiled project files.

### 3. Copy Projects to Dashboard

From the dashboard folder, run the copy script:

```powershell
# Navigate to dashboard
cd ../../dashboard

# Copy all built projects to public/projects/
npm run copy-projects
```

This script:
- Reads all projects from `server/projects.js`
- Finds their `dist` folders based on the `path` property
- Copies each `dist` folder to `public/projects/{project-id}/`
- Shows a summary of copied vs. skipped projects

### 4. Test Locally (Optional but Recommended)

Before deploying, test that everything works:

```powershell
# Start the dev server
npm run dev

# Visit http://localhost:5173
# Check that your new project appears in the dashboard
# Click "Open" to verify it loads correctly
```

### 5. Commit and Deploy

```powershell
# Add all changes (metadata + built files)
git add dashboard/

# Commit with descriptive message
git commit -m "Add new project: My New Project"

# Push to GitHub
git push

# Deploy to Vercel production
vercel --prod
```

The deployment will:
- Auto-detect Vite framework
- Build the dashboard (if needed)
- Deploy all files including `public/projects/`
- Update the live URL

## Quick Reference

```powershell
# Full workflow from project folder
cd path/to/new/project
npm install && npm run build

cd ../../dashboard
npm run copy-projects
git add .
git commit -m "Add project: [Name]"
git push
vercel --prod
```

## Important Notes

### Project Requirements
- Must have `vite.config.js` and `package.json`
- Must use Vite as build tool
- `npm run build` must create a `dist` folder
- Must be a static site (frontend only) or have separate backend deployment

### Built Files in Git
Currently, built project files in `dashboard/public/projects/` are committed to git. This is necessary because:
- The source projects' `dist` folders aren't in git
- Vercel needs the built files available during deployment
- The `vercel-build` script relies on files being present

### Backend Projects
Projects with `hasServer: true` will have their frontend included, but backend APIs won't work on Vercel without additional setup:
- Backend must be deployed separately (Vercel Serverless Functions, Railway, Render, etc.)
- Update API endpoints in frontend to point to deployed backend
- Or convert backend endpoints to Vercel Serverless Functions in `dashboard/api/`

### Troubleshooting

**Project shows "Not Built":**
- Check that the project's `dist` folder exists
- Run `npm run copy-projects` from dashboard folder
- Verify `public/projects/{project-id}/index.html` exists

**Project link returns 404 on Vercel:**
- Ensure the project was copied before deploying
- Check `vercel.json` has the correct routing rules
- Verify the project `id` in `projects.js` matches the folder name in `public/projects/`

**API endpoint not working:**
- Check `dashboard/api/projects.js` is present
- Verify `vercel.json` has API routing enabled
- Check Vercel deployment logs for errors

## File Structure

```
dashboard/
├── api/
│   └── projects.js              # Serverless function for project list
├── public/
│   └── projects/                # Built projects copied here
│       ├── project-1/
│       │   ├── index.html
│       │   └── assets/
│       ├── project-2/
│       └── ...
├── server/
│   └── projects.js              # Project metadata (edit this!)
├── src/
├── copy-projects.js             # Script to copy built projects
├── package.json
└── vercel.json                  # Vercel routing configuration
```

## Scripts Reference

- `npm run dev` - Start local development server
- `npm run build` - Build dashboard only
- `npm run copy-projects` - Copy all project builds to public/
- `npm run vercel-build` - Full build for Vercel (copies + builds)

## Contact

For issues or questions, refer to the main README.md or dashboard documentation.
