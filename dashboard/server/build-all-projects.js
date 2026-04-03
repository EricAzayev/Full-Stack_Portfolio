// Script to build all projects with correct base paths for dashboard serving
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { projects } from './projects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏗️  Building projects for dashboard...\n');

async function buildProject(project) {
  // Resolve from dashboard folder (one level up from server)
  const dashboardDir = path.resolve(__dirname, '..');
  const projectPath = path.resolve(dashboardDir, project.path);
  const viteConfigPath = path.join(projectPath, 'vite.config.js');
  
  // Check if project has vite.config.js
  if (!fs.existsSync(viteConfigPath)) {
    console.log(`⏭️  ${project.name}: No vite.config.js found, skipping...`);
    return { id: project.id, success: false, reason: 'No vite.config.js' };
  }

  // Check if package.json exists
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⏭️  ${project.name}: No package.json found, skipping...`);
    return { id: project.id, success: false, reason: 'No package.json' };
  }

  console.log(`🔨 Building ${project.name}...`);
  
  // Update vite.config.js to use correct base path
  let viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
  const basePathLine = `  base: '/projects/${project.id}/',`;
  
  if (!viteConfig.includes(`base:`)) {
    // Add base path to config
    viteConfig = viteConfig.replace(
      /export default defineConfig\(\{/,
      `export default defineConfig({\n${basePathLine}`
    );
    fs.writeFileSync(viteConfigPath, viteConfig);
  } else if (!viteConfig.includes(`'/projects/${project.id}/'`)) {
    // Update existing base path
    viteConfig = viteConfig.replace(
      /base:\s*['"][^'"]*['"]/,
      `base: '/projects/${project.id}/'`
    );
    fs.writeFileSync(viteConfigPath, viteConfig);
  }

  return new Promise((resolve) => {
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: projectPath,
      shell: true,
      stdio: 'inherit'
    });

    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${project.name} built successfully\n`);
        resolve({ id: project.id, success: true });
      } else {
        console.log(`❌ ${project.name} build failed (code ${code})\n`);
        resolve({ id: project.id, success: false, reason: `Exit code ${code}` });
      }
    });
  });
}

async function buildAll() {
  const results = [];
  
  for (const project of projects) {
    const result = await buildProject(project);
    results.push(result);
  }

  console.log('\n📊 Build Summary:');
  console.log('================');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log('\nFailed projects:');
    failed.forEach(f => console.log(`  - ${f.id}: ${f.reason || 'Unknown error'}`));
  }
}

buildAll().catch(console.error);
