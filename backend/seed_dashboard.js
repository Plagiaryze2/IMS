const sql = require('mssql/msnodesqlv8');
const config = {
    server: 'localhost',
    database: 'InventoryManagementSystemDB',
    driver: 'ODBC Driver 17 for SQL Server',
    options: { trustedConnection: true }
};

async function seed() {
    const pool = await sql.connect(config);
    console.log('Connected. Seeding...\n');

    // ── 1. Boost Inventory quantities so "Live Inventory" shows a healthy number ──
    await pool.request().query(`
        UPDATE Inventory SET QuantityOnHand = FLOOR(RAND(CHECKSUM(NEWID())) * 200 + 50)
        WHERE QuantityOnHand < 50
    `);
    await pool.request().query(`
        UPDATE Inventory SET Status = 'OPTIMAL'
        WHERE QuantityOnHand > 50
    `);
    // Keep some items low-stock for realism
    await pool.request().query(`
        UPDATE TOP(6) Inventory 
        SET QuantityOnHand = FLOOR(RAND(CHECKSUM(NEWID())) * 15 + 2), Status = 'LOW'
        WHERE InventoryID IN (SELECT TOP 6 InventoryID FROM Inventory ORDER BY NEWID())
    `);
    const inv = await pool.request().query(`SELECT SUM(QuantityOnHand) as total, COUNT(*) as rows FROM Inventory`);
    console.log('✓ Inventory updated:', inv.recordset[0]);

    // ── 2. Ensure active (Pending) SalesOrders exist ──
    // Get customer IDs
    const custs = await pool.request().query(`SELECT TOP 5 CustomerID FROM Customers ORDER BY CustomerID`);
    const custIDs = custs.recordset.map(r => r.CustomerID);
    
    // Get products for line items
    const prods = await pool.request().query(`SELECT TOP 5 ProductID, UnitPrice FROM Products ORDER BY ProductID`);
    const products = prods.recordset;

    // Insert 10 pending SalesOrders for today
    for (let i = 0; i < 10; i++) {
        const cid = custIDs[i % custIDs.length];
        const amount = (Math.floor(Math.random() * 50 + 5) * 100).toFixed(2);
        await pool.request()
            .input('cid', sql.Int, cid)
            .input('amount', sql.Decimal(18, 2), parseFloat(amount))
            .query(`
                INSERT INTO SalesOrders (CustomerID, CreatedByUserID, OrderDate, Status, TotalAmount, ShippingAddress)
                VALUES (@cid, 8, GETDATE(), 'Pending', @amount, '123 Warehouse Road, Industrial Park')
            `);
    }
    const orders = await pool.request().query(`SELECT COUNT(*) as cnt FROM SalesOrders WHERE Status = 'Pending'`);
    console.log('✓ Pending SalesOrders:', orders.recordset[0]);

    // ── 3. Insert today's Paid Invoices for Daily Revenue ──
    for (let i = 0; i < 8; i++) {
        const cid = custIDs[i % custIDs.length];
        const amount = (Math.floor(Math.random() * 200 + 30) * 100).toFixed(2);
        await pool.request()
            .input('cid', sql.Int, cid)
            .input('amount', sql.Decimal(18, 2), parseFloat(amount))
            .query(`
                INSERT INTO Invoices (CustomerID, InvoiceDate, DueDate, TotalAmount, InvoiceStatus)
                VALUES (@cid, GETDATE(), DATEADD(day, 30, GETDATE()), @amount, 'Paid')
            `);
    }
    const rev = await pool.request().query(`
        SELECT ISNULL(SUM(TotalAmount), 0) as todayRevenue 
        FROM Invoices 
        WHERE CAST(InvoiceDate AS DATE) = CAST(GETDATE() AS DATE) AND InvoiceStatus = 'Paid'
    `);
    console.log('✓ Today\'s revenue: $' + rev.recordset[0].todayRevenue);

    // ── 4. Add SystemLogs for M.Anas linked to today's orders ──
    const logs = [
        { type: 'SYNC', msg: 'Processed 10 new sales orders for today\'s dispatch queue.' },
        { type: 'INFO', msg: 'Inventory health check: 6 items flagged below reorder threshold.' },
        { type: 'SYNC', msg: 'Daily revenue reconciliation completed successfully.' },
    ];
    for (const log of logs) {
        await pool.request()
            .input('type', sql.NVarChar, log.type)
            .input('msg', sql.NVarChar, log.msg)
            .input('uid', sql.Int, 8)
            .query(`INSERT INTO SystemLogs (LogType, Message, UserID) VALUES (@type, @msg, @uid)`);
    }
    console.log('✓ SystemLogs added for M.Anas (UserID 8)');

    console.log('\n✅ Seeding complete!');
    process.exit(0);
}

seed().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
