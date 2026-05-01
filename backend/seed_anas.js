const sql = require('mssql/msnodesqlv8');

const config = {
    server: 'localhost',
    database: 'InventoryManagementSystemDB',
    driver: 'ODBC Driver 17 for SQL Server',
    options: { trustedConnection: true }
};

async function seed() {
    try {
        const pool = await sql.connect(config);
        
        // Target UserID
        const userID = 8;
        
        // 1. Insert SystemLogs for M.Anas
        const logs = [
            { type: 'SYNC', msg: 'Inventory reconciliation completed for Aisle A.' },
            { type: 'INFO', msg: 'Reviewed low stock alerts for electronics category.' },
            { type: 'SYNC', msg: 'Approved stock transfer request TR-9042.' },
            { type: 'INFO', msg: 'Generated weekly warehouse summary report.' },
            { type: 'SYNC', msg: 'Validated incoming shipment SHP-440.' }
        ];

        for (const log of logs) {
            await pool.request()
                .input('type', sql.NVarChar, log.type)
                .input('msg', sql.NVarChar, log.msg)
                .input('uid', sql.Int, userID)
                .query(`
                    INSERT INTO SystemLogs (LogType, Message, UserID, CreatedAt) 
                    VALUES (@type, @msg, @uid, DATEADD(hour, -FLOOR(RAND()*(48-1+1)+1), GETDATE()))
                `);
        }
        console.log('Inserted SystemLogs.');

        // 2. Insert STOCK Alerts
        // Pick a random product ID to link
        const prodResult = await pool.request().query('SELECT TOP 3 ProductID FROM Products WHERE ReorderLevel > 0');
        const prodIds = prodResult.recordset.map(r => r.ProductID);
        
        const alerts = [
            { title: 'Critical Stock Level: Circuit Boards', desc: 'Circuit Boards are below the reorder threshold (Current: 15, Reorder: 50). Immediate restock required to prevent fulfillment delays.', pid: prodIds[0] || null },
            { title: 'Reorder Reminder: Packaging Tape', desc: 'Packaging tape supplies are running low. Please review procurement schedules.', pid: prodIds[1] || null },
            { title: 'Stock Discrepancy Found', desc: 'Cycle count indicates a variance of -5 units for SKU-A440. Please verify physical inventory.', pid: prodIds[2] || null }
        ];

        for (const alert of alerts) {
            await pool.request()
                .input('title', sql.NVarChar, alert.title)
                .input('desc', sql.NVarChar, alert.desc)
                .input('pid', sql.Int, alert.pid)
                .query(`
                    INSERT INTO Alerts (AlertType, Category, Title, Description, IsRead, RelatedID, CreatedAt)
                    VALUES ('CRITICAL_THRESHOLD', 'STOCK', @title, @desc, 0, @pid, DATEADD(hour, -FLOOR(RAND()*(24-1+1)+1), GETDATE()))
                `);
        }
        console.log('Inserted Alerts.');

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seed();
