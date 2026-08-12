
Readme · MD
# IMS — Inventory Management System
 
A full-stack inventory management system with separate admin and user portals for tracking products, warehouses, suppliers, purchase orders, sales invoices, shipments, and alerts.

## Developers

- **Team:** Yeagerists++
- **M. Anas** — Roll No: `24L-3004`
- **Abdul Ahad** — Roll No: `24L-3029`
- **M. Babar Shahzad** — Roll No: `24L-3047`
 
**Stack:** React 19 (Vite, Tailwind CSS) frontend · Node.js/Express 5 backend · Microsoft SQL Server database.
 
## Features
 
- **Authentication & roles** — JWT-based login, role-based access (Administrator / User), forced password reset, user activation toggle.
- **Inventory** — product catalog, categories, stock adjustments (single and bulk), low-stock alerts, batch sync.
- **Warehouses** — multiple warehouses, storage locations, capacity tracking, stock transfers between warehouses.
- **Suppliers & purchase orders** — supplier records, purchase orders with status tracking.
- **Sales & invoicing** — customer records, sales invoices with line items, invoice PDF export, order shipping/status updates.
- **Shipments & tracking** — shipment records with tracking codes and delivery history.
- **Dashboard & reports** — stats, charts, activity logs, and reporting views for both admin and user roles.
- **Alerts** — system-generated alerts (e.g. low stock) with acknowledgment workflow.
## Tech Stack
 
| Layer    | Technology |
|----------|------------|
| Frontend | React 19, React Router 7, Vite, Tailwind CSS 4, Recharts, jsPDF, SweetAlert2, lucide-react |
| Backend  | Node.js, Express 5, `mssql`/`msnodesqlv8`, JSON Web Tokens, bcryptjs |
| Database | Microsoft SQL Server |
 
## Project Structure
 
```
IMS/
├── backend/
│   ├── server.js           # Express app and all API routes
│   ├── IMS_Schema.sql       # Database schema (tables, keys)
│   ├── InsertingData.sql    # Seed/sample data
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── admin/       # Admin: Dashboard, Inventory, Users, Alerts, Login
    │   │   ├── user/        # User: Dashboard, Inventory, Orders, Sales, Suppliers, Warehouse, Reports, Tracking, Alerts
    │   │   └── landing/     # Public landing page
    │   ├── components/      # Layout, TopBar, UserLayout
    │   ├── context/         # AuthContext
    │   ├── services/api.js  # API client
    │   └── AppRoutes.jsx    # Route definitions
    └── package.json
```
 
## Prerequisites
 
- Node.js (v18+ recommended)
- Microsoft SQL Server, with the **ODBC Driver 17 for SQL Server** installed (the backend connects via `msnodesqlv8`)
## Setup
 
### 1. Database
 
Run the schema and (optionally) seed data against your SQL Server instance:
 
```bash
sqlcmd -S <your_server> -i backend/IMS_Schema.sql
sqlcmd -S <your_server> -i backend/InsertingData.sql
```
 
This creates the `InventoryManagementSystemDB` database and its tables (Users, Roles, Products, Inventory, Warehouses, Suppliers, PurchaseOrders, SalesOrders, Invoices, Deliveries, Alerts, SystemLogs, and more).
 
### 2. Backend
 
```bash
cd backend
npm install
```
 
Create a `.env` file in `backend/`:
 
```env
PORT=5000
JWT_SECRET=your_jwt_secret
DB_SERVER=your_sql_server_instance
DB_DATABASE=InventoryManagementSystemDB
```
 
Start the server:
 
```bash
node server.js
```
 
The API will be available at `http://localhost:5000/api` (health check at `/api/health`).
 
### 3. Frontend
 
```bash
cd frontend
npm install
npm run dev
```
 
The app will be available at the Vite dev server URL (default `http://localhost:5173`).
 
## API Overview
 
The backend exposes REST endpoints under `/api`, including:
 
- `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/change-password`
- `GET/POST/PUT/DELETE /api/inventory`, `PATCH /api/inventory/adjust`, `POST /api/inventory/bulk-adjust`, `POST /api/inventory/batch-sync`
- `GET/POST/PUT/DELETE /api/suppliers`
- `GET/POST /api/purchase-orders`, `PATCH /api/purchase-orders/:id/status`
- `GET/POST /api/sales/invoices`, `PATCH /api/sales/invoice/:id/status`, `POST /api/sales/invoice/:id/ship`
- `GET/POST /api/warehouses`, `GET /api/warehouse/inventory`, `GET /api/warehouse/locations`, `POST /api/warehouse/transfer`
- `GET/POST /api/shipments`, `POST /api/shipments/:id/tracking`
- `GET/POST /api/customers`
- `GET/POST /api/users`, `PUT /api/users/:id/toggle`
- `GET /api/dashboard/stats`, `GET /api/dashboard/chart`, `GET /api/dashboard/logs`
- `GET /api/user/dashboard/stats`, `GET /api/user/dashboard/activity`, `GET /api/user/reports/stats`
- `GET/POST /api/alerts`, `PUT /api/alerts/:id/acknowledge`
- `GET /api/search`
