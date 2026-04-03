import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { projects } from './server/projects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicProjectsDir = path.join(__dirname, 'public', 'projects');

// Create public/projects directory if it doesn't exist
if (!fs.existsSync(publicProjectsDir)) {
  fs.mkdirSync(publicProjectsDir, { recursive: true });
}

console.log('📦 Copying project builds to public/projects/...\n');

let copiedCount = 0;
let skippedCount = 0;

projects.forEach(project => {
  const distPath = path.resolve(__dirname, project.path, 'dist');
  const targetPath = path.join(publicProjectsDir, project.id);

  if (fs.existsSync(distPath)) {
    // Remove existing target if it exists
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true, force: true });
    }

    // Copy dist folder to public/projects/{id}
    fs.cpSync(distPath, targetPath, { recursive: true });
    console.log(`✅ ${project.name} -> public/projects/${project.id}`);
    copiedCount++;
  } else {
    console.log(`⏭️  ${project.name} - No dist folder (skipping)`);
    skippedCount++;
  }
});

console.log(`\n✨ Done! Copied ${copiedCount} projects, skipped ${skippedCount}`);
console.log('📝 Note: Projects with backend servers will need separate deployment\n');
