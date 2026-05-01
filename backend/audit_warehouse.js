const sql = require('mssql/msnodesqlv8');
const config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-8ASCIT8B;Database=InventoryManagementSystemDB;Trusted_Connection=yes;'
};

async function auditWarehouse() {
    try {
        const pool = await sql.connect(config);
        
        console.log('\n--- Warehouses Table Columns ---');
        const whCols = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Warehouses'`);
        console.log(whCols.recordset.map(r => r.COLUMN_NAME).join(', '));
        
        console.log('\n--- Warehouses Data ---');
        const whData = await pool.request().query(`SELECT * FROM Warehouses`);
        console.table(whData.recordset);

        console.log('\n--- Inventory Table Columns ---');
        const invCols = await pool.request().query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Inventory'`);
        console.log(invCols.recordset.map(r => r.COLUMN_NAME).join(', '));

        await pool.close();
    } catch (e) {
        console.error('AUDIT ERROR:', e.message);
    }
}
auditWarehouse();
