import fs from 'fs';
import path from 'path';
import { projects } from './projects.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

for (const p of projects) {
    const vitePath = path.resolve(__dirname, '../', p.path, 'vite.config.js');
    if (fs.existsSync(vitePath)) {
        let content = fs.readFileSync(vitePath, 'utf8');
        if (!content.includes('base:')) {
            content = content.replace('plugins: [react()],', 'plugins: [react()],\n  base: \\'./\\',');
            fs.writeFileSync(vitePath, content, 'utf8');
            console.log('Fixed', p.name);
        }
    }
}
