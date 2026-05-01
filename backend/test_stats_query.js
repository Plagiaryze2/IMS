const sql = require('mssql/msnodesqlv8');
const config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-8ASCIT8B;Database=InventoryManagementSystemDB;Trusted_Connection=yes;'
};

async function testStats() {
    try {
        const pool = await sql.connect(config);
        const db = pool;
        
        // 1. Core KPIs
        const kpis = await db.request().query(`
            SELECT
                (SELECT ISNULL(SUM(TotalAmount), 0) FROM Invoices WHERE InvoiceStatus IN ('Paid', 'Partially Paid')) AS totalRevenue,
                (SELECT ISNULL(SUM(TotalAmount), 0) FROM Invoices WHERE InvoiceStatus IN ('Unpaid', 'Partially Paid', 'Draft')) AS pendingRevenue,
                (SELECT COUNT(*) FROM SalesOrders WHERE Status IN ('Pending', 'Processing')) AS activeOrders,
                (SELECT ISNULL(SUM(p.UnitPrice * i.QuantityOnHand), 0) FROM Inventory i JOIN Products p ON i.ProductID = p.ProductID) AS inventoryValue
        `);
        console.log('KPIs:', kpis.recordset[0]);
        
        // 2. Top Products
        const topProducts = await db.request().query(`
            SELECT TOP 5 p.ProductName, SUM(ii.Quantity) as units, 
            CAST(SUM(ii.Quantity) * 100.0 / (SELECT ISNULL(SUM(Quantity), 1) FROM InvoiceItems) AS INT) as percentage
            FROM InvoiceItems ii
            JOIN Products p ON ii.ProductID = p.ProductID
            GROUP BY p.ProductName
            ORDER BY units DESC
        `);
        console.log('Top Products:', topProducts.recordset.length);

        // 3. Sales Trend (Last 15 Days)
        const salesTrend = await db.request().query(`
            SELECT CAST(InvoiceDate AS DATE) as day, SUM(TotalAmount) as value
            FROM Invoices
            WHERE InvoiceDate >= DATEADD(day, -15, GETDATE())
            GROUP BY CAST(InvoiceDate AS DATE)
            ORDER BY day
        `);
        const formattedTrend = salesTrend.recordset.map(r => ({
            name: new Date(r.day).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }),
            value: r.value
        }));
        console.log('Sales Trend:', formattedTrend.length);

        // 4. Category Distribution
        const categoryData = await db.request().query(`
            SELECT TOP 4 ISNULL(c.CategoryName, 'Uncategorized') as name, SUM(i.QuantityOnHand) as value
            FROM Inventory i
            JOIN Products p ON i.ProductID = p.ProductID
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            GROUP BY c.CategoryName
            ORDER BY value DESC
        `);
        console.log('Category Data:', categoryData.recordset.length);

        // 5. Low Velocity Items (High stock, low sales)
        const lowVelocity = await db.request().query(`
            SELECT TOP 5 p.SKU, p.ProductName as name, ISNULL(c.CategoryName, 'Uncategorized') as cat, i.QuantityOnHand as qty, 
                   (p.UnitPrice * i.QuantityOnHand) as value
            FROM Inventory i
            JOIN Products p ON i.ProductID = p.ProductID
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            LEFT JOIN InvoiceItems ii ON p.ProductID = ii.ProductID
            GROUP BY p.SKU, p.ProductName, c.CategoryName, i.QuantityOnHand, p.UnitPrice
            ORDER BY SUM(ISNULL(ii.Quantity, 0)) ASC, i.QuantityOnHand DESC
        `);
        console.log('Low Velocity:', lowVelocity.recordset.length);

        console.log('ALL QUERIES SUCCESSFUL');
        await pool.close();
    } catch (e) {
        console.error('ERROR IN QUERIES:', e.message);
    }
}
testStats();
