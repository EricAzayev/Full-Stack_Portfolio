import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { projects } from './projects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildAll() {
    const logStream = fs.createWriteStream('build-errors.log', { flags: 'w' });

    for (const p of projects) {
        if (p.id === 'pelmeni-clicker' || p.id === 'food-tracker') continue;

        const fullPath = path.resolve(__dirname, '../', p.path);
        if (!fs.existsSync(fullPath)) continue;

        const pkgPath = path.join(fullPath, 'package.json');
        if (!fs.existsSync(pkgPath)) continue;

        const distPath = path.join(fullPath, 'dist');
        if (fs.existsSync(distPath)) {
            console.log(`Skipping ${p.name} (dist already exists)`);
            continue;
        }

        console.log(`\n=== Processing: ${p.name} ===`);
        logStream.write(`\n=== Processing: ${p.name} ===\n`);

        try {
            console.log('> Running npm install...');
            execSync('npm install --no-fund --no-audit', { cwd: fullPath, stdio: 'pipe' });
            console.log('> Running npm run build...');
            execSync('npm run build', { cwd: fullPath, stdio: 'pipe' });
            console.log(`✅ Build successful for ${p.name}!`);
        } catch (err) {
            console.error(`Failed for ${p.name}`);
            logStream.write(`ERROR in ${p.name}:\n${err.stdout?.toString()}\n${err.stderr?.toString()}\n`);
        }
    }

    logStream.end();
    console.log('\nMass build script complete!');
}

buildAll();
