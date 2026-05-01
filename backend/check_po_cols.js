const sql = require('mssql/msnodesqlv8');
const config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=InventoryManagementSystemDB;Trusted_Connection=yes;'
};

async function check() {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PurchaseOrderDetails'");
        console.log('--- PurchaseOrderDetails Columns ---');
        console.log(result.recordset.map(r => r.COLUMN_NAME).join(', '));
        
        let res2 = await pool.request().query("SELECT definition FROM sys.check_constraints WHERE name = 'CK_PurchaseOrders_Status'");
        console.log('--- CK_PurchaseOrders_Status ---');
        console.log(res2.recordset[0]?.definition);
        
        await pool.close();
    } catch (err) {
        console.error(err);
    }
}
check();
