require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const sql     = require('mssql/msnodesqlv8');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

const app  = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ims_secret_2026';

app.use(cors());
app.use(express.json());

// ─── DB Config ───────────────────────────────────────────────────────────────
const dbConfig = {
    server:   process.env.DB_SERVER   || 'LAPTOP-8ASCIT8B',
    database: process.env.DB_DATABASE || 'InventoryManagementSystemDB',
    driver:   'ODBC Driver 17 for SQL Server',
    options:  { trustedConnection: true }
};

let pool;
async function getPool() {
    if (!pool) pool = await sql.connect(dbConfig);
    return pool;
}

// ─── Auth Middleware ─────────────────────────────────────────────────────────
function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}

// Helper: add a system log entry
async function addLog(type, message, userID = null) {
    try {
        const db = await getPool();
        const r = db.request();
        r.input('type', sql.NVarChar, type);
        r.input('msg',  sql.NVarChar, message);
        r.input('uid',  sql.Int, userID);
        await r.query('INSERT INTO SystemLogs (LogType, Message, UserID) VALUES (@type, @msg, @uid)');
    } catch(e) { /* non-fatal */ }
}

// ─── HEALTH ──────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Backend is running' }));

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    try {
        const db = await getPool();
        const r  = db.request();
        r.input('username', sql.NVarChar, username);
        const result = await r.query(`
            SELECT u.UserID, u.Username, u.FullName, u.Email, u.PasswordHash,
                   u.IsActive, u.RequirePasswordChange, ro.RoleName
            FROM Users u
            LEFT JOIN UserRoles ur ON u.UserID = ur.UserID
            LEFT JOIN Roles ro ON ur.RoleID = ro.RoleID
            WHERE u.Username = @username AND u.IsActive = 1
        `);
        if (result.recordset.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const user = result.recordset[0];

        // Support plain-text passwords in dev (existing DB has unhashed passwords)
        const valid = user.PasswordHash === password || await bcrypt.compare(password, user.PasswordHash).catch(() => false);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        // Update last login
        await db.request()
            .input('uid', sql.Int, user.UserID)
            .query('UPDATE Users SET LastLogin = GETDATE() WHERE UserID = @uid');

        await addLog('USER', `User "${user.Username}" logged in.`, user.UserID);

        const token = jwt.sign(
            { userID: user.UserID, username: user.Username, role: user.RoleName },
            JWT_SECRET, { expiresIn: '8h' }
        );
        res.json({ token, user: { id: user.UserID, username: user.Username, fullName: user.FullName, email: user.Email, role: user.RoleName, requirePasswordChange: user.RequirePasswordChange } });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    const { fullName, email, accountType, password } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    try {
        const db = await getPool();
        
        // Check if user exists
        const check = await db.request()
            .input('e', sql.NVarChar, email)
            .query('SELECT 1 FROM Users WHERE Email = @e');
        if (check.recordset.length > 0) return res.status(400).json({ error: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert User
        const userResult = await db.request()
            .input('fn', sql.NVarChar, fullName)
            .input('e', sql.NVarChar, email)
            .input('ph', sql.NVarChar, hashedPassword)
            .query(`
                INSERT INTO Users (Username, FullName, Email, PasswordHash, IsActive, CreatedAt, RequirePasswordChange)
                OUTPUT INSERTED.UserID
                VALUES (@e, @fn, @e, @ph, 1, GETDATE(), 0)
            `);
        
        const userId = userResult.recordset[0].UserID;

        // Map accountType to RoleID
        let roleId = 2; // Default: Warehouse Manager
        if (accountType === 'operator') roleId = 3;
        if (accountType === 'analyst') roleId = 3;

        await db.request()
            .input('uid', sql.Int, userId)
            .input('rid', sql.Int, roleId)
            .query('INSERT INTO UserRoles (UserID, RoleID) VALUES (@uid, @rid)');

        await addLog('USER', `New user "${email}" registered.`, userId);

        res.json({ message: 'Registration successful', userId });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});


// ═══════════════════════════════════════════════════════════════════════════════
// USER PORTAL - DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/user/dashboard/stats
app.get('/api/user/dashboard/stats', auth, async (req, res) => {
    try {
        const db = await getPool();
        const result = await db.request().query(`
            SELECT
                (SELECT ISNULL(SUM(QuantityOnHand), 0) FROM Inventory) AS totalStock,
                (SELECT COUNT(*) FROM SalesOrders WHERE Status = 'Pending') AS activeOrders,
                (SELECT COUNT(*) FROM Inventory WHERE Status != 'OPTIMAL') AS lowStockItems,
                (SELECT ISNULL(SUM(TotalAmount), 0) FROM Invoices
                    WHERE CAST(InvoiceDate AS DATE) = CAST(GETDATE() AS DATE)
                      AND InvoiceStatus = 'Paid') AS revenueYTD
        `);
        res.json(result.recordset[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});


// (activity endpoint consolidated below, after user/dashboard/summary)

// ═══════════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/customers
app.get('/api/customers', auth, async (req, res) => {
    try {
        const db = await getPool();
        const result = await db.request().query('SELECT CustomerID, CustomerName, Address FROM Customers ORDER BY CustomerName');
        res.json(result.recordset);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL SEARCH
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/search?q=
app.get('/api/search', auth, async (req, res) => {
    const q = req.query.q || '';
    if (!q || q.length < 2) return res.json([]);
    
    try {
        const db = await getPool();
        const like = `%${q}%`;

        // Search Products — fresh request per query (mssql can't reuse request objects)
        const prod = await db.request()
            .input('q', sql.NVarChar, like)
            .query(`
                SELECT TOP 4
                    ProductID as id,
                    SKU,
                    ProductName as title,
                    'Product' as type,
                    '/user/inventory' as path
                FROM Products
                WHERE SKU LIKE @q OR ProductName LIKE @q
            `);

        // Search Customers (Email column, not ContactEmail)
        const cust = await db.request()
            .input('q', sql.NVarChar, like)
            .query(`
                SELECT TOP 4
                    CustomerID as id,
                    Email as SKU,
                    CustomerName as title,
                    'Customer' as type,
                    '/user/sales' as path
                FROM Customers
                WHERE CustomerName LIKE @q OR Email LIKE @q
            `);

        // Search Suppliers (Email column, not ContactEmail)
        const supp = await db.request()
            .input('q', sql.NVarChar, like)
            .query(`
                SELECT TOP 3
                    SupplierID as id,
                    Email as SKU,
                    SupplierName as title,
                    'Supplier' as type,
                    '/user/suppliers' as path
                FROM Suppliers
                WHERE SupplierName LIKE @q OR Email LIKE @q
            `);

        // Search Orders by numeric ID
        let ord = { recordset: [] };
        if (!isNaN(parseInt(q))) {
            ord = await db.request()
                .input('num', sql.Int, parseInt(q))
                .query(`
                    SELECT TOP 3
                        SalesOrderID as id,
                        Status as SKU,
                        'Order #' + CAST(SalesOrderID AS VARCHAR) as title,
                        'Order' as type,
                        '/user/orders' as path
                    FROM SalesOrders
                    WHERE SalesOrderID = @num
                `);
        }

        const results = [
            ...prod.recordset,
            ...cust.recordset,
            ...supp.recordset,
            ...ord.recordset,
        ];
        res.json(results.slice(0, 8));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SALES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/sales/invoices
app.get('/api/sales/invoices', auth, async (req, res) => {
    try {
        const db = await getPool();
        const { search, status } = req.query;
        let query = `
            SELECT i.InvoiceID, i.InvoiceDate, i.TotalAmount, i.InvoiceStatus, c.CustomerName
            FROM Invoices i
            JOIN Customers c ON i.CustomerID = c.CustomerID
            WHERE 1=1
        `;
        if (search) query += ` AND (i.InvoiceID LIKE '%${search}%' OR c.CustomerName LIKE '%${search}%')`;
        if (status && status !== 'ALL') query += ` AND i.InvoiceStatus = '${status}'`;
        query += ' ORDER BY i.InvoiceDate DESC';
        
        const result = await db.request().query(query);
        res.json(result.recordset);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/shipments
app.get('/api/shipments', auth, async (req, res) => {
    try {
        const db = await getPool();
        const result = await db.request().query(`
            SELECT so.SalesOrderID as id, c.CustomerName as customer, 'GLOBAL LOGISTICS' as carrier, 
                   so.Status as status, 'Warehouse A' as location, 
                   CONVERT(VARCHAR, DATEADD(day, 5, so.OrderDate), 104) as delivery
            FROM SalesOrders so
            JOIN Customers c ON so.CustomerID = c.CustomerID
            ORDER BY so.OrderDate DESC
        `);
        res.json(result.recordset);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/sales/invoice
app.post('/api/sales/invoice', auth, async (req, res) => {
    const { customerID, items, status = 'Unpaid', dueDate } = req.body;
    if (!customerID || !items || items.length === 0) return res.status(400).json({ error: 'Missing customer or items' });

    const transaction = new sql.Transaction(await getPool());
    try {
        await transaction.begin();
        const r = new sql.Request(transaction);

        // 1. Calculate total
        const total = items.reduce((acc, item) => acc + (item.qty * item.price), 0);

        // 2. Create Sales Order
        r.input('cid', sql.Int, customerID);
        r.input('uid', sql.Int, req.user.userID);
        r.input('total', sql.Decimal(18,2), total);
        const soRes = await r.query(`
            INSERT INTO SalesOrders (CustomerID, CreatedByUserID, OrderDate, Status, TotalAmount, ShippingAddress)
            OUTPUT INSERTED.SalesOrderID
            VALUES (@cid, @uid, GETDATE(), 'Pending', @total, 'Default Shipping')
        `);
        const salesOrderID = soRes.recordset[0].SalesOrderID;

        // 3. Create Invoice
        const ir = new sql.Request(transaction);
        ir.input('soid', sql.Int, salesOrderID);
        ir.input('cid', sql.Int, customerID);
        ir.input('total', sql.Decimal(18,2), total);
        ir.input('status', sql.NVarChar, status);
        ir.input('due', sql.DateTime, dueDate || new Date(Date.now() + 7*24*60*60*1000));
        const invRes = await ir.query(`
            INSERT INTO Invoices (SalesOrderID, CustomerID, TotalAmount, InvoiceStatus, DueDate, InvoiceDate)
            OUTPUT INSERTED.InvoiceID
            VALUES (@soid, @cid, @total, @status, @due, GETDATE())
        `);
        const invoiceID = invRes.recordset[0].InvoiceID;

        // 4. Create items and update inventory
        for (const item of items) {
            const itr = new sql.Request(transaction);
            itr.input('iid', sql.Int, invoiceID);
            itr.input('pid', sql.Int, item.productID);
            itr.input('qty', sql.Int, item.qty);
            itr.input('price', sql.Decimal(18,2), item.price);
            await itr.query(`
                INSERT INTO InvoiceItems (InvoiceID, ProductID, Quantity, UnitPrice, SubTotal)
                VALUES (@iid, @pid, @qty, @price, @qty * @price)
            `);

            // Update Stock
            const sur = new sql.Request(transaction);
            sur.input('pid', sql.Int, item.productID);
            sur.input('qty', sql.Int, item.qty);
            await sur.query('UPDATE Inventory SET QuantityOnHand = QuantityOnHand - @qty WHERE ProductID = @pid');
        }

        await transaction.commit();
        await addLog('SYNC', `New Invoice #${invoiceID} posted for Customer #${customerID}.`, req.user.userID);
        res.status(201).json({ success: true, invoiceID });
    } catch (e) {
        await transaction.rollback();
        res.status(500).json({ error: e.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUPPLIERS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/suppliers
app.get('/api/suppliers', auth, async (req, res) => {
    try {
        const db = await getPool();
        const result = await db.request().query('SELECT SupplierID, SupplierName, ContactName, Phone FROM Suppliers ORDER BY SupplierName');
        res.json(result.recordset);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/purchase-orders
app.post('/api/purchase-orders', auth, async (req, res) => {
    const { supplierID, items, totalAmount } = req.body;
    if (!supplierID || !items || items.length === 0) return res.status(400).json({ error: 'Missing supplier or items' });

    const transaction = new sql.Transaction(await getPool());
    try {
        await transaction.begin();
        const r = new sql.Request(transaction);

        // 1. Create Purchase Order
        r.input('sid', sql.Int, supplierID);
        r.input('uid', sql.Int, req.user.userID);
        r.input('total', sql.Decimal(18,2), totalAmount);
        const poRes = await r.query(`
            INSERT INTO PurchaseOrders (SupplierID, OrderDate, TotalAmount, Status, OrderedByUserID, WarehouseID)
            OUTPUT INSERTED.PurchaseOrderID
            VALUES (@sid, GETDATE(), @total, 'Pending', @uid, 1)
        `);
        const poID = poRes.recordset[0].PurchaseOrderID;

        // 2. Create Order Details
        for (const item of items) {
            const dr = new sql.Request(transaction);
            dr.input('poid', sql.Int, poID);
            dr.input('pid', sql.Int, item.productID);
            dr.input('qty', sql.Int, item.qty);
            dr.input('cost', sql.Decimal(18,2), item.price);
            await dr.query(`
                INSERT INTO PurchaseOrderDetails (PurchaseOrderID, ProductID, Quantity, UnitCost, SubTotal)
                VALUES (@poid, @pid, @qty, @cost, @qty * @cost)
            `);
        }

        await transaction.commit();
        await addLog('SYNC', `New PO #${poID} issued to Supplier #${supplierID}.`, req.user.userID);
        res.status(201).json({ success: true, poID });
    } catch (e) {
        await transaction.rollback();
        res.status(500).json({ error: e.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// WAREHOUSE & LOGISTICS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/warehouse/inventory
app.get('/api/warehouse/inventory', auth, async (req, res) => {
    try {
        const db = await getPool();
        const { aisle } = req.query;
        const result = await db.request()
            .input('aisle', sql.NVarChar, aisle)
            .query(`
                SELECT p.SKU, p.ProductName, i.Shelf, i.Bin, i.QuantityOnHand
                FROM Inventory i
                JOIN Products p ON i.ProductID = p.ProductID
                WHERE i.Aisle = @aisle
            `);
        res.json(result.recordset);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/warehouse/transfer
app.post('/api/warehouse/transfer', auth, async (req, res) => {
    const { productSKU, destination, qty } = req.body;
    try {
        await addLog('SYNC', `Transferred ${qty} of ${productSKU} to ${destination}.`, req.user.userID);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/user/dashboard/stats', auth, async (req, res) => {
    try {
        const db = await getPool();
        const result = await db.request().query(`
            SELECT 
                (SELECT SUM(QuantityOnHand) FROM Inventory) as totalStock,
                (SELECT COUNT(*) FROM SalesOrders WHERE Status = 'Pending') as activeOrders,
                (SELECT COUNT(*) FROM Inventory i JOIN Products p ON i.ProductID = p.ProductID WHERE i.QuantityOnHand <= p.ReorderLevel) as lowStockItems,
                (SELECT SUM(TotalAmount) FROM Invoices WHERE InvoiceDate >= CAST(GETDATE() AS DATE)) as revenueYTD
        `);
        res.json(result.recordset[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/user/dashboard/activity
app.get('/api/user/dashboard/activity', auth, async (req, res) => {
    try {
        const db = await getPool();
        const isAdmin = req.user.role === 'Administrator';
        const userID = req.user.userID;
        const result = await db.request()
            .input('userID', sql.Int, userID)
            .query(`
            SELECT TOP 10 
                CONVERT(VARCHAR, l.CreatedAt, 108) as time,
                'EVT-' + CAST(l.LogID AS VARCHAR) as id,
                l.Message as [desc],
                ISNULL(u.Username, 'SYSTEM') as op,
                CASE WHEN l.LogType = 'SYNC' THEN 'SYNC' WHEN l.LogType = 'ERROR' THEN 'ERR' ELSE 'INFO' END as status
            FROM SystemLogs l
            LEFT JOIN Users u ON l.UserID = u.UserID
            WHERE l.UserID = @userID
              AND l.LogType NOT IN ('SYSTEM', 'USER')
            ORDER BY l.CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS & REPORTS
// ═══════════════════════════════════════════════════════════════════════════════

app.get('/api/user/reports/stats', auth, async (req, res) => {
    try {
        const db = await getPool();
        const result = await db.request().query(`
            SELECT
                (SELECT SUM(TotalAmount) FROM Invoices WHERE InvoiceStatus = 'Paid') AS totalRevenue,
                (SELECT SUM(TotalAmount) FROM Invoices WHERE InvoiceStatus = 'Unpaid') AS pendingRevenue,
                (SELECT COUNT(*) FROM SalesOrders WHERE Status = 'Pending') AS activeOrders,
                (SELECT SUM(p.UnitPrice * i.QuantityOnHand) FROM Inventory i JOIN Products p ON i.ProductID = p.ProductID) AS inventoryValue
        `);
        
        const topProducts = await db.request().query(`
            SELECT TOP 5 p.ProductName, SUM(ii.Quantity) as units, 
            CAST(SUM(ii.Quantity) * 100.0 / (SELECT SUM(Quantity) FROM InvoiceItems) AS INT) as percent
            FROM InvoiceItems ii
            JOIN Products p ON ii.ProductID = p.ProductID
            GROUP BY p.ProductName
            ORDER BY units DESC
        `);

        res.json({
            kpis: result.recordset[0],
            topProducts: topProducts.recordset
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/dashboard/stats
app.get('/api/dashboard/stats', auth, async (req, res) => {
    try {
        const db = await getPool();
        const stats = await db.request().query(`
            SELECT
                (SELECT COUNT(*) FROM Products WHERE IsActive = 1) AS totalSKUs,
                (SELECT COUNT(*) FROM Inventory WHERE Status != 'OPTIMAL') AS lowStockAlerts,
                (SELECT COUNT(*) FROM PurchaseOrders WHERE DATEDIFF(hour, OrderDate, GETDATE()) <= 24) AS recentOrders,
                (SELECT COUNT(*) FROM Alerts WHERE IsRead = 0) AS unreadAlerts
        `);
        res.json(stats.recordset[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/dashboard/chart?mode=VOL|VAL
app.get('/api/dashboard/chart', auth, async (req, res) => {
    const mode = req.query.mode === 'VAL' ? 'SUM(p.UnitPrice * i.QuantityOnHand)' : 'SUM(i.QuantityOnHand)';
    try {
        const db = await getPool();
        const data = await db.request().query(`
            SELECT DATEPART(week, t.TransactionDate) AS week, ${mode.replace('i.', 'p.UnitPrice * it.')} AS value
            FROM InventoryTransactions it
            JOIN Products p ON it.ProductID = p.ProductID
            WHERE it.TransactionDate >= DATEADD(day, -30, GETDATE())
            GROUP BY DATEPART(week, it.TransactionDate)
            ORDER BY week
        `).catch(() => null);

        // Fallback mock trend data if no transactions
        if (!data || data.recordset.length === 0) {
            return res.json([18000, 23000, 39000, 33000, 60000, 55000, 80000, 70000, 85000, 75000, 98000]
                .map((v, i) => ({ week: `D${i+1}`, value: mode.includes('UnitPrice') ? v * 2.5 : v })));
        }
        res.json(data.recordset);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/dashboard/logs
app.get('/api/dashboard/logs', auth, async (req, res) => {
    try {
        const db = await getPool();
        const result = await db.request().query(`
            SELECT TOP 20 LogType, Message,
                   FORMAT(CreatedAt, 'HH:mm:ss') AS time
            FROM SystemLogs
            ORDER BY CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/dashboard/logs
app.post('/api/dashboard/logs', auth, async (req, res) => {
    const { message } = req.body;
    await addLog('CMD', message, req.user.userID);
    res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/inventory?search=&category=&status=&page=1&limit=10
app.get('/api/inventory', auth, async (req, res) => {
    const { search = '', category = '', status = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    try {
        const db = await getPool();
        const r  = db.request();
        r.input('search',   sql.NVarChar, `%${search}%`);
        r.input('category', sql.NVarChar, category);
        r.input('status',   sql.NVarChar, status);
        r.input('offset',   sql.Int, offset);
        r.input('limit',    sql.Int, parseInt(limit));

        const countResult = await r.query(`
            SELECT COUNT(*) AS total
            FROM Products p
            JOIN Inventory i   ON p.ProductID = i.ProductID
            JOIN Categories c  ON p.CategoryID = c.CategoryID
            JOIN Warehouses w  ON i.WarehouseID = w.WarehouseID
            WHERE p.IsActive = 1
              AND (p.ProductName LIKE @search OR p.SKU LIKE @search OR c.CategoryName LIKE @search)
              AND (@category = '' OR c.CategoryName = @category)
              AND (@status = '' OR i.Status = @status)
        `);

        const result = await r.query(`
            SELECT p.ProductID, p.SKU, p.ProductName, c.CategoryName AS Category,
                   i.QuantityOnHand AS Stock, p.UnitPrice, i.Status, w.WarehouseName,
                   p.ReorderLevel, p.Description
            FROM Products p
            JOIN Inventory i   ON p.ProductID = i.ProductID
            JOIN Categories c  ON p.CategoryID = c.CategoryID
            JOIN Warehouses w  ON i.WarehouseID = w.WarehouseID
            WHERE p.IsActive = 1
              AND (p.ProductName LIKE @search OR p.SKU LIKE @search OR c.CategoryName LIKE @search)
              AND (@category = '' OR c.CategoryName = @category)
              AND (@status = '' OR i.Status = @status)
            ORDER BY p.ProductName
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `);

        res.json({ items: result.recordset, total: countResult.recordset[0].total, page: parseInt(page), limit: parseInt(limit) });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/inventory/categories
app.get('/api/inventory/categories', auth, async (req, res) => {
    try {
        const db = await getPool();
        const result = await db.request().query('SELECT CategoryID, CategoryName FROM Categories ORDER BY CategoryName');
        res.json(result.recordset);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH /api/inventory/adjust - Quick Adjustment from modal
app.patch('/api/inventory/adjust', auth, async (req, res) => {
    const { productID, type, quantity, reason } = req.body;
    if (!productID || !type || quantity === undefined) return res.status(400).json({ error: 'Missing adjustment parameters' });

    try {
        const db = await getPool();
        const r = db.request();
        r.input('pid', sql.Int, productID);
        r.input('qty', sql.Int, parseInt(quantity));

        // 1. Get current stock
        const current = await r.query('SELECT QuantityOnHand FROM Inventory WHERE ProductID = @pid');
        if (current.recordset.length === 0) return res.status(404).json({ error: 'Product not found in inventory' });
        
        let newQty = current.recordset[0].QuantityOnHand;
        if (type === 'ADD') newQty += parseInt(quantity);
        else if (type === 'REMOVE') newQty -= parseInt(quantity);
        else if (type === 'SET') newQty = parseInt(quantity);

        if (newQty < 0) return res.status(400).json({ error: 'Insufficient stock for removal' });

        // 2. Update stock
        r.input('newQty', sql.Int, newQty);
        await r.query('UPDATE Inventory SET QuantityOnHand = @newQty, LastUpdated = GETDATE() WHERE ProductID = @pid');

        // 3. Log transaction
        const tr = db.request();
        tr.input('pid', sql.Int, productID);
        tr.input('uid', sql.Int, req.user.userID);
        tr.input('type', sql.NVarChar, type);
        tr.input('rem', sql.NVarChar, reason || `Quick Adjustment: ${type}`);
        await tr.query(`
            INSERT INTO InventoryTransactions (ProductID, WarehouseID, TransactionType, Quantity, TransactionDate, PerformedByUserID, Remarks, ReferenceType)
            VALUES (@pid, 1, 'ADJUSTMENT', @pid, GETDATE(), @uid, @rem, 'Adjustment')
        `);

        // 4. Update status in inventory
        await db.request().input('pid', sql.Int, productID).query(`
            UPDATE i SET i.Status = 
                CASE 
                    WHEN i.QuantityOnHand = 0 THEN 'CRITICAL_SHORTAGE'
                    WHEN i.QuantityOnHand <= p.ReorderLevel THEN 'REORDER_WARNING'
                    ELSE 'OPTIMAL'
                END
            FROM Inventory i
            JOIN Products p ON i.ProductID = p.ProductID
            WHERE i.ProductID = @pid
        `);

        await addLog('SYNC', `Quick Adjustment (${type}) for Product #${productID}: ${quantity} units.`, req.user.userID);
        res.json({ success: true, newQuantity: newQty });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/inventory  — Add new SKU
app.post('/api/inventory', auth, async (req, res) => {
    const { sku, productName, categoryID, supplierID = 1, unitPrice, costPrice, reorderLevel = 10, stock = 0, warehouseID = 1, description = '' } = req.body;
    if (!sku || !productName || !unitPrice) return res.status(400).json({ error: 'SKU, Product Name and Unit Price are required.' });
    try {
        const db = await getPool();
        // Insert product
        const r = db.request();
        r.input('sku', sql.NVarChar, sku);
        r.input('name', sql.NVarChar, productName);
        r.input('catID', sql.Int, categoryID || 1);
        r.input('supID', sql.Int, supplierID);
        r.input('price', sql.Decimal(18,2), parseFloat(unitPrice));
        r.input('cost', sql.Decimal(18,2), parseFloat(costPrice || unitPrice * 0.7));
        r.input('reorder', sql.Int, parseInt(reorderLevel));
        r.input('desc', sql.NVarChar, description);
        const prod = await r.query(`
            INSERT INTO Products (SKU, ProductName, CategoryID, SupplierID, UnitPrice, CostPrice, ReorderLevel, Description, IsActive)
            OUTPUT INSERTED.ProductID
            VALUES (@sku, @name, @catID, @supID, @price, @cost, @reorder, @desc, 1)
        `);
        const productID = prod.recordset[0].ProductID;

        // Insert inventory
        const ir = db.request();
        ir.input('pid', sql.Int, productID);
        ir.input('wid', sql.Int, warehouseID);
        ir.input('qty', sql.Int, parseInt(stock));
        ir.input('status', sql.NVarChar, parseInt(stock) === 0 ? 'CRITICAL_SHORTAGE' : parseInt(stock) <= parseInt(reorderLevel) ? 'REORDER_WARNING' : 'OPTIMAL');
        await ir.query('INSERT INTO Inventory (ProductID, WarehouseID, QuantityOnHand, Status) VALUES (@pid, @wid, @qty, @status)');

        await addLog('SYNC', `New SKU added: ${sku} - ${productName}`, req.user.userID);
        res.status(201).json({ success: true, productID });
    } catch (e) {
        if (e.message.includes('UNIQUE') || e.message.includes('duplicate')) return res.status(409).json({ error: 'SKU already exists.' });
        res.status(500).json({ error: e.message });
    }
});

// PUT /api/inventory/:id  — Update stock / product
app.put('/api/inventory/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { stock, status, unitPrice } = req.body;
    try {
        const db = await getPool();
        if (stock !== undefined) {
            const r = db.request();
            r.input('pid', sql.Int, parseInt(id));
            r.input('qty', sql.Int, parseInt(stock));
            r.input('status', sql.NVarChar,
                parseInt(stock) === 0 ? 'CRITICAL_SHORTAGE' :
                status || 'OPTIMAL'
            );
            await r.query('UPDATE Inventory SET QuantityOnHand = @qty, Status = @status, LastUpdated = GETDATE() WHERE ProductID = @pid');
        }
        if (unitPrice !== undefined) {
            const r2 = db.request();
            r2.input('pid', sql.Int, parseInt(id));
            r2.input('price', sql.Decimal(18,2), parseFloat(unitPrice));
            await r2.query('UPDATE Products SET UnitPrice = @price WHERE ProductID = @pid');
        }
        await addLog('SYNC', `Inventory updated for ProductID ${id}`, req.user.userID);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE /api/inventory/:id  — Soft delete (deactivate)
app.delete('/api/inventory/:id', auth, async (req, res) => {
    try {
        const db = await getPool();
        const r = db.request();
        r.input('pid', sql.Int, parseInt(req.params.id));
        await r.query('UPDATE Products SET IsActive = 0 WHERE ProductID = @pid');
        await addLog('WARN', `SKU deactivated: ProductID ${req.params.id}`, req.user.userID);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// USERS (Admin Management)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/users
app.get('/api/users', auth, async (req, res) => {
    try {
        const db = await getPool();
        const result = await db.request().query(`
            SELECT u.UserID, u.Username, u.FullName, u.Email, u.Phone,
                   u.IsActive, u.CreatedAt, u.LastLogin, u.RequirePasswordChange,
                   ro.RoleName
            FROM Users u
            LEFT JOIN UserRoles ur ON u.UserID = ur.UserID
            LEFT JOIN Roles ro ON ur.RoleID = ro.RoleID
            ORDER BY u.CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/users  — Create admin user
app.post('/api/users', auth, async (req, res) => {
    const { fullName, email, username, role = 'Administrator', password, requirePasswordChange = true, permissions = {} } = req.body;
    if (!fullName || !email || !password) return res.status(400).json({ error: 'Full name, email and password are required.' });
    try {
        const db = await getPool();

        // Check email uniqueness
        const check = db.request();
        check.input('email', sql.NVarChar, email);
        const exists = await check.query('SELECT 1 FROM Users WHERE Email = @email');
        if (exists.recordset.length > 0) return res.status(409).json({ error: 'Email already in use.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const uname = username || email.split('@')[0];

        const r = db.request();
        r.input('fullName', sql.NVarChar, fullName);
        r.input('email', sql.NVarChar, email);
        r.input('username', sql.NVarChar, uname);
        r.input('hash', sql.NVarChar, hashedPassword);
        r.input('rpc', sql.Bit, requirePasswordChange ? 1 : 0);

        const inserted = await r.query(`
            INSERT INTO Users (FullName, Email, Username, PasswordHash, IsActive, RequirePasswordChange)
            OUTPUT INSERTED.UserID
            VALUES (@fullName, @email, @username, @hash, 1, @rpc)
        `);
        const userID = inserted.recordset[0].UserID;

        // Assign role
        const roleResult = await db.request()
            .input('roleName', sql.NVarChar, role)
            .query('SELECT RoleID FROM Roles WHERE RoleName = @roleName');
        if (roleResult.recordset.length > 0) {
            const rr = db.request();
            rr.input('uid', sql.Int, userID);
            rr.input('rid', sql.Int, roleResult.recordset[0].RoleID);
            await rr.query('INSERT INTO UserRoles (UserID, RoleID) VALUES (@uid, @rid)');
        }

        await addLog('USER', `New admin account created: ${fullName} (${email}) as ${role}`, req.user.userID);
        await addLog('SYSTEM', `Account ${uname} provisioned with ${role} privileges.`);

        // Create a system alert for new admin
        const ar = db.request();
        ar.input('title', sql.NVarChar, `New Admin User Registered: ${fullName}`);
        ar.input('desc', sql.NVarChar, `Credentials issued to ${email} with ${role} privileges.`);
        await ar.query(`INSERT INTO Alerts (AlertType, Category, Title, Description) VALUES ('SYSTEM_LOG', 'SYSTEM', @title, @desc)`);

        res.status(201).json({ success: true, userID });
    } catch (e) {
        if (e.message.includes('UNIQUE') || e.message.includes('duplicate')) return res.status(409).json({ error: 'Username or email already exists.' });
        res.status(500).json({ error: e.message });
    }
});

// PUT /api/users/:id/toggle  — Activate / Deactivate
app.put('/api/users/:id/toggle', auth, async (req, res) => {
    try {
        const db = await getPool();
        const r = db.request();
        r.input('uid', sql.Int, parseInt(req.params.id));
        const result = await r.query('UPDATE Users SET IsActive = 1 - IsActive OUTPUT INSERTED.IsActive WHERE UserID = @uid');
        res.json({ isActive: result.recordset[0].IsActive });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/roles
app.get('/api/roles', auth, async (req, res) => {
    try {
        const db = await getPool();
        const result = await db.request().query('SELECT * FROM Roles ORDER BY RoleName');
        res.json(result.recordset);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ALERTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/alerts?category=&unread=true
app.get('/api/alerts', auth, async (req, res) => {
    let { category = '', unread } = req.query;

    if (req.user.role !== 'Administrator') {
        category = 'STOCK';
    }

    try {
        const db = await getPool();
        const r = db.request();
        r.input('category', sql.NVarChar, category);
        r.input('unread', sql.Bit, unread === 'true' ? 1 : null);
        const result = await r.query(`
            SELECT a.AlertID, a.AlertType, a.Category, a.Title, a.Description,
                   a.IsRead, a.RelatedID, a.CreatedAt, a.AcknowledgedAt,
                   p.SKU, p.ProductName, p.ReorderLevel,
                   i.QuantityOnHand AS CurrentStock,
                   u.FullName AS AcknowledgedBy
            FROM Alerts a
            LEFT JOIN Products p ON a.RelatedID = p.ProductID AND a.Category = 'STOCK'
            LEFT JOIN Inventory i ON p.ProductID = i.ProductID
            LEFT JOIN Users u ON a.AcknowledgedBy = u.UserID
            WHERE (@category = '' OR a.Category = @category)
              AND (@unread IS NULL OR a.IsRead = 0)
            ORDER BY a.IsRead ASC, a.CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/alerts/:id/acknowledge
app.put('/api/alerts/:id/acknowledge', auth, async (req, res) => {
    try {
        const db = await getPool();
        const r = db.request();
        r.input('id', sql.Int, parseInt(req.params.id));
        r.input('uid', sql.Int, req.user.userID);
        await r.query('UPDATE Alerts SET IsRead = 1, AcknowledgedAt = GETDATE(), AcknowledgedBy = @uid WHERE AlertID = @id');
        await addLog('INFO', `Alert #${req.params.id} acknowledged.`, req.user.userID);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/alerts  — Create new alert (e.g. from purchase order execution)
app.post('/api/alerts', auth, async (req, res) => {
    const { type, category, title, description, relatedID } = req.body;
    try {
        const db = await getPool();
        const r = db.request();
        r.input('type', sql.NVarChar, type);
        r.input('cat',  sql.NVarChar, category);
        r.input('title', sql.NVarChar, title);
        r.input('desc', sql.NVarChar, description);
        r.input('rid', sql.Int, relatedID || null);
        const res2 = await r.query('INSERT INTO Alerts (AlertType, Category, Title, Description, RelatedID) OUTPUT INSERTED.AlertID VALUES (@type, @cat, @title, @desc, @rid)');
        res.status(201).json({ alertID: res2.recordset[0].AlertID });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
getPool()
    .then(() => {
        console.log('✅ Connected to SQL Server');
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
        process.exit(1);
    });
