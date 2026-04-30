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
    // Redirect to admin login if they were trying to access admin area
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
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
        
        <Route element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/users" element={<Users />} />
          <Route path="/alerts" element={<AlertsCenter />} />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};



export default AppRoutes;

