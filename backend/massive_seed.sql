-- ================================================
-- IMS Massive Seeding Script
-- Populates the system with high-volume dummy data
-- ================================================

USE InventoryManagementSystemDB;
GO

-- 1. Add More Suppliers
INSERT INTO Suppliers (SupplierName, ContactPerson, Phone, Email, Address, City, IsActive) VALUES
('TechFlow Solutions', 'James Wu', '555-0987', 'contact@techflow.io', '88 Innovation Dr', 'San Francisco', 1),
('BlueRidge Logistics', 'Amanda Green', '555-4433', 'ops@blueridge.com', '44 Mountain View', 'Denver', 1),
('Titan Manufacturing', 'Viktor Volkov', '555-2211', 'sales@titan.mf', '22 Industrial Pkwy', 'Chicago', 1),
('Solaris Energy', 'Sunita Rao', '555-7788', 'support@solaris.en', '77 Sun Way', 'Phoenix', 1),
('AeroParts Corp', 'Charles Lindy', '555-1122', 'parts@aeroparts.com', '11 Hangar Rd', 'Seattle', 1);
GO

-- 2. Add 50+ Diverse Products
DECLARE @CatComputing INT = (SELECT TOP 1 CategoryID FROM Categories WHERE CategoryName = 'Computing Hardware');
DECLARE @CatNetwork INT = (SELECT TOP 1 CategoryID FROM Categories WHERE CategoryName = 'Network Infrastructure');
DECLARE @CatIndustrial INT = (SELECT TOP 1 CategoryID FROM Categories WHERE CategoryName = 'Industrial Machinery');
DECLARE @CatFurniture INT = (SELECT TOP 1 CategoryID FROM Categories WHERE CategoryName = 'Office Furniture');

INSERT INTO Products (ProductName, SKU, CategoryID, SupplierID, UnitPrice, CostPrice, ReorderLevel, UnitOfMeasure, IsActive, CreatedAt, Description) VALUES
('Quantum CPU V8', 'CPU-Q8-001', @CatComputing, 1, 1200.00, 850.00, 20, 'Unit', 1, GETDATE(), 'Next-gen processor for AI workloads'),
('RTX Core X100', 'GPU-RTX-X100', @CatComputing, 1, 899.00, 600.00, 15, 'Unit', 1, GETDATE(), 'High-performance graphics unit'),
('Nexus Mesh Router', 'NET-MSH-04', @CatNetwork, 2, 299.00, 180.00, 50, 'Unit', 1, GETDATE(), 'Enterprise mesh networking node'),
('Titan Industrial Drill', 'IND-DRL-PRO', @CatIndustrial, 3, 5400.00, 3900.00, 5, 'Unit', 1, GETDATE(), 'Heavy-duty hydraulic drill'),
('Ergo Task Chair', 'FUR-CHR-09', @CatFurniture, 4, 450.00, 210.00, 30, 'Unit', 1, GETDATE(), 'Premium ergonomic office chair'),
('Fiber Optic Cable 50m', 'CAB-FIB-50', @CatNetwork, 2, 85.00, 35.00, 200, 'Roll', 1, GETDATE(), 'High-speed data transfer cable'),
('Smart Hub Controller', 'IOT-HUB-22', @CatNetwork, 5, 120.00, 75.00, 100, 'Unit', 1, GETDATE(), 'Centralized IoT management device'),
('Steel Storage Rack', 'FUR-RCK-LRG', @CatFurniture, 3, 350.00, 190.00, 25, 'Unit', 1, GETDATE(), 'Industrial-grade storage solution'),
('Power Supply 850W', 'PSU-850-GLD', @CatComputing, 1, 150.00, 95.00, 40, 'Unit', 1, GETDATE(), '80 Plus Gold certified PSU'),
('Hydraulic Valve SV-4', 'IND-VLV-SV4', @CatIndustrial, 3, 220.00, 140.00, 60, 'Unit', 1, GETDATE(), 'High-pressure hydraulic control valve');

-- Add many more with a loop for volume
DECLARE @i INT = 1;
WHILE @i <= 40
BEGIN
    INSERT INTO Products (ProductName, SKU, CategoryID, SupplierID, UnitPrice, CostPrice, ReorderLevel, UnitOfMeasure, IsActive, CreatedAt, Description)
    VALUES (
        'Bulk Component #' + CAST(@i AS NVARCHAR), 
        'COMP-' + CAST(1000 + @i AS NVARCHAR), 
        @CatComputing, 
        1 + (@i % 4), 
        25.00 + (@i * 2), 
        15.00 + @i, 
        10 + (@i % 20), 
        'Unit', 1, GETDATE(), 
        'Generic bulk component for assembly line.'
    );
    SET @i = @i + 1;
END
GO

-- 3. Populate Inventory for all new products
INSERT INTO Inventory (ProductID, WarehouseID, QuantityOnHand, Status, LastUpdated, Aisle, Shelf, Bin)
SELECT 
    p.ProductID, 
    1, 
    5 + (p.ProductID % 200), 
    'OPTIMAL', 
    GETDATE(),
    'A' + CAST(1 + (p.ProductID % 5) AS NVARCHAR),
    CAST(10 + (p.ProductID % 10) AS NVARCHAR),
    'B-' + CAST(100 + (p.ProductID % 50) AS NVARCHAR)
FROM Products p
WHERE NOT EXISTS (SELECT 1 FROM Inventory i WHERE i.ProductID = p.ProductID);

-- Randomize some statuses to show variety on Dashboard
UPDATE Inventory SET Status = 'REORDER_WARNING', QuantityOnHand = 2 WHERE ProductID % 7 = 0;
UPDATE Inventory SET Status = 'CRITICAL_SHORTAGE', QuantityOnHand = 0 WHERE ProductID % 13 = 0;
GO

-- 4. Seed 30+ Invoices
DECLARE @j INT = 5;
WHILE @j <= 35
BEGIN
    INSERT INTO Invoices (InvoiceNumber, CustomerName, TotalAmount, Status, DueDate)
    VALUES (
        'INV-2026-' + RIGHT('000' + CAST(@j AS NVARCHAR), 3),
        CASE WHEN @j % 3 = 0 THEN 'Acme Corp' WHEN @j % 3 = 1 THEN 'TechGlobal' ELSE 'Nexus Ind.' END,
        500.00 + (@j * 150),
        CASE WHEN @j % 4 = 0 THEN 'PAID' WHEN @j % 4 = 1 THEN 'UNPAID' WHEN @j % 4 = 2 THEN 'DRAFT' ELSE 'UNPAID' END,
        DATEADD(day, @j, GETDATE())
    );
    SET @j = @j + 1;
END
GO

-- 5. Seed 100+ System Logs
DECLARE @k INT = 1;
WHILE @k <= 100
BEGIN
    INSERT INTO SystemLogs (LogType, Message, CreatedAt)
    VALUES (
        CASE WHEN @k % 10 = 0 THEN 'ERR' WHEN @k % 5 = 0 THEN 'WARN' ELSE 'SYNC' END,
        CASE 
            WHEN @k % 3 = 0 THEN 'Inventory reconcile batch #' + CAST(@k AS NVARCHAR) + ' completed.'
            WHEN @k % 3 = 1 THEN 'User session verified for Node_' + CAST(@k % 5 AS NVARCHAR)
            ELSE 'Data packet ' + CAST(@k * 124 AS NVARCHAR) + ' transmitted to DR site.'
        END,
        DATEADD(minute, -(@k * 15), GETDATE())
    );
    SET @k = @k + 1;
END
GO

PRINT 'Massive seeding complete. Dashboard should now look very active.';
