-- =================================================================================
-- IMS DATABASE SCHEMA EXPORT
-- Generated on: 5/1/2026, 10:24:11 PM
-- =================================================================================

USE [master];
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'InventoryManagementSystemDB')
BEGIN
    CREATE DATABASE [InventoryManagementSystemDB];
END
GO

USE [InventoryManagementSystemDB];
GO

-- --------------------------------------------------
-- Table: Adjustments
-- --------------------------------------------------
IF OBJECT_ID('[Adjustments]', 'U') IS NOT NULL DROP TABLE [Adjustments];
GO
CREATE TABLE [Adjustments] (
    [AdjustmentID] INT IDENTITY(1,1) NOT NULL,
    [ProductID] INT NOT NULL,
    [WarehouseID] INT NOT NULL,
    [AdjustmentType] VARCHAR(20) NOT NULL,
    [QuantityAdjusted] INT NOT NULL,
    [AdjustmentDate] DATETIME2 NOT NULL DEFAULT (sysdatetime()),
    [Reason] VARCHAR(255) NULL,
    [AdjustedByUserID] INT NOT NULL,
    PRIMARY KEY ([AdjustmentID])
);
GO

-- --------------------------------------------------
-- Table: Alerts
-- --------------------------------------------------
IF OBJECT_ID('[Alerts]', 'U') IS NOT NULL DROP TABLE [Alerts];
GO
CREATE TABLE [Alerts] (
    [AlertID] INT IDENTITY(1,1) NOT NULL,
    [AlertType] NVARCHAR(30) NOT NULL,
    [Category] NVARCHAR(20) NOT NULL,
    [Title] NVARCHAR(200) NOT NULL,
    [Description] NVARCHAR(1000) NOT NULL,
    [IsRead] BIT NOT NULL DEFAULT ((0)),
    [RelatedID] INT NULL,
    [CreatedAt] DATETIME NOT NULL DEFAULT (getdate()),
    [AcknowledgedAt] DATETIME NULL,
    [AcknowledgedBy] INT NULL,
    PRIMARY KEY ([AlertID])
);
GO

-- --------------------------------------------------
-- Table: Categories
-- --------------------------------------------------
IF OBJECT_ID('[Categories]', 'U') IS NOT NULL DROP TABLE [Categories];
GO
CREATE TABLE [Categories] (
    [CategoryID] INT IDENTITY(1,1) NOT NULL,
    [CategoryName] VARCHAR(100) NOT NULL,
    [Description] VARCHAR(255) NULL,
    PRIMARY KEY ([CategoryID])
);
GO

-- --------------------------------------------------
-- Table: Customers
-- --------------------------------------------------
IF OBJECT_ID('[Customers]', 'U') IS NOT NULL DROP TABLE [Customers];
GO
CREATE TABLE [Customers] (
    [CustomerID] INT IDENTITY(1,1) NOT NULL,
    [CustomerName] VARCHAR(150) NOT NULL,
    [Phone] VARCHAR(20) NULL,
    [Email] VARCHAR(100) NULL,
    [Address] VARCHAR(255) NULL,
    [CustomerType] VARCHAR(20) NOT NULL DEFAULT ('Regular'),
    PRIMARY KEY ([CustomerID])
);
GO

-- --------------------------------------------------
-- Table: Deliveries
-- --------------------------------------------------
IF OBJECT_ID('[Deliveries]', 'U') IS NOT NULL DROP TABLE [Deliveries];
GO
CREATE TABLE [Deliveries] (
    [DeliveryID] INT IDENTITY(1,1) NOT NULL,
    [SalesOrderID] INT NOT NULL,
    [WarehouseID] INT NOT NULL,
    [DispatchedByUserID] INT NOT NULL,
    [DeliveryDate] DATE NULL,
    [TrackingCode] VARCHAR(50) NOT NULL,
    [DeliveryStatus] VARCHAR(20) NOT NULL DEFAULT ('Scheduled'),
    [DestinationAddress] VARCHAR(255) NOT NULL,
    PRIMARY KEY ([DeliveryID])
);
GO

-- --------------------------------------------------
-- Table: DeliveryHistory
-- --------------------------------------------------
IF OBJECT_ID('[DeliveryHistory]', 'U') IS NOT NULL DROP TABLE [DeliveryHistory];
GO
CREATE TABLE [DeliveryHistory] (
    [HistoryID] INT IDENTITY(1,1) NOT NULL,
    [DeliveryID] INT NOT NULL,
    [Status] NVARCHAR(50) NOT NULL,
    [Location] NVARCHAR(255) NULL,
    [Timestamp] DATETIME NOT NULL DEFAULT (getdate()),
    [Notes] NVARCHAR(MAX) NULL,
    PRIMARY KEY ([HistoryID])
);
GO

-- --------------------------------------------------
-- Table: Inventory
-- --------------------------------------------------
IF OBJECT_ID('[Inventory]', 'U') IS NOT NULL DROP TABLE [Inventory];
GO
CREATE TABLE [Inventory] (
    [InventoryID] INT IDENTITY(1,1) NOT NULL,
    [ProductID] INT NOT NULL,
    [WarehouseID] INT NOT NULL,
    [QuantityOnHand] INT NOT NULL DEFAULT ((0)),
    [LastUpdated] DATETIME2 NOT NULL DEFAULT (sysdatetime()),
    [Status] NVARCHAR(30) NOT NULL DEFAULT ('OPTIMAL'),
    [Aisle] NVARCHAR(10) NULL,
    [Shelf] NVARCHAR(10) NULL,
    [Bin] NVARCHAR(10) NULL,
    PRIMARY KEY ([InventoryID])
);
GO

-- --------------------------------------------------
-- Table: InventoryTransactions
-- --------------------------------------------------
IF OBJECT_ID('[InventoryTransactions]', 'U') IS NOT NULL DROP TABLE [InventoryTransactions];
GO
CREATE TABLE [InventoryTransactions] (
    [TransactionID] INT IDENTITY(1,1) NOT NULL,
    [ProductID] INT NOT NULL,
    [WarehouseID] INT NOT NULL,
    [ReferenceType] VARCHAR(30) NOT NULL,
    [ReferenceID] INT NULL,
    [TransactionType] VARCHAR(30) NOT NULL,
    [Quantity] INT NOT NULL,
    [TransactionDate] DATETIME2 NOT NULL DEFAULT (sysdatetime()),
    [PerformedByUserID] INT NOT NULL,
    [Remarks] VARCHAR(255) NULL,
    PRIMARY KEY ([TransactionID])
);
GO

-- --------------------------------------------------
-- Table: InvoiceItems
-- --------------------------------------------------
IF OBJECT_ID('[InvoiceItems]', 'U') IS NOT NULL DROP TABLE [InvoiceItems];
GO
CREATE TABLE [InvoiceItems] (
    [ItemID] INT IDENTITY(1,1) NOT NULL,
    [InvoiceID] INT NOT NULL,
    [ProductID] INT NOT NULL,
    [Quantity] INT NOT NULL,
    [UnitPrice] DECIMAL NOT NULL,
    [SubTotal] DECIMAL NOT NULL,
    PRIMARY KEY ([ItemID])
);
GO

-- --------------------------------------------------
-- Table: Invoices
-- --------------------------------------------------
IF OBJECT_ID('[Invoices]', 'U') IS NOT NULL DROP TABLE [Invoices];
GO
CREATE TABLE [Invoices] (
    [InvoiceID] INT IDENTITY(1,1) NOT NULL,
    [SalesOrderID] INT NOT NULL,
    [CustomerID] INT NOT NULL,
    [InvoiceDate] DATE NOT NULL,
    [DueDate] DATE NOT NULL,
    [TotalAmount] DECIMAL NOT NULL,
    [InvoiceStatus] VARCHAR(20) NOT NULL DEFAULT ('Unpaid'),
    PRIMARY KEY ([InvoiceID])
);
GO

-- --------------------------------------------------
-- Table: LocationCapacity
-- --------------------------------------------------
IF OBJECT_ID('[LocationCapacity]', 'U') IS NOT NULL DROP TABLE [LocationCapacity];
GO
CREATE TABLE [LocationCapacity] (
    [LocationID] INT IDENTITY(1,1) NOT NULL,
    [WarehouseID] INT NOT NULL,
    [Aisle] NVARCHAR(50) NOT NULL,
    [Shelf] NVARCHAR(50) NULL,
    [Bin] NVARCHAR(50) NULL,
    [MaxCapacity] INT NOT NULL DEFAULT ((500)),
    PRIMARY KEY ([LocationID])
);
GO

-- --------------------------------------------------
-- Table: Payments
-- --------------------------------------------------
IF OBJECT_ID('[Payments]', 'U') IS NOT NULL DROP TABLE [Payments];
GO
CREATE TABLE [Payments] (
    [PaymentID] INT IDENTITY(1,1) NOT NULL,
    [InvoiceID] INT NOT NULL,
    [PaymentDate] DATE NOT NULL,
    [AmountPaid] DECIMAL NOT NULL,
    [PaymentMethod] VARCHAR(20) NOT NULL,
    [PaymentStatus] VARCHAR(20) NOT NULL DEFAULT ('Completed'),
    [ReceivedByUserID] INT NOT NULL,
    PRIMARY KEY ([PaymentID])
);
GO

-- --------------------------------------------------
-- Table: Permissions
-- --------------------------------------------------
IF OBJECT_ID('[Permissions]', 'U') IS NOT NULL DROP TABLE [Permissions];
GO
CREATE TABLE [Permissions] (
    [PermissionID] INT IDENTITY(1,1) NOT NULL,
    [PermissionName] VARCHAR(100) NOT NULL,
    [Description] VARCHAR(255) NULL,
    PRIMARY KEY ([PermissionID])
);
GO

-- --------------------------------------------------
-- Table: Products
-- --------------------------------------------------
IF OBJECT_ID('[Products]', 'U') IS NOT NULL DROP TABLE [Products];
GO
CREATE TABLE [Products] (
    [ProductID] INT IDENTITY(1,1) NOT NULL,
    [ProductName] VARCHAR(150) NOT NULL,
    [SKU] VARCHAR(50) NOT NULL,
    [CategoryID] INT NOT NULL,
    [SupplierID] INT NOT NULL,
    [UnitPrice] DECIMAL NOT NULL,
    [CostPrice] DECIMAL NOT NULL,
    [ReorderLevel] INT NOT NULL DEFAULT ((0)),
    [UnitOfMeasure] VARCHAR(20) NOT NULL DEFAULT ('Piece'),
    [IsActive] BIT NOT NULL DEFAULT ((1)),
    [CreatedAt] DATETIME2 NOT NULL DEFAULT (sysdatetime()),
    [Description] NVARCHAR(500) NULL,
    PRIMARY KEY ([ProductID])
);
GO

-- --------------------------------------------------
-- Table: PurchaseOrderDetails
-- --------------------------------------------------
IF OBJECT_ID('[PurchaseOrderDetails]', 'U') IS NOT NULL DROP TABLE [PurchaseOrderDetails];
GO
CREATE TABLE [PurchaseOrderDetails] (
    [PODetailID] INT IDENTITY(1,1) NOT NULL,
    [PurchaseOrderID] INT NOT NULL,
    [ProductID] INT NOT NULL,
    [QuantityOrdered] INT NOT NULL,
    [UnitCost] DECIMAL NOT NULL,
    [LineTotal] DECIMAL NOT NULL,
    PRIMARY KEY ([PODetailID])
);
GO

-- --------------------------------------------------
-- Table: PurchaseOrders
-- --------------------------------------------------
IF OBJECT_ID('[PurchaseOrders]', 'U') IS NOT NULL DROP TABLE [PurchaseOrders];
GO
CREATE TABLE [PurchaseOrders] (
    [PurchaseOrderID] INT IDENTITY(1,1) NOT NULL,
    [SupplierID] INT NOT NULL,
    [OrderedByUserID] INT NOT NULL,
    [WarehouseID] INT NOT NULL,
    [OrderDate] DATE NOT NULL,
    [ExpectedDate] DATE NULL,
    [Status] VARCHAR(20) NOT NULL DEFAULT ('Pending'),
    [TotalAmount] DECIMAL NOT NULL DEFAULT ((0)),
    PRIMARY KEY ([PurchaseOrderID])
);
GO

-- --------------------------------------------------
-- Table: RolePermissions
-- --------------------------------------------------
IF OBJECT_ID('[RolePermissions]', 'U') IS NOT NULL DROP TABLE [RolePermissions];
GO
CREATE TABLE [RolePermissions] (
    [RoleID] INT NOT NULL,
    [PermissionID] INT NOT NULL,
    [GrantedAt] DATETIME2 NOT NULL DEFAULT (sysdatetime()),
    PRIMARY KEY ([PermissionID], [RoleID])
);
GO

-- --------------------------------------------------
-- Table: Roles
-- --------------------------------------------------
IF OBJECT_ID('[Roles]', 'U') IS NOT NULL DROP TABLE [Roles];
GO
CREATE TABLE [Roles] (
    [RoleID] INT IDENTITY(1,1) NOT NULL,
    [RoleName] VARCHAR(50) NOT NULL,
    [Description] VARCHAR(255) NULL,
    PRIMARY KEY ([RoleID])
);
GO

-- --------------------------------------------------
-- Table: SalesOrderDetails
-- --------------------------------------------------
IF OBJECT_ID('[SalesOrderDetails]', 'U') IS NOT NULL DROP TABLE [SalesOrderDetails];
GO
CREATE TABLE [SalesOrderDetails] (
    [SODetailID] INT IDENTITY(1,1) NOT NULL,
    [SalesOrderID] INT NOT NULL,
    [ProductID] INT NOT NULL,
    [QuantitySold] INT NOT NULL,
    [UnitPrice] DECIMAL NOT NULL,
    [DiscountAmount] DECIMAL NOT NULL DEFAULT ((0)),
    [LineTotal] DECIMAL NOT NULL,
    PRIMARY KEY ([SODetailID])
);
GO

-- --------------------------------------------------
-- Table: SalesOrders
-- --------------------------------------------------
IF OBJECT_ID('[SalesOrders]', 'U') IS NOT NULL DROP TABLE [SalesOrders];
GO
CREATE TABLE [SalesOrders] (
    [SalesOrderID] INT IDENTITY(1,1) NOT NULL,
    [CustomerID] INT NOT NULL,
    [CreatedByUserID] INT NOT NULL,
    [OrderDate] DATE NOT NULL,
    [Status] VARCHAR(20) NOT NULL DEFAULT ('Pending'),
    [TotalAmount] DECIMAL NOT NULL DEFAULT ((0)),
    [ShippingAddress] VARCHAR(255) NULL,
    PRIMARY KEY ([SalesOrderID])
);
GO

-- --------------------------------------------------
-- Table: Suppliers
-- --------------------------------------------------
IF OBJECT_ID('[Suppliers]', 'U') IS NOT NULL DROP TABLE [Suppliers];
GO
CREATE TABLE [Suppliers] (
    [SupplierID] INT IDENTITY(1,1) NOT NULL,
    [SupplierName] VARCHAR(150) NOT NULL,
    [ContactName] VARCHAR(100) NULL,
    [Phone] VARCHAR(20) NOT NULL,
    [Email] VARCHAR(100) NULL,
    [Address] VARCHAR(255) NULL,
    [City] VARCHAR(100) NULL,
    [IsActive] BIT NOT NULL DEFAULT ((1)),
    PRIMARY KEY ([SupplierID])
);
GO

-- --------------------------------------------------
-- Table: UserRoles
-- --------------------------------------------------
IF OBJECT_ID('[UserRoles]', 'U') IS NOT NULL DROP TABLE [UserRoles];
GO
CREATE TABLE [UserRoles] (
    [UserID] INT NOT NULL,
    [RoleID] INT NOT NULL,
    [AssignedAt] DATETIME2 NOT NULL DEFAULT (sysdatetime()),
    PRIMARY KEY ([RoleID], [UserID])
);
GO

-- --------------------------------------------------
-- Table: Users
-- --------------------------------------------------
IF OBJECT_ID('[Users]', 'U') IS NOT NULL DROP TABLE [Users];
GO
CREATE TABLE [Users] (
    [UserID] INT IDENTITY(1,1) NOT NULL,
    [Username] VARCHAR(50) NOT NULL,
    [FullName] VARCHAR(100) NOT NULL,
    [Email] VARCHAR(100) NOT NULL,
    [PasswordHash] VARCHAR(255) NOT NULL,
    [Phone] VARCHAR(20) NULL,
    [IsActive] BIT NOT NULL DEFAULT ((1)),
    [CreatedAt] DATETIME2 NOT NULL DEFAULT (sysdatetime()),
    [RequirePasswordChange] BIT NOT NULL DEFAULT ((0)),
    [LastLogin] DATETIME NULL,
    PRIMARY KEY ([UserID])
);
GO

-- --------------------------------------------------
-- Table: Warehouses
-- --------------------------------------------------
IF OBJECT_ID('[Warehouses]', 'U') IS NOT NULL DROP TABLE [Warehouses];
GO
CREATE TABLE [Warehouses] (
    [WarehouseID] INT IDENTITY(1,1) NOT NULL,
    [WarehouseName] VARCHAR(100) NOT NULL,
    [Location] VARCHAR(150) NOT NULL,
    [ManagerName] VARCHAR(100) NULL,
    [ContactNumber] VARCHAR(20) NULL,
    [IsActive] BIT NOT NULL DEFAULT ((1)),
    [MaxCapacity] INT NOT NULL DEFAULT ((10000)),
    PRIMARY KEY ([WarehouseID])
);
GO

-- =================================================================================
-- FOREIGN KEY CONSTRAINTS
-- =================================================================================

ALTER TABLE [PurchaseOrderDetails] ADD CONSTRAINT [FK_PurchaseOrderDetails_PurchaseOrders] FOREIGN KEY ([PurchaseOrderID]) REFERENCES [PurchaseOrders] ([PurchaseOrderID]);
GO
ALTER TABLE [SalesOrders] ADD CONSTRAINT [FK_SalesOrders_Customers] FOREIGN KEY ([CustomerID]) REFERENCES [Customers] ([CustomerID]);
GO
ALTER TABLE [Invoices] ADD CONSTRAINT [FK_Invoices_Customers] FOREIGN KEY ([CustomerID]) REFERENCES [Customers] ([CustomerID]);
GO
ALTER TABLE [SalesOrderDetails] ADD CONSTRAINT [FK_SalesOrderDetails_SalesOrders] FOREIGN KEY ([SalesOrderID]) REFERENCES [SalesOrders] ([SalesOrderID]);
GO
ALTER TABLE [Deliveries] ADD CONSTRAINT [FK_Deliveries_SalesOrders] FOREIGN KEY ([SalesOrderID]) REFERENCES [SalesOrders] ([SalesOrderID]);
GO
ALTER TABLE [Invoices] ADD CONSTRAINT [FK_Invoices_SalesOrders] FOREIGN KEY ([SalesOrderID]) REFERENCES [SalesOrders] ([SalesOrderID]);
GO
ALTER TABLE [DeliveryHistory] ADD CONSTRAINT [FK__DeliveryH__Deliv__09746778] FOREIGN KEY ([DeliveryID]) REFERENCES [Deliveries] ([DeliveryID]);
GO
ALTER TABLE [Payments] ADD CONSTRAINT [FK_Payments_Invoices] FOREIGN KEY ([InvoiceID]) REFERENCES [Invoices] ([InvoiceID]);
GO
ALTER TABLE [InvoiceItems] ADD CONSTRAINT [FK__InvoiceIt__Invoi__7E02B4CC] FOREIGN KEY ([InvoiceID]) REFERENCES [Invoices] ([InvoiceID]);
GO
ALTER TABLE [InventoryTransactions] ADD CONSTRAINT [FK_InventoryTransactions_Users] FOREIGN KEY ([PerformedByUserID]) REFERENCES [Users] ([UserID]);
GO
ALTER TABLE [PurchaseOrders] ADD CONSTRAINT [FK_PurchaseOrders_Users] FOREIGN KEY ([OrderedByUserID]) REFERENCES [Users] ([UserID]);
GO
ALTER TABLE [SalesOrders] ADD CONSTRAINT [FK_SalesOrders_Users] FOREIGN KEY ([CreatedByUserID]) REFERENCES [Users] ([UserID]);
GO
ALTER TABLE [Deliveries] ADD CONSTRAINT [FK_Deliveries_Users] FOREIGN KEY ([DispatchedByUserID]) REFERENCES [Users] ([UserID]);
GO
ALTER TABLE [Payments] ADD CONSTRAINT [FK_Payments_Users] FOREIGN KEY ([ReceivedByUserID]) REFERENCES [Users] ([UserID]);
GO
ALTER TABLE [Adjustments] ADD CONSTRAINT [FK_Adjustments_Users] FOREIGN KEY ([AdjustedByUserID]) REFERENCES [Users] ([UserID]);
GO
ALTER TABLE [UserRoles] ADD CONSTRAINT [FK_UserRoles_Users] FOREIGN KEY ([UserID]) REFERENCES [Users] ([UserID]);
GO
ALTER TABLE [Alerts] ADD CONSTRAINT [FK__Alerts__Acknowle__7755B73D] FOREIGN KEY ([AcknowledgedBy]) REFERENCES [Users] ([UserID]);
GO
ALTER TABLE [SystemLogs] ADD CONSTRAINT [FK__SystemLog__UserI__7B264821] FOREIGN KEY ([UserID]) REFERENCES [Users] ([UserID]);
GO
ALTER TABLE [UserRoles] ADD CONSTRAINT [FK_UserRoles_Roles] FOREIGN KEY ([RoleID]) REFERENCES [Roles] ([RoleID]);
GO
ALTER TABLE [RolePermissions] ADD CONSTRAINT [FK_RolePermissions_Roles] FOREIGN KEY ([RoleID]) REFERENCES [Roles] ([RoleID]);
GO
ALTER TABLE [RolePermissions] ADD CONSTRAINT [FK_RolePermissions_Permissions] FOREIGN KEY ([PermissionID]) REFERENCES [Permissions] ([PermissionID]);
GO
ALTER TABLE [Products] ADD CONSTRAINT [FK_Products_Categories] FOREIGN KEY ([CategoryID]) REFERENCES [Categories] ([CategoryID]);
GO
ALTER TABLE [PurchaseOrders] ADD CONSTRAINT [FK_PurchaseOrders_Suppliers] FOREIGN KEY ([SupplierID]) REFERENCES [Suppliers] ([SupplierID]);
GO
ALTER TABLE [Products] ADD CONSTRAINT [FK_Products_Suppliers] FOREIGN KEY ([SupplierID]) REFERENCES [Suppliers] ([SupplierID]);
GO
ALTER TABLE [LocationCapacity] ADD CONSTRAINT [FK__LocationC__Wareh__05A3D694] FOREIGN KEY ([WarehouseID]) REFERENCES [Warehouses] ([WarehouseID]);
GO
ALTER TABLE [PurchaseOrders] ADD CONSTRAINT [FK_PurchaseOrders_Warehouses] FOREIGN KEY ([WarehouseID]) REFERENCES [Warehouses] ([WarehouseID]);
GO
ALTER TABLE [Deliveries] ADD CONSTRAINT [FK_Deliveries_Warehouses] FOREIGN KEY ([WarehouseID]) REFERENCES [Warehouses] ([WarehouseID]);
GO
ALTER TABLE [Adjustments] ADD CONSTRAINT [FK_Adjustments_Warehouses] FOREIGN KEY ([WarehouseID]) REFERENCES [Warehouses] ([WarehouseID]);
GO
ALTER TABLE [Inventory] ADD CONSTRAINT [FK_Inventory_Warehouses] FOREIGN KEY ([WarehouseID]) REFERENCES [Warehouses] ([WarehouseID]);
GO
ALTER TABLE [InventoryTransactions] ADD CONSTRAINT [FK_InventoryTransactions_Warehouses] FOREIGN KEY ([WarehouseID]) REFERENCES [Warehouses] ([WarehouseID]);
GO
ALTER TABLE [PurchaseOrderDetails] ADD CONSTRAINT [FK_PurchaseOrderDetails_Products] FOREIGN KEY ([ProductID]) REFERENCES [Products] ([ProductID]);
GO
ALTER TABLE [SalesOrderDetails] ADD CONSTRAINT [FK_SalesOrderDetails_Products] FOREIGN KEY ([ProductID]) REFERENCES [Products] ([ProductID]);
GO
ALTER TABLE [Adjustments] ADD CONSTRAINT [FK_Adjustments_Products] FOREIGN KEY ([ProductID]) REFERENCES [Products] ([ProductID]);
GO
ALTER TABLE [Inventory] ADD CONSTRAINT [FK_Inventory_Products] FOREIGN KEY ([ProductID]) REFERENCES [Products] ([ProductID]);
GO
ALTER TABLE [InventoryTransactions] ADD CONSTRAINT [FK_InventoryTransactions_Products] FOREIGN KEY ([ProductID]) REFERENCES [Products] ([ProductID]);
GO
ALTER TABLE [InvoiceItems] ADD CONSTRAINT [FK__InvoiceIt__Produ__7EF6D905] FOREIGN KEY ([ProductID]) REFERENCES [Products] ([ProductID]);
GO

-- =================================================================================
-- CHECK CONSTRAINTS
-- =================================================================================

ALTER TABLE [PurchaseOrders] ADD CONSTRAINT [CK_PurchaseOrders_Status] CHECK ([Status]='Partially Received' OR [Status]='Completed' OR [Status]='Approved' OR [Status]='Shipped' OR [Status]='Closed' OR [Status]='Cancelled' OR [Status]='Received' OR [Status]='Pending');
GO
ALTER TABLE [InventoryTransactions] ADD CONSTRAINT [CK_InventoryTransactions_ReferenceType] CHECK ([ReferenceType]='Return' OR [ReferenceType]='Manual' OR [ReferenceType]='Adjustment' OR [ReferenceType]='Delivery' OR [ReferenceType]='SalesOrder' OR [ReferenceType]='PurchaseOrder');
GO
ALTER TABLE [InventoryTransactions] ADD CONSTRAINT [CK_InventoryTransactions_TransactionType] CHECK ([TransactionType]='ADJUSTMENT' OR [TransactionType]='TRANSFER' OR [TransactionType]='OUT' OR [TransactionType]='IN');
GO
ALTER TABLE [InventoryTransactions] ADD CONSTRAINT [CK_InventoryTransactions_Quantity] CHECK ([Quantity]>(0));
GO
ALTER TABLE [PurchaseOrderDetails] ADD CONSTRAINT [CK_PurchaseOrderDetails_QuantityOrdered] CHECK ([QuantityOrdered]>(0));
GO
ALTER TABLE [PurchaseOrderDetails] ADD CONSTRAINT [CK_PurchaseOrderDetails_UnitCost] CHECK ([UnitCost]>=(0));
GO
ALTER TABLE [PurchaseOrderDetails] ADD CONSTRAINT [CK_PurchaseOrderDetails_LineTotal] CHECK ([LineTotal]>=(0));
GO
ALTER TABLE [Customers] ADD CONSTRAINT [CK_Customers_CustomerType] CHECK ([CustomerType]='WalkIn' OR [CustomerType]='Corporate' OR [CustomerType]='Regular');
GO
ALTER TABLE [SalesOrders] ADD CONSTRAINT [CK_SalesOrders_Status] CHECK ([Status]='Cancelled' OR [Status]='Completed' OR [Status]='Dispatched' OR [Status]='Packed' OR [Status]='Confirmed' OR [Status]='Pending');
GO
ALTER TABLE [SalesOrders] ADD CONSTRAINT [CK_SalesOrders_TotalAmount] CHECK ([TotalAmount]>=(0));
GO
ALTER TABLE [SalesOrderDetails] ADD CONSTRAINT [CK_SalesOrderDetails_QuantitySold] CHECK ([QuantitySold]>(0));
GO
ALTER TABLE [SalesOrderDetails] ADD CONSTRAINT [CK_SalesOrderDetails_UnitPrice] CHECK ([UnitPrice]>=(0));
GO
ALTER TABLE [SalesOrderDetails] ADD CONSTRAINT [CK_SalesOrderDetails_DiscountAmount] CHECK ([DiscountAmount]>=(0));
GO
ALTER TABLE [SalesOrderDetails] ADD CONSTRAINT [CK_SalesOrderDetails_LineTotal] CHECK ([LineTotal]>=(0));
GO
ALTER TABLE [Deliveries] ADD CONSTRAINT [CK_Deliveries_Status] CHECK ([DeliveryStatus]='Returned' OR [DeliveryStatus]='Failed' OR [DeliveryStatus]='Delivered' OR [DeliveryStatus]='In Transit' OR [DeliveryStatus]='Shipped' OR [DeliveryStatus]='Packed' OR [DeliveryStatus]='Scheduled');
GO
ALTER TABLE [Invoices] ADD CONSTRAINT [CK_Invoices_TotalAmount] CHECK ([TotalAmount]>=(0));
GO
ALTER TABLE [Invoices] ADD CONSTRAINT [CK_Invoices_Status] CHECK ([InvoiceStatus]='Cancelled' OR [InvoiceStatus]='Overdue' OR [InvoiceStatus]='Paid' OR [InvoiceStatus]='Partially Paid' OR [InvoiceStatus]='Unpaid');
GO
ALTER TABLE [Payments] ADD CONSTRAINT [CK_Payments_AmountPaid] CHECK ([AmountPaid]>=(0));
GO
ALTER TABLE [Payments] ADD CONSTRAINT [CK_Payments_Method] CHECK ([PaymentMethod]='Cheque' OR [PaymentMethod]='Bank Transfer' OR [PaymentMethod]='Credit Card' OR [PaymentMethod]='Cash');
GO
ALTER TABLE [Payments] ADD CONSTRAINT [CK_Payments_Status] CHECK ([PaymentStatus]='Refunded' OR [PaymentStatus]='Failed' OR [PaymentStatus]='Pending' OR [PaymentStatus]='Completed');
GO
ALTER TABLE [Adjustments] ADD CONSTRAINT [CK_Adjustments_Type] CHECK ([AdjustmentType]='Found' OR [AdjustmentType]='Loss' OR [AdjustmentType]='Damage' OR [AdjustmentType]='Stock Out' OR [AdjustmentType]='Stock In');
GO
ALTER TABLE [Adjustments] ADD CONSTRAINT [CK_Adjustments_Quantity] CHECK ([QuantityAdjusted]<>(0));
GO
ALTER TABLE [Products] ADD CONSTRAINT [CK_Products_UnitPrice] CHECK ([UnitPrice]>=(0));
GO
ALTER TABLE [Products] ADD CONSTRAINT [CK_Products_CostPrice] CHECK ([CostPrice]>=(0));
GO
ALTER TABLE [Products] ADD CONSTRAINT [CK_Products_ReorderLevel] CHECK ([ReorderLevel]>=(0));
GO
ALTER TABLE [Inventory] ADD CONSTRAINT [CK_Inventory_QuantityOnHand] CHECK ([QuantityOnHand]>=(0));
GO
