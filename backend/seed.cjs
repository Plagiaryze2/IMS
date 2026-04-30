const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const path = require('path');

const cfg = {
  server: 'LAPTOP-8ASCIT8B',
  database: 'InventoryManagementSystemDB',
  driver: 'ODBC Driver 17 for SQL Server',
  options: { trustedConnection: true }
};

async function runSeed() {
  await sql.connect(cfg);
  console.log('Connected to DB, seeding professional data...');

  const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
  const batches = seedSQL.split(/^\s*GO\s*$/im).filter(b => b.trim().length > 0);
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i].trim();
    if (!batch || batch.toUpperCase().startsWith('USE')) continue;
    try {
      await new sql.Request().query(batch);
      console.log(`Batch ${i + 1}/${batches.length} OK`);
    } catch (e) {
      console.error(`Batch ${i + 1} ERROR:`, e.message);
    }
  }

  console.log('Seeding complete! Admin panel will now look highly professional.');
  process.exit(0);
}

runSeed().catch(e => {
  console.error('Seeding failed:', e.message);
  process.exit(1);
});
