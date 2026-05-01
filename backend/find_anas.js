const sql = require('mssql/msnodesqlv8');
const config = {
  server: 'localhost',
  database: 'InventoryManagementSystemDB',
  driver: 'ODBC Driver 17 for SQL Server',
  options: { trustedConnection: true }
};
sql.connect(config).then(async pool => {
  const r = await pool.request().query("SELECT * FROM Users WHERE FullName LIKE '%Anas%' OR Username LIKE '%Anas%'");
  console.log(r.recordset);
  process.exit(0);
}).catch(console.error);
