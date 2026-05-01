const sql = require('mssql/msnodesqlv8');
const config = {
    server: 'localhost',
    database: 'InventoryManagementSystemDB',
    driver: 'ODBC Driver 17 for SQL Server',
    options: { trustedConnection: true }
};

async function inspect() {
    const pool = await sql.connect(config);

    // Check Products columns
    const p = await pool.request().query("SELECT TOP 1 * FROM Products");
    console.log('Products columns:', Object.keys(p.recordset[0] || {}));

    // Check Customers columns
    const c = await pool.request().query("SELECT TOP 1 * FROM Customers");
    console.log('Customers columns:', Object.keys(c.recordset[0] || {}));

    // Check Suppliers columns
    const s = await pool.request().query("SELECT TOP 1 * FROM Suppliers");
    console.log('Suppliers columns:', Object.keys(s.recordset[0] || {}));

    // Check SalesOrders columns
    const o = await pool.request().query("SELECT TOP 1 * FROM SalesOrders");
    console.log('SalesOrders columns:', Object.keys(o.recordset[0] || {}));

    process.exit(0);
}

inspect().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
