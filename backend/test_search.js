const sql = require('mssql/msnodesqlv8');
const config = {
    server: 'localhost',
    database: 'InventoryManagementSystemDB',
    driver: 'ODBC Driver 17 for SQL Server',
    options: { trustedConnection: true }
};

async function testSearch(q) {
    const like = `%${q}%`;
    const pool = await sql.connect(config);
    
    console.log(`\n--- Searching for: "${q}" ---`);
    
    const prod = await pool.request()
        .input('q', sql.NVarChar, like)
        .query(`SELECT TOP 4 ProductID as id, SKU, ProductName as title, 'Product' as type FROM Products WHERE SKU LIKE @q OR ProductName LIKE @q`);
    console.log('Products:', prod.recordset);

    const cust = await pool.request()
        .input('q', sql.NVarChar, like)
        .query(`SELECT TOP 4 CustomerID as id, Email as SKU, CustomerName as title, 'Customer' as type FROM Customers WHERE CustomerName LIKE @q OR Email LIKE @q`);
    console.log('Customers:', cust.recordset);

    const supp = await pool.request()
        .input('q', sql.NVarChar, like)
        .query(`SELECT TOP 3 SupplierID as id, Email as SKU, SupplierName as title, 'Supplier' as type FROM Suppliers WHERE SupplierName LIKE @q OR Email LIKE @q`);
    console.log('Suppliers:', supp.recordset);

    process.exit(0);
}

testSearch('elect').catch(e => { console.error('ERROR:', e.message); process.exit(1); });
