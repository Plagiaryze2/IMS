-- ================================================
-- IMS Database Seeding Script
-- Populates dummy data for a professional look
-- ================================================

USE InventoryManagementSystemDB;
GO

-- 1. Ensure Categories exist
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

-- 2. Ensure Suppliers exist
IF (SELECT COUNT(*) FROM Suppliers) < 5
BEGIN
    INSERT INTO Suppliers (SupplierName, ContactPerson, Phone, Email, Address, City, IsActive) VALUES
    ('NextGen Systems', 'Marcus Chen', '555-0101', 'sales@nextgen.sys', '101 Tech Way', 'San Jose', 1),
    ('Global Logistics', 'Sarah Miller', '555-0202', 'ops@global.log', '500 Port Ave', 'Houston', 1),
    ('Industrial Prime', 'Robert Steel', '555-0303', 'info@indprime.com', '77 Factory St', 'Detroit', 1),
    ('ErgoDesign Ltd', 'Elena Rossi', '555-0404', 'design@ergo.io', '22 Milan Plaza', 'New York', 1);
END
GO

-- 3. Clear existing dummy products if needed or just add more
-- Let's add specific products that look professional
DECLARE @CatComputing INT = (SELECT TOP 1 CategoryID FROM Categories WHERE CategoryName = 'Computing Hardware');
DECLARE @CatNetwork INT = (SELECT TOP 1 CategoryID FROM Categories WHERE CategoryName = 'Network Infrastructure');
DECLARE @SupNextGen INT = (SELECT TOP 1 SupplierID FROM Suppliers WHERE SupplierName = 'NextGen Systems');

IF NOT EXISTS (SELECT 1 FROM Products WHERE SKU = 'SRV-DL380-G10')
BEGIN
    INSERT INTO Products (ProductName, SKU, CategoryID, SupplierID, UnitPrice, CostPrice, ReorderLevel, UnitOfMeasure, IsActive, CreatedAt, Description) VALUES
    ('ProLiant DL380 Gen10', 'SRV-DL380-G10', @CatComputing, @SupNextGen, 4500.00, 3200.00, 5, 'Unit', 1, GETDATE(), 'High-performance enterprise server'),
    ('Precision 5820 Tower', 'WKS-P5820-X', @CatComputing, @SupNextGen, 2800.00, 1950.00, 8, 'Unit', 1, GETDATE(), 'Professional workstation for engineering'),
    ('Nexus 9300 Switch', 'NET-N9300-48', @CatNetwork, @SupNextGen, 8500.00, 6200.00, 3, 'Unit', 1, GETDATE(), '48-port high-density data center switch'),
    ('Catalyst 9200L', 'NET-C9200-24', @CatNetwork, @SupNextGen, 2200.00, 1400.00, 10, 'Unit', 1, GETDATE(), 'Enterprise stackable access switch'),
    ('ErgoPro Stand Desk', 'FUR-EPSD-ADJ', (SELECT CategoryID FROM Categories WHERE CategoryName='Office Furniture'), 4, 850.00, 450.00, 15, 'Unit', 1, GETDATE(), 'Electric height-adjustable standing desk');
END
GO

-- 4. Populate Inventory
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
GO

-- 5. Seed System Logs
INSERT INTO SystemLogs (LogType, Message, CreatedAt) VALUES
('SYNC', 'Mainframe synchronization completed successfully.', DATEADD(minute, -45, GETDATE())),
('INFO', 'Database backup partition created on DB_SEC_02.', DATEADD(hour, -2, GETDATE())),
('WARN', 'API latency spike detected in US-EAST region.', DATEADD(hour, -4, GETDATE())),
('USER', 'System configuration updated by Admin Root.', DATEADD(hour, -5, GETDATE())),
('SYNC', 'Inventory reconcile: 452 items verified.', DATEADD(day, -1, GETDATE())),
('ERR',  'Failed to process inbound manifest #MF-9920.', DATEADD(day, -1, GETDATE()));
GO

-- 6. Seed Alerts
INSERT INTO Alerts (AlertType, Category, Title, Description, IsRead, RelatedID, CreatedAt)
SELECT 'CRITICAL_THRESHOLD', 'STOCK', 'Critical Shortage: Nexus 9300 Switch', 'Current stock is 1 unit. Minimum threshold is 3 units. Immediate reorder required.', 0, ProductID, DATEADD(hour, -1, GETDATE())
FROM Products WHERE SKU = 'NET-N9300-48';

INSERT INTO Alerts (AlertType, Category, Title, Description, IsRead, RelatedID, CreatedAt)
SELECT 'CRITICAL_THRESHOLD', 'STOCK', 'Reorder Warning: ProLiant DL380 Server', 'Current stock (2) below reorder level (5).', 0, ProductID, DATEADD(hour, -3, GETDATE())
FROM Products WHERE SKU = 'SRV-DL380-G10';

INSERT INTO Alerts (AlertType, Category, Title, Description, IsRead, CreatedAt) VALUES
('SYSTEM_LOG', 'SYSTEM', 'Security Patch Available', 'Firmware update v4.2.1 is available for all managed network switches.', 0, DATEADD(day, -1, GETDATE())),
('SYSTEM_LOG', 'SYSTEM', 'Monthly Inventory Audit Due', 'The scheduled Q2 inventory audit is required by end of week.', 1, DATEADD(day, -2, GETDATE()));
GO

-- 7. Seed Inventory Transactions (for Dashboard Chart)
-- Generate some random volume over the last 10 days
INSERT INTO InventoryTransactions (ProductID, WarehouseID, TransactionType, Quantity, TransactionDate, PerformedByUserID, Remarks, ReferenceType)
SELECT TOP 20
    p.ProductID, 1, 'ADJUSTMENT', 1 + (p.ProductID % 5), DATEADD(day, - (p.ProductID % 10), GETDATE()), 1, 'Seed Data Adjustment', 'Adjustment'
FROM Products p, (SELECT 1 AS n UNION SELECT 2 UNION SELECT 3) x;
GO

-- 8. Seed Purchase Orders
INSERT INTO PurchaseOrders (SupplierID, OrderDate, TotalAmount, Status, OrderedByUserID, WarehouseID)
VALUES (1, DATEADD(day, -1, GETDATE()), 15400.00, 'Pending', 1, 1);
GO



PRINT 'Dummy data seeding complete.';
GO
