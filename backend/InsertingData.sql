USE InventoryManagementSystemDB;
GO

-- =================================================================================
-- 1. CATEGORIES
-- =================================================================================
PRINT 'Populating Categories...';
IF (SELECT COUNT(*) FROM Categories) < 5
BEGIN
    INSERT INTO Categories (CategoryName, Description) VALUES
    ('Computing Hardware', 'Laptops, Servers, and Workstations'),
    ('Network Infrastructure', 'Routers, Switches, and Cabling'),
    ('Industrial Machinery', 'Heavy duty manufacturing equipment'),
    ('Office Furniture', 'Ergonomic desks and chairs'),
    ('Lab Equipment', 'Scientific testing and measurement tools');
END
GO

-- =================================================================================
-- 2. ROLES
-- =================================================================================
PRINT 'Populating Roles...';
IF (SELECT COUNT(*) FROM Roles) = 0
BEGIN
    INSERT INTO Roles (RoleName, Description) VALUES
    ('Administrator', 'Full system access'),
    ('Warehouse Manager', 'Manage inventory and orders'),
    ('Analyst', 'View reports and analytics');
END
GO

-- =================================================================================
-- 3. USERS & ACCESS
-- =================================================================================
PRINT 'Populating Users...';
IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'admin')
BEGIN
    -- Password: 12345678
    INSERT INTO Users (Username, FullName, Email, PasswordHash, IsActive, CreatedAt)
    VALUES ('admin', 'System Admin', 'admin@codered.ims', '$2b$10$JXVL37axNCTbOtmYlQuBMu7nYYyxxyvnqSdju2E3NNeLYq/r0l4Me', 1, GETDATE());
    
END

-- Ensure Admin has the Administrator role
IF EXISTS (SELECT 1 FROM Users WHERE Username = 'admin')
BEGIN
    DECLARE @AdminID INT = (SELECT UserID FROM Users WHERE Username = 'admin');
    IF NOT EXISTS (SELECT 1 FROM UserRoles WHERE UserID = @AdminID AND RoleID = 1)
    BEGIN
        INSERT INTO UserRoles (UserID, RoleID) VALUES (@AdminID, 1);
    END
END

IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'M.Anas')
BEGIN
    -- Password: anas123
    INSERT INTO Users (Username, FullName, Email, PasswordHash, IsActive, CreatedAt)
    VALUES ('M.Anas', 'Muhammad Anas', 'm.anas@codered.ims', '$2b$10$VFMSC0VmhmnsFT17wT58puPhiXgI2wqbqzHxgK.7hM88l.ototPnS', 1, GETDATE());
    
END

-- Ensure M.Anas has the Warehouse Manager role
IF EXISTS (SELECT 1 FROM Users WHERE Username = 'M.Anas')
BEGIN
    DECLARE @AnasID INT = (SELECT UserID FROM Users WHERE Username = 'M.Anas');
    IF NOT EXISTS (SELECT 1 FROM UserRoles WHERE UserID = @AnasID AND RoleID = 2)
    BEGIN
        INSERT INTO UserRoles (UserID, RoleID) VALUES (@AnasID, 2);
    END
END
GO

-- =================================================================================
-- 2. SUPPLIERS
-- =================================================================================
PRINT 'Populating Suppliers...';
IF (SELECT COUNT(*) FROM Suppliers) < 4
BEGIN
    INSERT INTO Suppliers (SupplierName, ContactName, Phone, Email, Address, City, IsActive) VALUES
    ('NextGen Systems', 'Marcus Chen', '555-0101', 'sales@nextgen.sys', '101 Tech Way', 'San Jose', 1),
    ('Global Logistics', 'Sarah Miller', '555-0202', 'ops@global.log', '500 Port Ave', 'Houston', 1),
    ('Industrial Prime', 'Robert Steel', '555-0303', 'info@indprime.com', '77 Factory St', 'Detroit', 1),
    ('ErgoDesign Ltd', 'Elena Rossi', '555-0404', 'design@ergo.io', '22 Milan Plaza', 'New York', 1);
END
GO

-- =================================================================================
-- 2b. WAREHOUSES
-- =================================================================================
PRINT 'Populating Warehouses...';
IF (SELECT COUNT(*) FROM Warehouses) = 0
BEGIN
    INSERT INTO Warehouses (WarehouseName, Location, ManagerName, ContactNumber, IsActive, MaxCapacity)
    VALUES ('Central Distribution Center', 'North Industrial Zone, Sector 7', 'Sarah Jenkins', '555-W-001', 1, 50000);
END
GO

-- =================================================================================
-- 2c. CUSTOMERS
-- =================================================================================
PRINT 'Populating Customers...';
IF (SELECT COUNT(*) FROM Customers) = 0
BEGIN
    INSERT INTO Customers (CustomerName, Phone, Email, Address, CustomerType)
    VALUES ('TechSolutions Inc.', '555-8899', 'orders@techsolutions.com', '77 Enterprise Way', 'Corporate');
END
GO

-- Additional Suppliers from massive_seed.sql
INSERT INTO Suppliers (SupplierName, ContactName, Phone, Email, Address, City, IsActive) 
SELECT 'TechFlow Solutions', 'James Wu', '555-0987', 'contact@techflow.io', '88 Innovation Dr', 'San Francisco', 1
WHERE NOT EXISTS (SELECT 1 FROM Suppliers WHERE SupplierName = 'TechFlow Solutions');

INSERT INTO Suppliers (SupplierName, ContactName, Phone, Email, Address, City, IsActive)
SELECT 'BlueRidge Logistics', 'Amanda Green', '555-4433', 'ops@blueridge.com', '44 Mountain View', 'Denver', 1
WHERE NOT EXISTS (SELECT 1 FROM Suppliers WHERE SupplierName = 'BlueRidge Logistics');

INSERT INTO Suppliers (SupplierName, ContactName, Phone, Email, Address, City, IsActive)
SELECT 'Titan Manufacturing', 'Viktor Volkov', '555-2211', 'sales@titan.mf', '22 Industrial Pkwy', 'Chicago', 1
WHERE NOT EXISTS (SELECT 1 FROM Suppliers WHERE SupplierName = 'Titan Manufacturing');
GO

-- =================================================================================
-- 3. PRODUCTS
-- =================================================================================
PRINT 'Populating Products...';
DECLARE @CatComputing INT = (SELECT TOP 1 CategoryID FROM Categories WHERE CategoryName = 'Computing Hardware');
DECLARE @CatNetwork INT = (SELECT TOP 1 CategoryID FROM Categories WHERE CategoryName = 'Network Infrastructure');
DECLARE @SupNextGen INT = (SELECT TOP 1 SupplierID FROM Suppliers WHERE SupplierName = 'NextGen Systems');

IF NOT EXISTS (SELECT 1 FROM Products WHERE SKU = 'SRV-DL380-G10')
BEGIN
    INSERT INTO Products (ProductName, SKU, CategoryID, SupplierID, UnitPrice, CostPrice, ReorderLevel, UnitOfMeasure, IsActive, CreatedAt, Description, Brand, Barcode, TaxRate) VALUES
    ('ProLiant DL380 Gen10', 'SRV-DL380-G10', @CatComputing, @SupNextGen, 4500.00, 3200.00, 5, 'Unit', 1, GETDATE(), 'High-performance enterprise server', 'HP', '1112223334445', 20.0),
    ('Precision 5820 Tower', 'WKS-P5820-X', @CatComputing, @SupNextGen, 2800.00, 1950.00, 8, 'Unit', 1, GETDATE(), 'Professional workstation for engineering', 'Dell', '2223334445556', 20.0),
    ('Nexus 9300 Switch', 'NET-N9300-48', @CatNetwork, @SupNextGen, 8500.00, 6200.00, 3, 'Unit', 1, GETDATE(), '48-port high-density data center switch', 'Cisco', '3334445556667', 15.0),
    ('Catalyst 9200L', 'NET-C9200-24', @CatNetwork, @SupNextGen, 2200.00, 1400.00, 10, 'Unit', 1, GETDATE(), 'Enterprise stackable access switch', 'Cisco', '4445556667778', 15.0),
    ('ErgoPro Stand Desk', 'FUR-EPSD-ADJ', (SELECT CategoryID FROM Categories WHERE CategoryName='Office Furniture'), 4, 850.00, 450.00, 15, 'Unit', 1, GETDATE(), 'Electric height-adjustable standing desk', 'ErgoDesign', '5556667778889', 20.0);
END

-- Bulk Products from massive_seed.sql
DECLARE @i INT = 1;
WHILE @i <= 20 -- Reduced from 40 to avoid too much bloat, but still plenty
BEGIN
    IF NOT EXISTS (SELECT 1 FROM Products WHERE SKU = 'COMP-' + CAST(1000 + @i AS NVARCHAR))
    BEGIN
        INSERT INTO Products (ProductName, SKU, CategoryID, SupplierID, UnitPrice, CostPrice, ReorderLevel, UnitOfMeasure, IsActive, CreatedAt, Description, Brand, Barcode, TaxRate)
        VALUES (
            'Bulk Component #' + CAST(@i AS NVARCHAR), 
            'COMP-' + CAST(1000 + @i AS NVARCHAR), 
            @CatComputing, 
            ISNULL((SELECT TOP 1 SupplierID FROM Suppliers WHERE SupplierName = 'NextGen Systems'), 1), 
            25.00 + (@i * 2), 
            15.00 + @i, 
            10 + (@i % 20), 
            'Unit', 1, GETDATE(), 
            'Generic bulk component for assembly line.',
            'Generic',
            'BAR-' + CAST(2000 + @i AS NVARCHAR),
            20.0
        );
    END
    SET @i = @i + 1;
END
GO

-- =================================================================================
-- 4. INVENTORY & LOCATIONS
-- =================================================================================
PRINT 'Populating Inventory...';
INSERT INTO Inventory (ProductID, WarehouseID, QuantityOnHand, Status, LastUpdated)
SELECT p.ProductID, 1, 
    CASE 
        WHEN p.SKU = 'SRV-DL380-G10' THEN 2   -- Low stock (Reorder: 5)
        WHEN p.SKU = 'NET-N9300-48' THEN 1    -- Critical (Reorder: 3)
        WHEN p.SKU = 'WKS-P5820-X' THEN 25    -- Optimal
        ELSE 12
    END,
    CASE 
        WHEN p.SKU = 'SRV-DL380-G10' THEN 'REORDER_WARNING'
        WHEN p.SKU = 'NET-N9300-48' THEN 'CRITICAL_SHORTAGE'
        ELSE 'OPTIMAL'
    END,
    GETDATE()
FROM Products p
WHERE NOT EXISTS (SELECT 1 FROM Inventory i WHERE i.ProductID = p.ProductID);

-- Set Warehouse Locations (Aisle, Shelf, Bin) from user_portal_migrations.sql
UPDATE Inventory SET Aisle = 'A1', Shelf = '12', Bin = '04-B' WHERE ProductID IN (SELECT TOP 2 ProductID FROM Products);
UPDATE Inventory SET Aisle = 'A2', Shelf = '11', Bin = '12-A' WHERE ProductID NOT IN (SELECT TOP 2 ProductID FROM Products);
GO

-- =================================================================================
-- 5. INVOICES
-- =================================================================================
PRINT 'Populating Invoices...';
IF (SELECT COUNT(*) FROM Invoices) = 0
BEGIN
    INSERT INTO Invoices (SalesOrderID, CustomerID, InvoiceDate, DueDate, TotalAmount, InvoiceStatus) VALUES
    (1, 1, GETDATE(), DATEADD(day, 14, GETDATE()), 12500.00, 'Unpaid'),
    (1, 1, GETDATE(), DATEADD(day, 7, GETDATE()), 8400.00, 'Unpaid'),
    (1, 1, GETDATE(), GETDATE(), 2200.00, 'Paid');
END

-- Additional Invoices from massive_seed.sql
DECLARE @j INT = 5;
WHILE @j <= 15 -- Seed some more
BEGIN
    INSERT INTO Invoices (SalesOrderID, CustomerID, InvoiceDate, DueDate, TotalAmount, InvoiceStatus)
    VALUES (
        1, 1, GETDATE(),
        DATEADD(day, @j, GETDATE()),
        500.00 + (@j * 150),
        CASE WHEN @j % 4 = 0 THEN 'Paid' WHEN @j % 4 = 1 THEN 'Unpaid' ELSE 'Unpaid' END
    );
    SET @j = @j + 1;
END
GO

-- =================================================================================
-- 6. SYSTEM LOGS
-- =================================================================================
PRINT 'Populating System Logs...';
IF (SELECT COUNT(*) FROM SystemLogs) < 10
BEGIN
    INSERT INTO SystemLogs (LogType, Message, CreatedAt, UserID) VALUES
    ('SYNC', 'Mainframe synchronization completed successfully.', DATEADD(minute, -45, GETDATE()), 2),
    ('INFO', 'Database backup partition created on DB_SEC_02.', DATEADD(hour, -2, GETDATE()), 2),
    ('WARN', 'API latency spike detected in US-EAST region.', DATEADD(hour, -4, GETDATE()), 2),
    ('USER', 'System configuration updated by Admin Root.', DATEADD(hour, -5, GETDATE()), 2),
    ('SYNC', 'Inventory reconcile: 452 items verified.', DATEADD(day, -1, GETDATE()), 2),
    ('ERR',  'Failed to process inbound manifest #MF-9920.', DATEADD(day, -1, GETDATE()), 2);
END
GO

-- =================================================================================
-- 7. ALERTS
-- =================================================================================
PRINT 'Populating Alerts...';
IF NOT EXISTS (SELECT 1 FROM Alerts WHERE AlertType = 'CRITICAL_THRESHOLD')
BEGIN
    INSERT INTO Alerts (AlertType, Category, Title, Description, IsRead, RelatedID, CreatedAt)
    SELECT 'CRITICAL_THRESHOLD', 'STOCK', 'Critical Shortage: Nexus 9300 Switch', 'Current stock is 1 unit. Minimum threshold is 3 units. Immediate reorder required.', 0, ProductID, DATEADD(hour, -1, GETDATE())
    FROM Products WHERE SKU = 'NET-N9300-48';

    INSERT INTO Alerts (AlertType, Category, Title, Description, IsRead, RelatedID, CreatedAt)
    SELECT 'CRITICAL_THRESHOLD', 'STOCK', 'Reorder Warning: ProLiant DL380 Server', 'Current stock (2) below reorder level (5).', 0, ProductID, DATEADD(hour, -3, GETDATE())
    FROM Products WHERE SKU = 'SRV-DL380-G10';
END

IF NOT EXISTS (SELECT 1 FROM Alerts WHERE AlertType = 'SYSTEM_LOG')
BEGIN
    INSERT INTO Alerts (AlertType, Category, Title, Description, IsRead, CreatedAt) VALUES
    ('SYSTEM_LOG', 'SYSTEM', 'Security Patch Available', 'Firmware update v4.2.1 is available for all managed network switches.', 0, DATEADD(day, -1, GETDATE())),
    ('SYSTEM_LOG', 'SYSTEM', 'Monthly Inventory Audit Due', 'The scheduled Q2 inventory audit is required by end of week.', 1, DATEADD(day, -2, GETDATE()));
END
GO

-- =================================================================================
-- 8. TRANSACTIONS & ORDERS
-- =================================================================================
PRINT 'Populating Transactions and Orders...';
IF (SELECT COUNT(*) FROM InventoryTransactions) = 0
BEGIN
    INSERT INTO InventoryTransactions (ProductID, WarehouseID, TransactionType, Quantity, TransactionDate, PerformedByUserID, Remarks, ReferenceType)
    SELECT TOP 10
        p.ProductID, 1, 'ADJUSTMENT', 1 + (p.ProductID % 5), DATEADD(day, - (p.ProductID % 10), GETDATE()), 2, 'Seed Data Adjustment', 'Adjustment'
    FROM Products p;
END

IF (SELECT COUNT(*) FROM PurchaseOrders) = 0
BEGIN
    INSERT INTO PurchaseOrders (SupplierID, OrderDate, TotalAmount, Status, OrderedByUserID, WarehouseID)
    VALUES (1, DATEADD(day, -1, GETDATE()), 15400.00, 'Pending', 2, 1);
END
GO

PRINT 'Data population complete.';
