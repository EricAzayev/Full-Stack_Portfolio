import fs from 'fs';
import path from 'path';

const projects = [
    { name: 'Rising Economies', path: '../RisingEconomies' },
    { name: 'UnEarthed Series #1', path: '../UnEarthed_Series/UnEarthed_1' },
    { name: 'UnEarthed Series #2', path: '../UnEarthed_Series/UnEarthed_2' },
    { name: 'UnEarthed Series #3', path: '../UnEarthed_Series/UnEarthed_3' },
    { name: 'UnEarthed Series #4', path: '../UnEarthed_Series/4_UnEarthed_4' },
    { name: 'Community Board', path: '../Web102/CommunityBoard' },
    { name: 'Creatorverse', path: '../Web102/Creatorverse' },
    { name: 'Crypto Hustle', path: '../Web102/Crypto-Hustle' },
    { name: 'Crypto WatchList', path: '../Web102/CryptoWatchList' },
    { name: 'Flashcards', path: '../Web102/Flashcards' },
    { name: 'HTML Scraper', path: '../Web102/HTML_Scraper' },
    { name: 'The Daily Dog Gazette', path: '../Web102/TheDailyDogGazette' },
    { name: 'User Profiles', path: '../Web102/UserProfiles' },
    { name: 'Weatherstack', path: '../Web102/Weatherstack' },
    { name: 'Drink Maker Lab', path: '../Web102/lab3-DrinkMaker' },
    { name: 'RPG Chess', path: '../Chess/RPGChess' }
];

const basePath = 'c:\\Users\\G\\ProjectTests\\proj\\HugeAsk\\Full-Stack_Portfolio\\dashboard';

function getDependencies(dirPath) {
    let deps = {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-router-dom": "^6.20.0"
    };

    // Quick scan of src/ folder for specific imports
    const srcDir = path.join(dirPath, 'src');
    if (fs.existsSync(srcDir)) {
        const files = function traverse(dir) {
            let results = [];
            const list = fs.readdirSync(dir);
            list.forEach(file => {
                const full = path.join(dir, file);
                const stat = fs.statSync(full);
                if (stat && stat.isDirectory()) results = results.concat(traverse(full));
                else if (full.endsWith('.jsx') || full.endsWith('.js')) results.push(full);
            });
            return results;
        }(srcDir);

        let content = '';
        files.forEach(f => {
            content += fs.readFileSync(f, 'utf8') + '\n';
        });

        if (content.includes('@supabase/supabase-js')) deps['@supabase/supabase-js'] = '^2.39.0';
        if (content.includes('axios')) deps['axios'] = '^1.6.2';
        if (content.includes('chart.js')) deps['chart.js'] = '^4.4.1';
        if (content.includes('react-chartjs-2')) deps['react-chartjs-2'] = '^5.2.0';
        if (content.includes('framer-motion')) deps['framer-motion'] = '^10.16.5';
        if (content.includes('react-spinners')) deps['react-spinners'] = '^0.13.8';
        if (content.includes('react-icons')) deps['react-icons'] = '^4.12.0';
    }
    return deps;
}

const viteConfigContent = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})`;

console.log("Generating configurations for 16 projects...");

for (const p of projects) {
    const fullPath = path.resolve(basePath, p.path);
    if (!fs.existsSync(fullPath)) continue;

    const pkgJsonPath = path.join(fullPath, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) {
        const deps = getDependencies(fullPath);
        const pkgJson = {
            "name": p.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            "version": "0.0.0",
            "private": true,
            "type": "module",
            "scripts": {
                "dev": "vite",
                "build": "vite build",
                "preview": "vite preview"
            },
            "dependencies": deps,
            "devDependencies": {
                "@vitejs/plugin-react": "^4.2.1",
                "vite": "^5.0.8"
            }
        };

        fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2), 'utf8');
        console.log(`✅ Wrote package.json for ${p.name}`);
    }

    const vitePath = path.join(fullPath, 'vite.config.js');
    if (!fs.existsSync(vitePath)) {
        fs.writeFileSync(vitePath, viteConfigContent, 'utf8');
        console.log(`✅ Wrote vite.config.js for ${p.name}`);
    }
}
console.log("Done generating all configurations!");
