const sql = require('mssql/msnodesqlv8');
const config = {
    server: 'localhost',
    database: 'InventoryManagementSystemDB',
    driver: 'ODBC Driver 17 for SQL Server',
    options: { trustedConnection: true }
};

async function seed() {
    const pool = await sql.connect(config);
    console.log('Connected. Seeding invoices...\n');

    // Get today's SalesOrders that don't have invoices yet
    const todayOrders = await pool.request().query(`
        SELECT TOP 8 so.SalesOrderID, so.CustomerID, so.TotalAmount
        FROM SalesOrders so
        LEFT JOIN Invoices i ON so.SalesOrderID = i.SalesOrderID
        WHERE CAST(so.OrderDate AS DATE) = CAST(GETDATE() AS DATE)
          AND i.InvoiceID IS NULL
        ORDER BY so.SalesOrderID DESC
    `);
    console.log(`Found ${todayOrders.recordset.length} un-invoiced orders for today`);

    for (const order of todayOrders.recordset) {
        await pool.request()
            .input('soid', sql.Int, order.SalesOrderID)
            .input('cid', sql.Int, order.CustomerID)
            .input('amount', sql.Decimal(18, 2), parseFloat(order.TotalAmount))
            .query(`
                INSERT INTO Invoices (SalesOrderID, CustomerID, InvoiceDate, DueDate, TotalAmount, InvoiceStatus)
                VALUES (@soid, @cid, GETDATE(), DATEADD(day, 30, GETDATE()), @amount, 'Paid')
            `);
    }

    const rev = await pool.request().query(`
        SELECT ISNULL(SUM(TotalAmount), 0) as todayRevenue, COUNT(*) as cnt
        FROM Invoices 
        WHERE CAST(InvoiceDate AS DATE) = CAST(GETDATE() AS DATE) AND InvoiceStatus = 'Paid'
    `);
    console.log("✓ Today's Paid Invoices:", rev.recordset[0]);

    // Verify final dashboard stats
    const stats = await pool.request().query(`
        SELECT
            (SELECT ISNULL(SUM(QuantityOnHand), 0) FROM Inventory) AS totalStock,
            (SELECT COUNT(*) FROM SalesOrders WHERE Status = 'Pending') AS activeOrders,
            (SELECT COUNT(*) FROM Inventory WHERE Status != 'OPTIMAL') AS lowStockItems,
            (SELECT ISNULL(SUM(TotalAmount), 0) FROM Invoices
                WHERE CAST(InvoiceDate AS DATE) = CAST(GETDATE() AS DATE)
                  AND InvoiceStatus = 'Paid') AS revenueYTD
    `);
    console.log('\n✅ Final Dashboard Stats:');
    console.log('  Live Inventory (total units):', stats.recordset[0].totalStock);
    console.log('  Active Orders (Pending):     ', stats.recordset[0].activeOrders);
    console.log('  Low Stock Alerts:            ', stats.recordset[0].lowStockItems);
    console.log('  Daily Revenue (today paid):  $', stats.recordset[0].revenueYTD);

    process.exit(0);
}

seed().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
