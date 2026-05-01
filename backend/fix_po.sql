USE InventoryManagementSystemDB;
GO

-- 1. Fix Status Constraint
IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_PurchaseOrders_Status')
BEGIN
    ALTER TABLE PurchaseOrders DROP CONSTRAINT CK_PurchaseOrders_Status;
END
ALTER TABLE PurchaseOrders ADD CONSTRAINT CK_PurchaseOrders_Status CHECK (Status IN ('Pending', 'Received', 'Cancelled', 'Closed', 'Shipped'));
GO

-- 2. Fix Subtotal Column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('PurchaseOrderDetails') AND name = 'Subtotal')
BEGIN
    ALTER TABLE PurchaseOrderDetails ADD Subtotal DECIMAL(18,2);
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('InvoiceItems') AND name = 'Subtotal')
BEGIN
    ALTER TABLE InvoiceItems ADD Subtotal DECIMAL(18,2);
END
GO
