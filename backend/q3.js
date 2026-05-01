const sql = require('mssql/msnodesqlv8');
const config = {
  server: 'localhost',
  database: 'InventoryManagementSystemDB',
  driver: 'ODBC Driver 17 for SQL Server',
  options: { trustedConnection: true }
};
sql.connect(config).then(async pool => {
  const r2 = await pool.request().query("SELECT TOP 5 CONVERT(VARCHAR, l.CreatedAt, 108) as time, 'EVT-' + CAST(l.LogID AS VARCHAR) as id, l.Message as [desc], ISNULL(u.Username, 'SYSTEM') as op, CASE WHEN l.LogType = 'SYNC' THEN 'SYNC' WHEN l.LogType = 'ERROR' THEN 'ERR' ELSE 'INFO' END as status FROM SystemLogs l LEFT JOIN Users u ON l.UserID = u.UserID WHERE l.LogType != 'SYSTEM' AND l.LogType != 'USER' ORDER BY l.CreatedAt DESC");
  console.log(r2.recordset);
  
  process.exit(0);
}).catch(console.error);
