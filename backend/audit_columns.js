const sql = require('mssql/msnodesqlv8');
const config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-8ASCIT8B;Database=InventoryManagementSystemDB;Trusted_Connection=yes;'
};

async function audit() {
    try {
        let pool = await sql.connect(config);
        console.log('\n--- PurchaseOrderDetails Columns ---');
        const columns = await pool.request().query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'PurchaseOrderDetails'
        `);
        console.log(columns.recordset.map(r => r.COLUMN_NAME).join(', '));
        await pool.close();
    } catch (err) {
        console.error(err);
    }
}
audit();
