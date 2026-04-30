import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/admin/Dashboard/Dashboard';
import Inventory from './pages/admin/Inventory/Inventory';
import Users from './pages/admin/Users/Users';
import Login from './pages/admin/Login/Login';
import AlertsCenter from './pages/admin/Alerts/AlertsCenter';
import { useAuth, AuthProvider } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#047857] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="users" element={<Users />} />
          <Route path="alerts" element={<AlertsCenter />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;

