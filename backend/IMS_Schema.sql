CREATE DATABASE InventoryManagementSystemDB;
GO

USE InventoryManagementSystemDB;
GO

-- --------------------------------------------------
-- Table: Adjustments
-- --------------------------------------------------
CREATE TABLE Adjustments (
    AdjustmentID INT IDENTITY(1,1) NOT NULL,
    ProductID INT NOT NULL,
    WarehouseID INT NOT NULL,
    AdjustmentType VARCHAR(20) NOT NULL,
    QuantityAdjusted INT NOT NULL,
    AdjustmentDate DATETIME2 NOT NULL DEFAULT (sysdatetime()),
    Reason VARCHAR(255) NULL,
    AdjustedByUserID INT NOT NULL,
    PRIMARY KEY (AdjustmentID)
);

-- --------------------------------------------------
-- Table: Alerts
-- --------------------------------------------------
CREATE TABLE Alerts (
    AlertID INT IDENTITY(1,1) NOT NULL,
    AlertType NVARCHAR(30) NOT NULL,
    Category NVARCHAR(20) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000) NOT NULL,
    IsRead BIT NOT NULL DEFAULT ((0)),
    RelatedID INT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT (getdate()),
    AcknowledgedAt DATETIME NULL,
    AcknowledgedBy INT NULL,
    PRIMARY KEY (AlertID)
);

-- --------------------------------------------------
-- Table: Categories
-- --------------------------------------------------
CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) NOT NULL,
    CategoryName VARCHAR(100) NOT NULL,
    Description VARCHAR(255) NULL,
    PRIMARY KEY (CategoryID)
);

-- --------------------------------------------------
-- Table: Customers
-- --------------------------------------------------
CREATE TABLE Customers (
    CustomerID INT IDENTITY(1,1) NOT NULL,
    CustomerName VARCHAR(150) NOT NULL,
    Phone VARCHAR(20) NULL,
    Email VARCHAR(100) NULL,
    Address VARCHAR(255) NULL,
    CustomerType VARCHAR(20) NOT NULL DEFAULT ('Regular'),
    PRIMARY KEY (CustomerID)
);

-- --------------------------------------------------
-- Table: Deliveries
-- --------------------------------------------------
CREATE TABLE Deliveries (
    DeliveryID INT IDENTITY(1,1) NOT NULL,
    SalesOrderID INT NOT NULL,
    WarehouseID INT NOT NULL,
    DispatchedByUserID INT NOT NULL,
    DeliveryDate DATE NULL,
    TrackingCode VARCHAR(50) NOT NULL,
    DeliveryStatus VARCHAR(20) NOT NULL DEFAULT ('Scheduled'),
    DestinationAddress VARCHAR(255) NOT NULL,
    PRIMARY KEY (DeliveryID)
);

-- --------------------------------------------------
-- Table: DeliveryHistory
-- --------------------------------------------------
CREATE TABLE DeliveryHistory (
    HistoryID INT IDENTITY(1,1) NOT NULL,
    DeliveryID INT NOT NULL,
    Status NVARCHAR(50) NOT NULL,
    Location NVARCHAR(255) NULL,
    Timestamp DATETIME NOT NULL DEFAULT (getdate()),
    Notes NVARCHAR(MAX) NULL,
    PRIMARY KEY (HistoryID)
);

-- --------------------------------------------------
-- Table: Inventory
-- --------------------------------------------------
CREATE TABLE Inventory (
    InventoryID INT IDENTITY(1,1) NOT NULL,
    ProductID INT NOT NULL,
    WarehouseID INT NOT NULL,
    QuantityOnHand INT NOT NULL DEFAULT ((0)),
    LastUpdated DATETIME2 NOT NULL DEFAULT (sysdatetime()),
    Status NVARCHAR(30) NOT NULL DEFAULT ('OPTIMAL'),
    Aisle NVARCHAR(10) NULL,
    Shelf NVARCHAR(10) NULL,
    Bin NVARCHAR(10) NULL,
    PRIMARY KEY (InventoryID)
);

-- --------------------------------------------------
-- Table: InventoryTransactions
-- --------------------------------------------------
CREATE TABLE InventoryTransactions (
    TransactionID INT IDENTITY(1,1) NOT NULL,
    ProductID INT NOT NULL,
    WarehouseID INT NOT NULL,
    ReferenceType VARCHAR(30) NOT NULL,
    ReferenceID INT NULL,
    TransactionType VARCHAR(30) NOT NULL,
    Quantity INT NOT NULL,
    TransactionDate DATETIME2 NOT NULL DEFAULT (sysdatetime()),
    PerformedByUserID INT NOT NULL,
    Remarks VARCHAR(255) NULL,
    PRIMARY KEY (TransactionID)
);

-- --------------------------------------------------
-- Table: InvoiceItems
-- --------------------------------------------------
CREATE TABLE InvoiceItems (
    ItemID INT IDENTITY(1,1) NOT NULL,
    InvoiceID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    SubTotal DECIMAL(18,2) NOT NULL,
    PRIMARY KEY (ItemID)
);

-- --------------------------------------------------
-- Table: Invoices
-- --------------------------------------------------
CREATE TABLE Invoices (
    InvoiceID INT IDENTITY(1,1) NOT NULL,
    SalesOrderID INT NOT NULL,
    CustomerID INT NOT NULL,
    InvoiceDate DATE NOT NULL,
    DueDate DATE NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    InvoiceStatus VARCHAR(20) NOT NULL DEFAULT ('Unpaid'),
    PRIMARY KEY (InvoiceID)
);

-- --------------------------------------------------
-- Table: LocationCapacity
-- --------------------------------------------------
CREATE TABLE LocationCapacity (
    LocationID INT IDENTITY(1,1) NOT NULL,
    WarehouseID INT NOT NULL,
    Aisle NVARCHAR(50) NOT NULL,
    Shelf NVARCHAR(50) NULL,
    Bin NVARCHAR(50) NULL,
    MaxCapacity INT NOT NULL DEFAULT ((500)),
    PRIMARY KEY (LocationID)
);

-- --------------------------------------------------
-- Table: Payments
-- --------------------------------------------------
CREATE TABLE Payments (
    PaymentID INT IDENTITY(1,1) NOT NULL,
    InvoiceID INT NOT NULL,
    PaymentDate DATE NOT NULL,
    AmountPaid DECIMAL(18,2) NOT NULL,
    PaymentMethod VARCHAR(20) NOT NULL,
    PaymentStatus VARCHAR(20) NOT NULL DEFAULT ('Completed'),
    ReceivedByUserID INT NOT NULL,
    PRIMARY KEY (PaymentID)
);

-- --------------------------------------------------
-- Table: Permissions
-- --------------------------------------------------
CREATE TABLE Permissions (
    PermissionID INT IDENTITY(1,1) NOT NULL,
    PermissionName VARCHAR(100) NOT NULL,
    Description VARCHAR(255) NULL,
    PRIMARY KEY (PermissionID)
);

-- --------------------------------------------------
-- Table: Products
-- --------------------------------------------------
CREATE TABLE Products (
    ProductID INT IDENTITY(1,1) NOT NULL,
    ProductName VARCHAR(150) NOT NULL,
    SKU VARCHAR(50) NOT NULL,
    CategoryID INT NOT NULL,
    SupplierID INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    CostPrice DECIMAL(18,2) NOT NULL,
    ReorderLevel INT NOT NULL DEFAULT ((0)),
    UnitOfMeasure VARCHAR(20) NOT NULL DEFAULT ('Piece'),
    IsActive BIT NOT NULL DEFAULT ((1)),
    CreatedAt DATETIME2 NOT NULL DEFAULT (sysdatetime()),
    Description NVARCHAR(500) NULL,
    Brand NVARCHAR(100) NULL,
    Barcode NVARCHAR(100) NULL,
    TaxRate DECIMAL(5,2) DEFAULT 20.0,
    PRIMARY KEY (ProductID)
);

-- --------------------------------------------------
-- Table: PurchaseOrderDetails
-- --------------------------------------------------
CREATE TABLE PurchaseOrderDetails (
    PODetailID INT IDENTITY(1,1) NOT NULL,
    PurchaseOrderID INT NOT NULL,
    ProductID INT NOT NULL,
    QuantityOrdered INT NOT NULL,
    UnitCost DECIMAL(18,2) NOT NULL,
    LineTotal DECIMAL(18,2) NOT NULL,
    PRIMARY KEY (PODetailID)
);

-- --------------------------------------------------
-- Table: PurchaseOrders
-- --------------------------------------------------
CREATE TABLE PurchaseOrders (
    PurchaseOrderID INT IDENTITY(1,1) NOT NULL,
    SupplierID INT NOT NULL,
    OrderedByUserID INT NOT NULL,
    WarehouseID INT NOT NULL,
    OrderDate DATE NOT NULL,
    ExpectedDate DATE NULL,
    Status VARCHAR(20) NOT NULL DEFAULT ('Pending'),
    TotalAmount DECIMAL(18,2) NOT NULL DEFAULT ((0)),
    PRIMARY KEY (PurchaseOrderID)
);

-- --------------------------------------------------
-- Table: RolePermissions
-- --------------------------------------------------
CREATE TABLE RolePermissions (
    RoleID INT NOT NULL,
    PermissionID INT NOT NULL,
    GrantedAt DATETIME2 NOT NULL DEFAULT (sysdatetime()),
    PRIMARY KEY (PermissionID, RoleID)
);

-- --------------------------------------------------
-- Table: Roles
-- --------------------------------------------------
CREATE TABLE Roles (
    RoleID INT IDENTITY(1,1) NOT NULL,
    RoleName VARCHAR(50) NOT NULL,
    Description VARCHAR(255) NULL,
    PRIMARY KEY (RoleID)
);

-- --------------------------------------------------
-- Table: SalesOrderDetails
-- --------------------------------------------------
CREATE TABLE SalesOrderDetails (
    SODetailID INT IDENTITY(1,1) NOT NULL,
    SalesOrderID INT NOT NULL,
    ProductID INT NOT NULL,
    QuantitySold INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    DiscountAmount DECIMAL(18,2) NOT NULL DEFAULT ((0)),
    LineTotal DECIMAL(18,2) NOT NULL,
    PRIMARY KEY (SODetailID)
);

-- --------------------------------------------------
-- Table: SalesOrders
-- --------------------------------------------------
CREATE TABLE SalesOrders (
    SalesOrderID INT IDENTITY(1,1) NOT NULL,
    CustomerID INT NOT NULL,
    CreatedByUserID INT NOT NULL,
    OrderDate DATE NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT ('Pending'),
    TotalAmount DECIMAL(18,2) NOT NULL DEFAULT ((0)),
    ShippingAddress VARCHAR(255) NULL,
    PRIMARY KEY (SalesOrderID)
);

-- --------------------------------------------------
-- Table: Suppliers
-- --------------------------------------------------
CREATE TABLE Suppliers (
    SupplierID INT IDENTITY(1,1) NOT NULL,
    SupplierName VARCHAR(150) NOT NULL,
    ContactName VARCHAR(100) NULL,
    Phone VARCHAR(20) NOT NULL,
    Email VARCHAR(100) NULL,
    Address VARCHAR(255) NULL,
    City VARCHAR(100) NULL,
    IsActive BIT NOT NULL DEFAULT ((1)),
    PRIMARY KEY (SupplierID)
);

-- --------------------------------------------------
-- Table: SystemLogs
-- --------------------------------------------------
CREATE TABLE SystemLogs (
    LogID INT IDENTITY(1,1) NOT NULL,
    LogType NVARCHAR(20) NOT NULL,
    Message NVARCHAR(500) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT (getdate()),
    UserID INT NULL,
    PRIMARY KEY (LogID)
);

-- --------------------------------------------------
-- Table: UserRoles
-- --------------------------------------------------
CREATE TABLE UserRoles (
    UserID INT NOT NULL,
    RoleID INT NOT NULL,
    AssignedAt DATETIME2 NOT NULL DEFAULT (sysdatetime()),
    PRIMARY KEY (RoleID, UserID)
);

-- --------------------------------------------------
-- Table: Users
-- --------------------------------------------------
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) NOT NULL,
    Username VARCHAR(50) NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Phone VARCHAR(20) NULL,
    IsActive BIT NOT NULL DEFAULT ((1)),
    CreatedAt DATETIME2 NOT NULL DEFAULT (sysdatetime()),
    RequirePasswordChange BIT NOT NULL DEFAULT ((0)),
    LastLogin DATETIME NULL,
    PRIMARY KEY (UserID)
);

-- --------------------------------------------------
-- Table: Warehouses
-- --------------------------------------------------
CREATE TABLE Warehouses (
    WarehouseID INT IDENTITY(1,1) NOT NULL,
    WarehouseName VARCHAR(100) NOT NULL,
    Location VARCHAR(150) NOT NULL,
    ManagerName VARCHAR(100) NULL,
    ContactNumber VARCHAR(20) NULL,
    IsActive BIT NOT NULL DEFAULT ((1)),
    MaxCapacity INT NOT NULL DEFAULT ((10000)),
    PRIMARY KEY (WarehouseID)
);

-- =================================================================================
-- FOREIGN KEY CONSTRAINTS
-- =================================================================================

ALTER TABLE PurchaseOrderDetails ADD CONSTRAINT FK_PurchaseOrderDetails_PurchaseOrders FOREIGN KEY (PurchaseOrderID) REFERENCES PurchaseOrders (PurchaseOrderID);
ALTER TABLE SalesOrders ADD CONSTRAINT FK_SalesOrders_Customers FOREIGN KEY (CustomerID) REFERENCES Customers (CustomerID);
ALTER TABLE Invoices ADD CONSTRAINT FK_Invoices_Customers FOREIGN KEY (CustomerID) REFERENCES Customers (CustomerID);
ALTER TABLE SalesOrderDetails ADD CONSTRAINT FK_SalesOrderDetails_SalesOrders FOREIGN KEY (SalesOrderID) REFERENCES SalesOrders (SalesOrderID);
ALTER TABLE Deliveries ADD CONSTRAINT FK_Deliveries_SalesOrders FOREIGN KEY (SalesOrderID) REFERENCES SalesOrders (SalesOrderID);
ALTER TABLE Invoices ADD CONSTRAINT FK_Invoices_SalesOrders FOREIGN KEY (SalesOrderID) REFERENCES SalesOrders (SalesOrderID);
ALTER TABLE DeliveryHistory ADD CONSTRAINT FK__DeliveryH__Deliv__09746778 FOREIGN KEY (DeliveryID) REFERENCES Deliveries (DeliveryID);
ALTER TABLE Payments ADD CONSTRAINT FK_Payments_Invoices FOREIGN KEY (InvoiceID) REFERENCES Invoices (InvoiceID);
ALTER TABLE InvoiceItems ADD CONSTRAINT FK__InvoiceIt__Invoi__7E02B4CC FOREIGN KEY (InvoiceID) REFERENCES Invoices (InvoiceID);
ALTER TABLE InventoryTransactions ADD CONSTRAINT FK_InventoryTransactions_Users FOREIGN KEY (PerformedByUserID) REFERENCES Users (UserID);
ALTER TABLE PurchaseOrders ADD CONSTRAINT FK_PurchaseOrders_Users FOREIGN KEY (OrderedByUserID) REFERENCES Users (UserID);
ALTER TABLE SalesOrders ADD CONSTRAINT FK_SalesOrders_Users FOREIGN KEY (CreatedByUserID) REFERENCES Users (UserID);
ALTER TABLE Deliveries ADD CONSTRAINT FK_Deliveries_Users FOREIGN KEY (DispatchedByUserID) REFERENCES Users (UserID);
ALTER TABLE Payments ADD CONSTRAINT FK_Payments_Users FOREIGN KEY (ReceivedByUserID) REFERENCES Users (UserID);
ALTER TABLE Adjustments ADD CONSTRAINT FK_Adjustments_Users FOREIGN KEY (AdjustedByUserID) REFERENCES Users (UserID);
ALTER TABLE UserRoles ADD CONSTRAINT FK_UserRoles_Users FOREIGN KEY (UserID) REFERENCES Users (UserID);
ALTER TABLE Alerts ADD CONSTRAINT FK__Alerts__Acknowle__7755B73D FOREIGN KEY (AcknowledgedBy) REFERENCES Users (UserID);
ALTER TABLE SystemLogs ADD CONSTRAINT FK__SystemLog__UserI__7B264821 FOREIGN KEY (UserID) REFERENCES Users (UserID);
ALTER TABLE UserRoles ADD CONSTRAINT FK_UserRoles_Roles FOREIGN KEY (RoleID) REFERENCES Roles (RoleID);
ALTER TABLE RolePermissions ADD CONSTRAINT FK_RolePermissions_Roles FOREIGN KEY (RoleID) REFERENCES Roles (RoleID);
ALTER TABLE RolePermissions ADD CONSTRAINT FK_RolePermissions_Permissions FOREIGN KEY (PermissionID) REFERENCES Permissions (PermissionID);
ALTER TABLE Products ADD CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryID) REFERENCES Categories (CategoryID);
ALTER TABLE PurchaseOrders ADD CONSTRAINT FK_PurchaseOrders_Suppliers FOREIGN KEY (SupplierID) REFERENCES Suppliers (SupplierID);
ALTER TABLE Products ADD CONSTRAINT FK_Products_Suppliers FOREIGN KEY (SupplierID) REFERENCES Suppliers (SupplierID);
ALTER TABLE LocationCapacity ADD CONSTRAINT FK__LocationC__Wareh__05A3D694 FOREIGN KEY (WarehouseID) REFERENCES Warehouses (WarehouseID);
ALTER TABLE PurchaseOrders ADD CONSTRAINT FK_PurchaseOrders_Warehouses FOREIGN KEY (WarehouseID) REFERENCES Warehouses (WarehouseID);
ALTER TABLE Deliveries ADD CONSTRAINT FK_Deliveries_Warehouses FOREIGN KEY (WarehouseID) REFERENCES Warehouses (WarehouseID);
ALTER TABLE Adjustments ADD CONSTRAINT FK_Adjustments_Warehouses FOREIGN KEY (WarehouseID) REFERENCES Warehouses (WarehouseID);
ALTER TABLE Inventory ADD CONSTRAINT FK_Inventory_Warehouses FOREIGN KEY (WarehouseID) REFERENCES Warehouses (WarehouseID);
ALTER TABLE InventoryTransactions ADD CONSTRAINT FK_InventoryTransactions_Warehouses FOREIGN KEY (WarehouseID) REFERENCES Warehouses (WarehouseID);
ALTER TABLE PurchaseOrderDetails ADD CONSTRAINT FK_PurchaseOrderDetails_Products FOREIGN KEY (ProductID) REFERENCES Products (ProductID);
ALTER TABLE SalesOrderDetails ADD CONSTRAINT FK_SalesOrderDetails_Products FOREIGN KEY (ProductID) REFERENCES Products (ProductID);
ALTER TABLE Adjustments ADD CONSTRAINT FK_Adjustments_Products FOREIGN KEY (ProductID) REFERENCES Products (ProductID);
ALTER TABLE Inventory ADD CONSTRAINT FK_Inventory_Products FOREIGN KEY (ProductID) REFERENCES Products (ProductID);
ALTER TABLE InventoryTransactions ADD CONSTRAINT FK_InventoryTransactions_Products FOREIGN KEY (ProductID) REFERENCES Products (ProductID);
ALTER TABLE InvoiceItems ADD CONSTRAINT FK__InvoiceIt__Produ__7EF6D905 FOREIGN KEY (ProductID) REFERENCES Products (ProductID);

-- =================================================================================
-- CHECK CONSTRAINTS
-- =================================================================================

ALTER TABLE PurchaseOrders ADD CONSTRAINT CK_PurchaseOrders_Status CHECK (Status='Partially Received' OR Status='Completed' OR Status='Approved' OR Status='Shipped' OR Status='Closed' OR Status='Cancelled' OR Status='Received' OR Status='Pending');
ALTER TABLE InventoryTransactions ADD CONSTRAINT CK_InventoryTransactions_ReferenceType CHECK (ReferenceType='Return' OR ReferenceType='Manual' OR ReferenceType='Adjustment' OR ReferenceType='Delivery' OR ReferenceType='SalesOrder' OR ReferenceType='PurchaseOrder');
ALTER TABLE InventoryTransactions ADD CONSTRAINT CK_InventoryTransactions_TransactionType CHECK (TransactionType='ADJUSTMENT' OR TransactionType='TRANSFER' OR TransactionType='OUT' OR TransactionType='IN');
ALTER TABLE InventoryTransactions ADD CONSTRAINT CK_InventoryTransactions_Quantity CHECK (Quantity>(0));
ALTER TABLE PurchaseOrderDetails ADD CONSTRAINT CK_PurchaseOrderDetails_QuantityOrdered CHECK (QuantityOrdered>(0));
ALTER TABLE PurchaseOrderDetails ADD CONSTRAINT CK_PurchaseOrderDetails_UnitCost CHECK (UnitCost>=(0));
ALTER TABLE PurchaseOrderDetails ADD CONSTRAINT CK_PurchaseOrderDetails_LineTotal CHECK (LineTotal>=(0));
ALTER TABLE Customers ADD CONSTRAINT CK_Customers_CustomerType CHECK (CustomerType='WalkIn' OR CustomerType='Corporate' OR CustomerType='Regular' OR CustomerType='Wholesale' OR CustomerType='VIP');
ALTER TABLE SalesOrders ADD CONSTRAINT CK_SalesOrders_Status CHECK (Status='Cancelled' OR Status='Completed' OR Status='Dispatched' OR Status='Packed' OR Status='Confirmed' OR Status='Pending');
ALTER TABLE SalesOrders ADD CONSTRAINT CK_SalesOrders_TotalAmount CHECK (TotalAmount>=(0));
ALTER TABLE SalesOrderDetails ADD CONSTRAINT CK_SalesOrderDetails_QuantitySold CHECK (QuantitySold>(0));
ALTER TABLE SalesOrderDetails ADD CONSTRAINT CK_SalesOrderDetails_UnitPrice CHECK (UnitPrice>=(0));
ALTER TABLE SalesOrderDetails ADD CONSTRAINT CK_SalesOrderDetails_DiscountAmount CHECK (DiscountAmount>=(0));
ALTER TABLE SalesOrderDetails ADD CONSTRAINT CK_SalesOrderDetails_LineTotal CHECK (LineTotal>=(0));
ALTER TABLE Deliveries ADD CONSTRAINT CK_Deliveries_Status CHECK (DeliveryStatus='Returned' OR DeliveryStatus='Failed' OR DeliveryStatus='Delivered' OR DeliveryStatus='In Transit' OR DeliveryStatus='Shipped' OR DeliveryStatus='Packed' OR DeliveryStatus='Scheduled');
ALTER TABLE Invoices ADD CONSTRAINT CK_Invoices_TotalAmount CHECK (TotalAmount>=(0));
ALTER TABLE Invoices ADD CONSTRAINT CK_Invoices_Status CHECK (InvoiceStatus='Cancelled' OR InvoiceStatus='Overdue' OR InvoiceStatus='Paid' OR InvoiceStatus='Partially Paid' OR InvoiceStatus='Unpaid');
ALTER TABLE Payments ADD CONSTRAINT CK_Payments_AmountPaid CHECK (AmountPaid>=(0));
ALTER TABLE Payments ADD CONSTRAINT CK_Payments_Method CHECK (PaymentMethod='Cheque' OR PaymentMethod='Bank Transfer' OR PaymentMethod='Credit Card' OR PaymentMethod='Cash');
ALTER TABLE Payments ADD CONSTRAINT CK_Payments_Status CHECK (PaymentStatus='Refunded' OR PaymentStatus='Failed' OR PaymentStatus='Pending' OR PaymentStatus='Completed');
ALTER TABLE Adjustments ADD CONSTRAINT CK_Adjustments_Type CHECK (AdjustmentType='Found' OR AdjustmentType='Loss' OR AdjustmentType='Damage' OR AdjustmentType='Stock Out' OR AdjustmentType='Stock In');
ALTER TABLE Adjustments ADD CONSTRAINT CK_Adjustments_Quantity CHECK (QuantityAdjusted<>(0));
ALTER TABLE Products ADD CONSTRAINT CK_Products_UnitPrice CHECK (UnitPrice>=(0));
ALTER TABLE Products ADD CONSTRAINT CK_Products_CostPrice CHECK (CostPrice>=(0));
ALTER TABLE Products ADD CONSTRAINT CK_Products_ReorderLevel CHECK (ReorderLevel>=(0));
ALTER TABLE Inventory ADD CONSTRAINT CK_Inventory_QuantityOnHand CHECK (QuantityOnHand>=(0));