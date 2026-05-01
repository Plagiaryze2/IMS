const sql = require('mssql/msnodesqlv8');
const config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-8ASCIT8B;Database=InventoryManagementSystemDB;Trusted_Connection=yes;'
};

async function setupTracking() {
    try {
        const pool = await sql.connect(config);

        console.log('Creating DeliveryHistory table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'DeliveryHistory')
            BEGIN
                CREATE TABLE DeliveryHistory (
                    HistoryID INT IDENTITY(1,1) PRIMARY KEY,
                    DeliveryID INT NOT NULL FOREIGN KEY REFERENCES Deliveries(DeliveryID),
                    Status NVARCHAR(50) NOT NULL,
                    Location NVARCHAR(255) NULL,
                    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
                    Notes NVARCHAR(MAX) NULL
                )
            END
        `);
        console.log('Done.');

        console.log('Seeding initial tracking history for existing deliveries...');
        // Insert a processed step and current status step for all existing deliveries
        const deliveries = await pool.request().query(`SELECT d.DeliveryID, d.DeliveryStatus, so.OrderDate FROM Deliveries d JOIN SalesOrders so ON d.SalesOrderID = so.SalesOrderID`);
        
        for (const row of deliveries.recordset) {
            // Check if history already exists
            const historyCheck = await pool.request().input('did', sql.Int, row.DeliveryID).query(`SELECT 1 FROM DeliveryHistory WHERE DeliveryID = @did`);
            if (historyCheck.recordset.length === 0) {
                // Add "ORDER PROCESSED"
                await pool.request()
                    .input('did', sql.Int, row.DeliveryID)
                    .input('time', sql.DateTime, row.OrderDate)
                    .query(`INSERT INTO DeliveryHistory (DeliveryID, Status, Location, Timestamp) VALUES (@did, 'ORDER PROCESSED', 'System', @time)`);
                
                // Add current status
                await pool.request()
                    .input('did', sql.Int, row.DeliveryID)
                    .input('status', sql.NVarChar, row.DeliveryStatus || 'PENDING')
                    .query(`INSERT INTO DeliveryHistory (DeliveryID, Status, Location, Timestamp) VALUES (@did, @status, 'Warehouse A', GETDATE())`);
            }
        }
        console.log('Done.');

        console.log('ALL TRACKING SETUP COMPLETE');
        await pool.close();
    } catch (e) {
        console.error('SETUP ERROR:', e.message);
    }
}
setupTracking();
