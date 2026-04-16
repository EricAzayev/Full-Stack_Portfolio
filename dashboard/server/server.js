import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { projects } from './projects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dashboardDir = path.resolve(__dirname, '..');

const app = express();
app.use(cors());
app.use(express.json());

// Serve each project's built files from /projects/{id}
projects.forEach(project => {
  const distPath = path.resolve(dashboardDir, project.path, 'dist');
  
  if (fs.existsSync(distPath)) {
    // Serve static assets with correct MIME types
    app.use(`/projects/${project.id}`, express.static(distPath, {
      setHeaders: (res, filepath) => {
        if (filepath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (filepath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        }
      }
    }));
    
    // SPA fallback - return index.html for any route under this project
    app.get(`/projects/${project.id}/*`, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    
    console.log(`✅ Mounted: /projects/${project.id} -> ${distPath}`);
  }
});

// API endpoint to get projects
app.get('/api/projects', (req, res) => {
  const projectsWithStatus = projects.map(p => {
    const distPath = path.resolve(dashboardDir, p.path, 'dist');
    const isBuilt = fs.existsSync(distPath);
    return {
      ...p,
      built: isBuilt
    };
  });
  
  res.json({ 
    projects: projectsWithStatus,
    statuses: projectsWithStatus.map(p => ({ 
      id: p.id, 
      status: p.built ? 'available' : 'not-built'
    })) 
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🎯 Portfolio Dashboard running on http://localhost:${PORT}`);
  console.log(`📊 Serving ${projects.length} projects\n`);
});
