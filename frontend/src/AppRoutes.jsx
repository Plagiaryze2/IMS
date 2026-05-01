import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/admin/Dashboard/Dashboard';
import Inventory from './pages/admin/Inventory/Inventory';
import Users from './pages/admin/Users/Users';
import Login from './pages/admin/Login/Login';
import AlertsCenter from './pages/admin/Alerts/AlertsCenter';
import { useAuth, AuthProvider } from './context/AuthContext';

import LandingPage from './pages/landing/LandingPage';
import Register from './pages/user/Register';
import UserLogin from './pages/user/UserLogin';
import UserLayout from './components/UserLayout';
import UserDashboard from './pages/user/UserDashboard';
import UserInventory from './pages/user/UserInventory';
import AddProduct from './pages/user/AddProduct';
import UserSuppliers from './pages/user/UserSuppliers';
import UserOrders from './pages/user/UserOrders';
import UserSales from './pages/user/UserSales';
import CreateInvoice from './pages/user/CreateInvoice';
import UserWarehouse from './pages/user/UserWarehouse';
import UserReports from './pages/user/UserReports';
import UserTracking from './pages/user/UserTracking';

const AdminProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#047857] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  if (user.role !== 'Administrator') {
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

const UserProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#047857] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verifying User Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role === 'Administrator') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};


const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<Login />} />
        
        {/* Admin Interface */}
        <Route element={
          <AdminProtectedRoute>
            <Layout />
          </AdminProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/users" element={<Users />} />
          <Route path="/alerts" element={<AlertsCenter />} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* User Interface */}
        <Route element={
          <UserProtectedRoute>
            <UserLayout />
          </UserProtectedRoute>
        }>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/inventory" element={<UserInventory />} />
          <Route path="/user/inventory/add" element={<AddProduct />} />
          <Route path="/user/suppliers" element={<UserSuppliers />} />
          <Route path="/user/orders" element={<UserOrders />} />
          <Route path="/user/sales" element={<UserSales />} />
          <Route path="/user/sales/create" element={<CreateInvoice />} />
          <Route path="/user/warehouse" element={<UserWarehouse />} />
          <Route path="/user/reports" element={<UserReports />} />
          <Route path="/user/tracking" element={<UserTracking />} />
          <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};



export default AppRoutes;
