const sql = require('mssql/msnodesqlv8');
const config = {
    server: 'localhost',
    database: 'InventoryManagementSystemDB',
    driver: 'ODBC Driver 17 for SQL Server',
    options: { trustedConnection: true }
};
async function check() {
    const pool = await sql.connect(config);
    // Check Invoices schema
    const r = await pool.request().query("SELECT TOP 1 * FROM Invoices");
    console.log('Invoices columns:', Object.keys(r.recordset[0] || {}));
    console.log('Sample row:', r.recordset[0]);
    
    // Check if SalesOrders table has auto-increment
    const so = await pool.request().query("SELECT TOP 1 * FROM SalesOrders ORDER BY SalesOrderID DESC");
    console.log('\nLatest SalesOrder:', so.recordset[0]);
    process.exit(0);
}
check().catch(e => { console.error(e.message); process.exit(1); });
