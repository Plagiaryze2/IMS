const sql = require('mssql/msnodesqlv8');
const config = {
    server: 'localhost',
    database: 'InventoryManagementSystemDB',
    driver: 'ODBC Driver 17 for SQL Server',
    options: { trustedConnection: true }
};
async function run() {
    const pool = await sql.connect(config);
    
    // Full Products schema
    const p = await pool.request().query("SELECT TOP 2 * FROM Products");
    console.log('Products columns:', Object.keys(p.recordset[0] || {}));
    console.log('Sample:', p.recordset);
    
    // Full Inventory schema
    const inv = await pool.request().query("SELECT TOP 2 * FROM Inventory");
    console.log('\nInventory columns:', Object.keys(inv.recordset[0] || {}));
    console.log('Sample:', inv.recordset);
    
    // Categories
    const cats = await pool.request().query("SELECT * FROM Categories");
    console.log('\nCategories:', cats.recordset);
    
    // Suppliers
    const supp = await pool.request().query("SELECT TOP 3 SupplierID, SupplierName FROM Suppliers");
    console.log('\nSuppliers sample:', supp.recordset);
    
    process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
