const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const path = require('path');

const cfg = {
  server: 'LAPTOP-8ASCIT8B',
  database: 'InventoryManagementSystemDB',
  driver: 'ODBC Driver 17 for SQL Server',
  options: { trustedConnection: true }
};

async function runMigration() {
  await sql.connect(cfg);
  console.log('Connected to DB, running migration...');

  const migrationSQL = fs.readFileSync(path.join(__dirname, 'migrate.sql'), 'utf8');
  
  // Split on GO statements and execute each batch
  const batches = migrationSQL.split(/^\s*GO\s*$/im).filter(b => b.trim().length > 0);
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i].trim();
    if (!batch || batch.startsWith('--') || batch.toUpperCase().startsWith('USE')) continue;
    try {
      await new sql.Request().query(batch);
      console.log(`Batch ${i + 1}/${batches.length} OK`);
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('There is already')) {
        console.log(`Batch ${i + 1} skipped (already exists)`);
      } else {
        console.error(`Batch ${i + 1} ERROR:`, e.message);
      }
    }
  }

  console.log('Migration complete!');
  process.exit(0);
}

runMigration().catch(e => {
  console.error('Migration failed:', e.message);
  process.exit(1);
});
