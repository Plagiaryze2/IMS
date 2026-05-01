const sql = require('mssql/msnodesqlv8');
const config = {
    driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=LAPTOP-8ASCIT8B;Database=InventoryManagementSystemDB;Trusted_Connection=yes;'
};

async function setupCapacity() {
    try {
        const pool = await sql.connect(config);

        // 1. Add MaxCapacity to Warehouses table
        console.log('Adding MaxCapacity to Warehouses...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Warehouses' AND COLUMN_NAME = 'MaxCapacity')
            BEGIN
                ALTER TABLE Warehouses ADD MaxCapacity INT NOT NULL DEFAULT 10000
            END
        `);
        console.log('Done.');

        // 2. Create LocationCapacity table
        console.log('Creating LocationCapacity table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LocationCapacity')
            BEGIN
                CREATE TABLE LocationCapacity (
                    LocationID INT IDENTITY(1,1) PRIMARY KEY,
                    WarehouseID INT NOT NULL FOREIGN KEY REFERENCES Warehouses(WarehouseID),
                    Aisle NVARCHAR(50) NOT NULL,
                    Shelf NVARCHAR(50) NULL,
                    Bin NVARCHAR(50) NULL,
                    MaxCapacity INT NOT NULL DEFAULT 500,
                    CONSTRAINT UQ_Location UNIQUE (WarehouseID, Aisle, Shelf, Bin)
                )
            END
        `);
        console.log('Done.');

        // 3. Seed some default location capacities based on existing inventory locations
        console.log('Seeding location capacities...');
        await pool.request().query(`
            INSERT INTO LocationCapacity (WarehouseID, Aisle, Shelf, Bin, MaxCapacity)
            SELECT DISTINCT i.WarehouseID, i.Aisle, i.Shelf, i.Bin, 500
            FROM Inventory i
            WHERE i.Aisle IS NOT NULL
            AND NOT EXISTS (
                SELECT 1 FROM LocationCapacity lc 
                WHERE lc.WarehouseID = i.WarehouseID 
                AND lc.Aisle = i.Aisle 
                AND ISNULL(lc.Shelf, '') = ISNULL(i.Shelf, '')
                AND ISNULL(lc.Bin, '') = ISNULL(i.Bin, '')
            )
        `);
        console.log('Done.');

        // 4. Set real warehouse capacities
        console.log('Setting warehouse capacities...');
        await pool.request().query(`UPDATE Warehouses SET MaxCapacity = 15000 WHERE WarehouseID = 1`);
        await pool.request().query(`UPDATE Warehouses SET MaxCapacity = 10000 WHERE WarehouseID = 2`);
        console.log('Done.');

        console.log('ALL CAPACITY SETUP COMPLETE');
        await pool.close();
    } catch (e) {
        console.error('SETUP ERROR:', e.message);
    }
}
setupCapacity();
