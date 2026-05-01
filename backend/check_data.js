const sql = require('mssql/msnodesqlv8');
const config = {
    server: 'localhost',
    database: 'InventoryManagementSystemDB',
    driver: 'ODBC Driver 17 for SQL Server',
    options: { trustedConnection: true }
};
async function run() {
    const pool = await sql.connect(config);
    
    const p = await pool.request().query("SELECT TOP 5 ProductName, SKU FROM Products");
    console.log('Sample Products:', p.recordset);
    
    const c = await pool.request().query("SELECT TOP 5 CustomerName, Email FROM Customers");
    console.log('Sample Customers:', c.recordset);
    
    const s = await pool.request().query("SELECT TOP 5 SupplierName, Email FROM Suppliers");
    console.log('Sample Suppliers:', s.recordset);
    
    process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
