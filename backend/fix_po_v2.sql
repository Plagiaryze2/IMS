USE InventoryManagementSystemDB;
GO

-- 1. Ensure Status constraint allows 'Received'
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_PurchaseOrders_Status')
BEGIN
    ALTER TABLE PurchaseOrders DROP CONSTRAINT CK_PurchaseOrders_Status;
END
ALTER TABLE PurchaseOrders ADD CONSTRAINT CK_PurchaseOrders_Status CHECK (Status IN ('Pending', 'Received', 'Cancelled', 'Closed', 'Shipped'));
GO

-- 2. Add LineTotal column (new name to avoid confusion)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PurchaseOrderDetails') AND name = 'LineTotal')
BEGIN
    ALTER TABLE PurchaseOrderDetails ADD LineTotal DECIMAL(18,2);
END
GO
