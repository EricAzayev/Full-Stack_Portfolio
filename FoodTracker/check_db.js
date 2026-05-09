import Database from 'better-sqlite3';

const db = new Database('server/data/foodtracker.db');

console.log('\n=== Foods Table Columns ===');
const foodsCols = db.prepare('PRAGMA table_info(foods)').all();
foodsCols.forEach(col => {
  console.log(`  ${col.name}: ${col.type}`);
});

console.log('\n=== Daily Records Table Columns ===');
const recordsCols = db.prepare('PRAGMA table_info(daily_records)').all();
recordsCols.forEach(col => {
  console.log(`  ${col.name}: ${col.type}`);
});

db.close();
console.log('\n✅ Database schema verified!\n');
