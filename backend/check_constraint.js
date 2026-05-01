const sql = require('mssql/msnodesqlv8');
const config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-8ASCIT8B;Database=InventoryManagementSystemDB;Trusted_Connection=yes;'
};

async function checkConstraint() {
    try {
        const pool = await sql.connect(config);
        const res = await pool.request().query(`
            SELECT definition 
            FROM sys.check_constraints 
            WHERE name = 'CK_InventoryTransactions_TransactionType'
        `);
        console.log(res.recordset[0].definition);
        await pool.close();
    } catch (e) {
        console.error(e);
    }
}
checkConstraint();
