-- ================================================
-- IMS Database Migration Script
-- Adds Alerts table and enhances existing tables
-- ================================================

USE InventoryManagementSystemDB;
GO

-- Add Description column to Products if missing
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'Description')
    ALTER TABLE Products ADD Description NVARCHAR(500) NULL;
GO

-- Add Status column to Inventory if missing
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Inventory') AND name = 'Status')
    ALTER TABLE Inventory ADD Status NVARCHAR(30) NOT NULL DEFAULT 'OPTIMAL';
GO

-- Update Status based on quantity vs ReorderLevel
UPDATE i SET i.Status = 
    CASE 
        WHEN i.QuantityOnHand = 0 THEN 'CRITICAL_SHORTAGE'
        WHEN i.QuantityOnHand <= p.ReorderLevel THEN 'REORDER_WARNING'
        ELSE 'OPTIMAL'
    END
FROM Inventory i
JOIN Products p ON i.ProductID = p.ProductID;
GO

-- Add hashed password support and LastLogin to Users
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'LastLogin')
    ALTER TABLE Users ADD LastLogin DATETIME NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'RequirePasswordChange')
    ALTER TABLE Users ADD RequirePasswordChange BIT NOT NULL DEFAULT 0;
GO

-- Create Alerts table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Alerts')
BEGIN
    CREATE TABLE Alerts (
        AlertID       INT IDENTITY(1,1) PRIMARY KEY,
        AlertType     NVARCHAR(30)  NOT NULL,  -- 'CRITICAL_THRESHOLD','INBOUND_DELIVERY','SYSTEM_LOG','STOCK_WARNING'
        Category      NVARCHAR(20)  NOT NULL,  -- 'STOCK','SYSTEM'
        Title         NVARCHAR(200) NOT NULL,
        Description   NVARCHAR(1000) NOT NULL,
        IsRead        BIT NOT NULL DEFAULT 0,
        RelatedID     INT NULL,                 -- e.g. ProductID or PurchaseOrderID
        CreatedAt     DATETIME NOT NULL DEFAULT GETDATE(),
        AcknowledgedAt DATETIME NULL,
        AcknowledgedBy INT NULL REFERENCES Users(UserID)
    );
END
GO

-- Seed some alerts from real inventory data
INSERT INTO Alerts (AlertType, Category, Title, Description, IsRead, RelatedID)
SELECT TOP 5
    'CRITICAL_THRESHOLD', 'STOCK',
    'Low Stock: ' + p.ProductName,
    'Inventory for ' + p.ProductName + ' (SKU: ' + p.SKU + ') is critically low at ' + CAST(i.QuantityOnHand AS NVARCHAR) + ' units. Reorder level: ' + CAST(p.ReorderLevel AS NVARCHAR) + '.',
    0,
    p.ProductID
FROM Inventory i
JOIN Products p ON i.ProductID = p.ProductID
WHERE i.QuantityOnHand <= p.ReorderLevel
AND NOT EXISTS (SELECT 1 FROM Alerts a WHERE a.RelatedID = p.ProductID AND a.AlertType = 'CRITICAL_THRESHOLD');
GO

-- Create SystemLogs table
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'SystemLogs')
BEGIN
    CREATE TABLE SystemLogs (
        LogID       INT IDENTITY(1,1) PRIMARY KEY,
        LogType     NVARCHAR(20)  NOT NULL,  -- 'SYNC','WARN','ERR','INFO','USER','SYS'
        Message     NVARCHAR(500) NOT NULL,
        CreatedAt   DATETIME NOT NULL DEFAULT GETDATE(),
        UserID      INT NULL REFERENCES Users(UserID)
    );
END
GO

-- Seed initial system logs
IF NOT EXISTS (SELECT 1 FROM SystemLogs)
BEGIN
    INSERT INTO SystemLogs (LogType, Message) VALUES
    ('SYNC', 'CRON_JOB_01 completed. Inventory sync finished.'),
    ('INFO', 'Backup sequence initiated on DB_PRIMARY.'),
    ('SYNC', 'API Gateway connection verified.'),
    ('USER', 'SYS_ADMIN logged in.'),
    ('WARN', 'High memory usage detected on worker_node_1.');
END
GO

PRINT 'Migration complete.';
GO
