const sql = require('mssql/msnodesqlv8');
const config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-8ASCIT8B;Database=InventoryManagementSystemDB;Trusted_Connection=yes;'
};

async function check() {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query("SELECT DISTINCT Status FROM PurchaseOrders");
        console.log('--- Current Statuses ---');
        console.log(result.recordset.map(r => r.Status).join(', '));
        await pool.close();
    } catch (err) {
        console.error(err);
    }
}
check();
