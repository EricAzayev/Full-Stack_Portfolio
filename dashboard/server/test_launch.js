import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { projects } from './projects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const id = 'community-board'; // let's try a simple frontend one
const project = projects.find(p => p.id === id);
const projectPath = path.resolve(__dirname, '../', project.path);

console.log(`Resolved Path: ${projectPath}`);

let startCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
let startArgs = ['run', 'start'];

const pkgJsonPath = path.join(projectPath, 'package.json');
if (fs.existsSync(pkgJsonPath)) {
    try {
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
        if (!pkg.scripts?.start && pkg.scripts?.dev) {
            startArgs = ['run', 'dev'];
        }
    } catch (e) { }
} else {
    const hasIndexHtml = fs.existsSync(path.join(projectPath, 'index.html'));
    const hasServerJs = fs.existsSync(path.join(projectPath, 'server', 'server.js')) || fs.existsSync(path.join(projectPath, 'server', 'index.js'));

    if (hasIndexHtml) {
        startCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
        if (hasServerJs) {
            startArgs = ['-y', 'concurrently', '"npx -y vite"', '"node server/server.js"'];
        } else {
            startArgs = ['-y', 'vite'];
        }
    } else if (hasServerJs) {
        startCmd = 'node';
        startArgs = ['server/server.js'];
    }
}

console.log(`Command: ${startCmd} ${startArgs.join(' ')}`);

const child = spawn(startCmd, startArgs, {
    cwd: projectPath,
    stdio: 'pipe',
    shell: true
});

child.stdout.on('data', d => console.log(`STDOUT: ${d}`));
child.stderr.on('data', d => console.error(`STDERR: ${d}`));
child.on('close', c => console.log(`Exited with ${c}`));
