import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Bell, Power } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TopBar = ({ title, onRefresh, alertCount = 0, children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
      <div className="flex items-center gap-4">
        {/* Right-side icon controls */}
        <div className="flex items-center gap-2 text-gray-500">
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh"
              className="p-2 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <RotateCcw size={18} />
            </button>
          )}

          {/* Notifications / Alerts */}
          <div className="relative">
            <button
              onClick={() => navigate('/alerts')}
              title="Alerts Center"
              className="p-2 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <Bell size={18} />
            </button>
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white pointer-events-none" />
            )}
          </div>

          {/* Shutdown / Logout */}
          <button
            onClick={handleLogout}
            title="Logout / Shutdown"
            className="p-2 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Power size={18} />
          </button>
        </div>

        {/* Page-specific actions (e.g. "+ Add New SKU") */}
        {children}
      </div>
    </div>
  );
};

export default TopBar;
