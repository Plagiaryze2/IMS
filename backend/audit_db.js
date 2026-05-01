const sql = require('mssql/msnodesqlv8');
const config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=InventoryManagementSystemDB;Trusted_Connection=yes;'
};

async function audit() {
    try {
        console.log('Connecting to DB...');
        let pool = await sql.connect(config);
        
        console.log('\n--- PurchaseOrders Status Constraints ---');
        const constraints = await pool.request().query(`
            SELECT OBJECT_NAME(parent_object_id) AS TableName, name AS ConstraintName, definition
            FROM sys.check_constraints
            WHERE parent_object_id = OBJECT_ID('PurchaseOrders')
        `);
        console.table(constraints.recordset);

        console.log('\n--- PurchaseOrderDetails Columns ---');
        const columns = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'PurchaseOrderDetails'
        `);
        console.table(columns.recordset);

        await pool.close();
    } catch (err) {
        console.error('AUDIT ERROR:', err);
    }
}
audit();
