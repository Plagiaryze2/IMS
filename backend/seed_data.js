const sql = require('mssql/msnodesqlv8');
const cfg = {
  server: 'LAPTOP-8ASCIT8B',
  database: 'InventoryManagementSystemDB',
  driver: 'ODBC Driver 17 for SQL Server',
  options: { trustedConnection: true }
};

async function run() {
  try {
    await sql.connect(cfg);
    console.log('Connected to SQL Server');

    // 1. Seed Invoices
    console.log('Seeding Invoices...');
    // Ensure at least one customer exists
    await new sql.Request().query(`
      IF NOT EXISTS (SELECT 1 FROM Customers)
      INSERT INTO Customers (CustomerName, Phone, Email, Address, CustomerType)
      VALUES ('Acme Corp', '555-0101', 'john@acme.com', '123 Acme St', 'Corporate')
    `);
    const custRes = await new sql.Request().query('SELECT TOP 1 CustomerID FROM Customers');
    const custID = custRes.recordset[0].CustomerID;

    for (let j = 5; j <= 45; j++) {
      const status = j % 4 === 0 ? 'Paid' : j % 4 === 1 ? 'Unpaid' : j % 4 === 2 ? 'Partially Paid' : 'Unpaid';
      const poStatus = j % 4 === 0 ? 'Completed' : 'Pending';
      const amount = 1200 + (j * 245);
      
      try {
        // Create Sales Order first
        const soRes = await new sql.Request().query(`
          INSERT INTO SalesOrders (CustomerID, CreatedByUserID, OrderDate, Status, TotalAmount, ShippingAddress)
          OUTPUT INSERTED.SalesOrderID
          VALUES (${custID}, 1, GETDATE(), '${poStatus}', ${amount}, '123 Main St')
        `);
        const soID = soRes.recordset[0].SalesOrderID;

        // Create Invoice
        await new sql.Request().query(`
          INSERT INTO Invoices (SalesOrderID, CustomerID, TotalAmount, InvoiceStatus, DueDate, InvoiceDate) 
          VALUES (${soID}, ${custID}, ${amount}, '${status}', DATEADD(day, ${j}, GETDATE()), GETDATE())
        `);
      } catch (e) {
        console.log(`Failed to insert record: ${e.message}`);
      }
    }

    // 2. Seed System Logs
    console.log('Seeding System Logs...');
    for (let k = 1; k <= 50; k++) {
      const type = k % 10 === 0 ? 'ERR' : k % 5 === 0 ? 'WARN' : 'SYNC';
      const msg = k % 3 === 0 ? `Inventory reconcile batch #${k} completed.` : 
                  k % 3 === 1 ? `User session verified for Node_${k % 5}` : 
                  `Data packet ${k * 124} transmitted to DR site.`;
      
      await new sql.Request().query(`
        INSERT INTO SystemLogs (LogType, Message, CreatedAt)
        VALUES ('${type}', '${msg}', DATEADD(minute, -${k * 10}, GETDATE()))
      `);
    }

    // 3. Seed Purchase Orders
    console.log('Seeding Purchase Orders...');
    for (let l = 1; l <= 15; l++) {
      const status = l % 3 === 0 ? 'Approved' : l % 3 === 1 ? 'Pending' : 'Partially Received';
      const amount = 5000 + (l * 1200);
      await new sql.Request().query(`
        INSERT INTO PurchaseOrders (SupplierID, OrderDate, TotalAmount, Status, OrderedByUserID, WarehouseID)
        VALUES (1, DATEADD(day, -${l}, GETDATE()), ${amount}, '${status}', 1, 1)
      `);
    }

    console.log('✅ ALL SEEDING COMPLETE');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

run();
