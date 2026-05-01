const sql = require('mssql/msnodesqlv8');
const config = {
  server: 'localhost',
  database: 'InventoryManagementSystemDB',
  driver: 'ODBC Driver 17 for SQL Server',
  options: { trustedConnection: true }
};
sql.connect(config).then(async pool => {
  const r = await pool.request().query("SELECT u.UserID, u.Email, ro.RoleName FROM Users u LEFT JOIN UserRoles ur ON u.UserID = ur.UserID LEFT JOIN Roles ro ON ur.RoleID = ro.RoleID WHERE u.Email = 'acb@gmail.com'");
  console.log(r.recordset);
  
  const r2 = await pool.request().query("SELECT TOP 5 l.LogType, l.Message, u.Username FROM SystemLogs l LEFT JOIN Users u ON l.UserID = u.UserID WHERE l.LogType != 'SYSTEM' AND l.LogType != 'USER' ORDER BY CreatedAt DESC");
  console.log(r2.recordset);
  
  process.exit(0);
}).catch(console.error);
