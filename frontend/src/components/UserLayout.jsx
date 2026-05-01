import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  DollarSign, 
  Warehouse, 
  MapPin, 
  Settings, 
  LogOut,
  Bell,
  User as UserIcon,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'DASHBOARD', icon: <LayoutDashboard size={20} />, path: '/user/dashboard' },
    { name: 'INVENTORY', icon: <Package size={20} />, path: '/user/inventory' },
    { name: 'ORDERS', icon: <ShoppingCart size={20} />, path: '/user/orders' },
    { name: 'SUPPLIERS', icon: <Users size={20} />, path: '/user/suppliers' },
    { name: 'REPORTS', icon: <BarChart3 size={20} />, path: '/user/reports' },
    { name: 'SALES', icon: <DollarSign size={20} />, path: '/user/sales' },
    { name: 'WAREHOUSE', icon: <Warehouse size={20} />, path: '/user/warehouse' },
    { name: 'ORDER TRACKING', icon: <MapPin size={20} />, path: '/user/tracking' },
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-[#fafafa] text-gray-800 font-sans">
      {/* Global Top Header */}
      <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-50 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 border-r border-gray-200 pr-6 mr-2">
            <span className="text-xl font-black tracking-tighter text-gray-900">IMS_CORE_v1.0</span>
            <div className="h-4 w-[2px] bg-gray-200"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#047857] animate-pulse">Live_Ops</span>
          </div>
          <div className="relative hidden md:block">
            <input 
              type="text" 
              placeholder="Global System Search..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#047857] w-80 transition-all"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">{user?.username || 'OPERATOR_01'}</p>
              <p className="text-[8px] font-bold text-[#047857] uppercase tracking-widest mt-0.5">Sys_Admin_V1</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-sm flex items-center justify-center border border-gray-200">
              <UserIcon size={20} className="text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
          {/* Navigation */}
          <nav className="flex-1 py-8 px-4 space-y-1">
            <div className="px-4 mb-6">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Navigation_Main</p>
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-4 px-4 py-4 text-[10px] font-black tracking-[0.2em] transition-all duration-200 group ${
                    isActive 
                      ? 'bg-gray-50 text-gray-900 border-l-4 border-[#047857]' 
                      : 'text-gray-400 border-l-4 border-transparent hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-100 space-y-1">
            <NavLink
              to="/user/settings"
              className={({ isActive }) => 
                `flex items-center gap-4 px-4 py-4 text-[10px] font-black tracking-[0.2em] transition-all duration-200 ${
                  isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'
                }`
              }
            >
              <Settings size={20} />
              SETTINGS
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-4 text-[10px] font-black tracking-[0.2em] text-gray-400 hover:text-red-600 transition-all duration-200"
            >
              <LogOut size={20} />
              LOGOUT
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#fafafa]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
