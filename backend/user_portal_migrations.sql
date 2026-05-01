-- ================================================
-- User Portal Extension Migrations
-- Adds Invoices, Warehouse Locations, and enhancements
-- ================================================

USE InventoryManagementSystemDB;
GO

-- 1. Create Invoices Table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Invoices')
BEGIN
    CREATE TABLE Invoices (
        InvoiceID     INT IDENTITY(1,1) PRIMARY KEY,
        InvoiceNumber NVARCHAR(50) NOT NULL UNIQUE,
        CustomerID    INT NULL, -- Optional if you have a Customers table
        CustomerName  NVARCHAR(200) NOT NULL,
        TotalAmount   DECIMAL(18,2) NOT NULL,
        Status        NVARCHAR(20) NOT NULL DEFAULT 'UNPAID', -- 'UNPAID', 'PAID', 'DRAFT', 'CANCELLED'
        TaxAmount     DECIMAL(18,2) DEFAULT 0,
        Discount      DECIMAL(18,2) DEFAULT 0,
        CreatedAt     DATETIME NOT NULL DEFAULT GETDATE(),
        DueDate       DATETIME NULL,
        CreatedBy     INT NULL REFERENCES Users(UserID)
    );
END
GO

-- 2. Create InvoiceItems Table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'InvoiceItems')
BEGIN
    CREATE TABLE InvoiceItems (
        ItemID        INT IDENTITY(1,1) PRIMARY KEY,
        InvoiceID     INT NOT NULL REFERENCES Invoices(InvoiceID) ON DELETE CASCADE,
        ProductID     INT NOT NULL REFERENCES Products(ProductID),
        Quantity      INT NOT NULL,
        UnitPrice     DECIMAL(18,2) NOT NULL,
        SubTotal      DECIMAL(18,2) NOT NULL
    );
END
GO

-- 3. Enhance Inventory with Location Tracking
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Inventory') AND name = 'Aisle')
    ALTER TABLE Inventory ADD Aisle NVARCHAR(10) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Inventory') AND name = 'Shelf')
    ALTER TABLE Inventory ADD Shelf NVARCHAR(10) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Inventory') AND name = 'Bin')
    ALTER TABLE Inventory ADD Bin NVARCHAR(10) NULL;
GO

-- 4. Seed some sample locations
UPDATE Inventory SET Aisle = 'A1', Shelf = '12', Bin = '04-B' WHERE ProductID IN (SELECT TOP 2 ProductID FROM Products);
UPDATE Inventory SET Aisle = 'A2', Shelf = '11', Bin = '12-A' WHERE ProductID NOT IN (SELECT TOP 2 ProductID FROM Products);
GO

-- 5. Seed some sample Invoices for Dashboard stats
IF (SELECT COUNT(*) FROM Invoices) = 0
BEGIN
    INSERT INTO Invoices (InvoiceNumber, CustomerName, TotalAmount, Status, DueDate) VALUES
    ('INV-2026-001', 'Acme Corp', 12500.00, 'UNPAID', DATEADD(day, 14, GETDATE())),
    ('INV-2026-002', 'TechGlobal', 8400.00, 'UNPAID', DATEADD(day, 7, GETDATE())),
    ('INV-2026-003', 'Nexus Ind.', 2200.00, 'PAID', GETDATE()),
    ('INV-2026-004', 'Apex Foundry', 450.00, 'DRAFT', DATEADD(day, 30, GETDATE()));
END
GO

PRINT 'User Portal migrations applied successfully.';
