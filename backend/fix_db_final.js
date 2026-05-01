const sql = require('mssql/msnodesqlv8');
const config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-8ASCIT8B;Database=InventoryManagementSystemDB;Trusted_Connection=yes;'
};

async function fix() {
    try {
        console.log('Connecting...');
        let pool = await sql.connect(config);
        console.log('Connected.');

        // 1. Find and drop ANY check constraints on PurchaseOrders.Status
        console.log('Fixing Status constraints...');
        const constraints = await pool.request().query(`
            SELECT name FROM sys.check_constraints 
            WHERE parent_object_id = OBJECT_ID('PurchaseOrders')
        `);
        for (const c of constraints.recordset) {
            console.log(`Dropping constraint ${c.name}...`);
            await pool.request().query(`ALTER TABLE PurchaseOrders DROP CONSTRAINT ${c.name}`);
        }
        await pool.request().query(`ALTER TABLE PurchaseOrders ADD CONSTRAINT CK_PurchaseOrders_Status CHECK (Status IN ('Pending', 'Received', 'Cancelled', 'Closed', 'Shipped'))`);

        // 2. Fix LineTotal and Quantity columns
        console.log('Fixing columns...');
        const cols = await pool.request().query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PurchaseOrderDetails'
        `);
        const colNames = cols.recordset.map(r => r.COLUMN_NAME.toLowerCase());
        
        if (!colNames.includes('linetotal')) {
            console.log('Adding LineTotal...');
            await pool.request().query(`ALTER TABLE PurchaseOrderDetails ADD LineTotal DECIMAL(18,2)`);
        }
        if (!colNames.includes('quantity')) {
            console.log('Adding Quantity...');
            await pool.request().query(`ALTER TABLE PurchaseOrderDetails ADD Quantity INT`);
        }

        console.log('Migration complete.');
        await pool.close();
    } catch (err) {
        console.error('MIGRATION FAILED:', err);
    }
}
fix();
