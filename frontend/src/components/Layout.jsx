import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin-login');
  };

  const navItems = [
    { name: 'DASHBOARD', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'INVENTORY', icon: <Package size={20} />, path: '/inventory' },
    { name: 'USERS', icon: <Users size={20} />, path: '/users' },
    { name: 'ALERTS', icon: <Bell size={20} />, path: '/alerts' },
  ];



  return (
    <div className="flex h-screen w-full bg-white text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 flex flex-col justify-between flex-shrink-0 bg-white">
        <div>
          {/* Brand/Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-primary-500 font-bold tracking-widest text-lg">ADMIN_PANEL</h1>
            <p className="text-xs text-gray-400 mt-1 uppercase">V2.0.4-STABLE</p>
          </div>

          {/* Navigation */}
          <nav className="mt-6 flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-sm font-semibold tracking-wide transition-colors ${
                    isActive
                      ? 'bg-gray-50 border-r-2 border-primary-500 text-gray-900'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50">
            <User size={20} className="text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">{user.role || 'System Administrator'}</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName || 'Admin User'}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fafafa]">
        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
