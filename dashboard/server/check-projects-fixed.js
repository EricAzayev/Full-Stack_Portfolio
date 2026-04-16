import fs from 'fs';
import path from 'path';

const projects = [
    { name: 'Adirondack 46ers', path: '../Adirondack46ers' },
    { name: 'Rising Economies', path: '../RisingEconomies' },
    { name: 'Food Tracker', path: '../Exclusions/FoodTracker' },
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
    { name: 'Pelmeni Clicker', path: '../Web102/lab2-Pelmeni-Clicker/pelmeni-clicker' },
    { name: 'RPG Chess', path: '../Chess/RPGChess' }
];

const basePath = 'c:\\Users\\G\\ProjectTests\\proj\\HugeAsk\\Full-Stack_Portfolio\\dashboard';
let complete = []; let incomplete = [];

for (const p of projects) {
    const fullPath = path.resolve(basePath, p.path);
    if (!fs.existsSync(fullPath)) { incomplete.push(`${p.name} - Folder does not exist.`); continue; }

    const srcExists = fs.existsSync(path.join(fullPath, 'src'));
    const hasIndexHtml = fs.existsSync(path.join(fullPath, 'index.html'));

    let hasSourceFiles = false;
    if (srcExists) {
        const p1 = fs.readdirSync(path.join(fullPath, 'src'));
        if (p1.some(f => f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.tsx') || f.endsWith('.ts'))) hasSourceFiles = true;
    } else {
        const p2 = fs.readdirSync(fullPath);
        if (p2.some(f => (f.endsWith('.js') || f.endsWith('.jsx')) && !f.includes('config'))) hasSourceFiles = true;
    }

    const pkgExists = fs.existsSync(path.join(fullPath, 'package.json'));
    if ((hasSourceFiles || srcExists) && hasIndexHtml) {
        complete.push(`${p.name} - OK (Has Source/Index)${pkgExists ? '' : ' [Missing pkg config]'}`);
    } else {
        let issues = [];
        if (!srcExists && !hasSourceFiles) issues.push('No Source Code');
        if (!hasIndexHtml) issues.push('No index.html');
        incomplete.push(`${p.name} - INCOMPLETE: ${issues.join(' & ')}`);
    }
}

let out = "=== COMPLETE / SALVAGEABLE (Has Source Code) ===\n" + complete.map(c => '✅ ' + c).join('\n');
out += "\n\n=== INCOMPLETE (Missing Source Code) ===\n" + incomplete.map(c => '❌ ' + c).join('\n');

fs.writeFileSync('projects_report.txt', out, 'utf8');
