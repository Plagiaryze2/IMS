const sql = require('mssql/msnodesqlv8');
const config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-8ASCIT8B;Database=InventoryManagementSystemDB;Trusted_Connection=yes;'
};

async function checkSchema() {
    try {
        const pool = await sql.connect(config);
        const res = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'InventoryTransactions'`);
        console.log(res.recordset.map(r => r.COLUMN_NAME));
        await pool.close();
    } catch (e) {
        console.error(e);
    }
}
checkSchema();
