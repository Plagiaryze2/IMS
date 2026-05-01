const sql = require('mssql/msnodesqlv8');
const config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-8ASCIT8B;Database=InventoryManagementSystemDB;Trusted_Connection=yes;'
};

async function audit() {
    try {
        let pool = await sql.connect(config);
        console.log('\n--- Recent Invoices ---');
        const res = await pool.request().query("SELECT TOP 5 InvoiceID, InvoiceDate, TotalAmount, InvoiceStatus FROM Invoices ORDER BY InvoiceDate DESC");
        console.table(res.recordset);
        
        console.log('\n--- Sales Trend Query Test ---');
        const trend = await pool.request().query(`
            SELECT TOP 7 FORMAT(InvoiceDate, 'MM/dd') as name, SUM(TotalAmount) as value
            FROM Invoices
            GROUP BY FORMAT(InvoiceDate, 'MM/dd')
            ORDER BY name
        `);
        console.table(trend.recordset);
        
        await pool.close();
    } catch (err) {
        console.error(err);
    }
}
audit();
