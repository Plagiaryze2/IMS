const sql = require('mssql/msnodesqlv8');
const config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-8ASCIT8B;Database=InventoryManagementSystemDB;Trusted_Connection=yes;'
};

async function fix() {
    try {
        console.log('Connecting...');
        let pool = await sql.connect(config);
        
        console.log('Updating Status Constraint...');
        const constraints = await pool.request().query(`
            SELECT name FROM sys.check_constraints 
            WHERE parent_object_id = OBJECT_ID('PurchaseOrders')
        `);
        for (const c of constraints.recordset) {
            await pool.request().query(`ALTER TABLE PurchaseOrders DROP CONSTRAINT ${c.name}`);
        }
        await pool.request().query(`
            ALTER TABLE PurchaseOrders ADD CONSTRAINT CK_PurchaseOrders_Status 
            CHECK (Status IN ('Pending', 'Received', 'Cancelled', 'Closed', 'Shipped', 'Approved', 'Completed', 'Partially Received'))
        `);

        console.log('Ensuring LineTotal column exists...');
        const cols = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PurchaseOrderDetails'`);
        const names = cols.recordset.map(r => r.COLUMN_NAME.toLowerCase());
        if (!names.includes('linetotal')) {
            await pool.request().query(`ALTER TABLE PurchaseOrderDetails ADD LineTotal DECIMAL(18,2)`);
        }

        console.log('Fix complete.');
        await pool.close();
    } catch (err) {
        console.error('FIX FAILED:', err);
    }
}
fix();
