const sql = require('mssql/msnodesqlv8');
const config = {
    server: 'localhost',
    database: 'InventoryManagementSystemDB',
    driver: 'ODBC Driver 17 for SQL Server',
    options: { trustedConnection: true }
};
async function check() {
    const pool = await sql.connect(config);
    
    // Check what the dashboard stats query returns
    const stats = await pool.request().query(`
        SELECT
            (SELECT COUNT(*) FROM PurchaseOrders WHERE Status IN ('Pending', 'Approved', 'Partially Received')) AS activeShipments,
            (SELECT COUNT(*) FROM Invoices WHERE InvoiceStatus IN ('Unpaid', 'Partially Paid')) AS pendingInvoices,
            (SELECT COUNT(*) FROM Inventory WHERE Status != 'OPTIMAL') AS lowStockItems,
            (SELECT SUM(p.UnitPrice * i.QuantityOnHand) FROM Inventory i JOIN Products p ON i.ProductID = p.ProductID) AS totalValue
    `);
    console.log('Current stats:', stats.recordset[0]);

    // Check what maps to dashboard fields (totalStock, activeOrders, revenueYTD)
    const inv = await pool.request().query("SELECT COUNT(*) as cnt, SUM(QuantityOnHand) as total FROM Inventory");
    console.log('Inventory rows:', inv.recordset[0]);

    const orders = await pool.request().query("SELECT COUNT(*) as cnt, Status FROM SalesOrders GROUP BY Status");
    console.log('SalesOrders by status:', orders.recordset);

    const inv_cols = await pool.request().query("SELECT TOP 1 * FROM Inventory");
    console.log('Inventory columns:', Object.keys(inv_cols.recordset[0] || {}));
    console.log('Sample Inventory row:', inv_cols.recordset[0]);

    const today = await pool.request().query(`SELECT SUM(TotalAmount) as todayRevenue FROM Invoices WHERE CAST(InvoiceDate AS DATE) = CAST(GETDATE() AS DATE)`);
    console.log('Today revenue:', today.recordset[0]);

    process.exit(0);
}
check().catch(e => { console.error(e.message); process.exit(1); });
