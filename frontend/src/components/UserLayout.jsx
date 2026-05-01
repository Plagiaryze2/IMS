import React, { useState, useEffect, useRef } from 'react';
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
  Search,
  TriangleAlert,
  CheckCircle,
  X
} from 'lucide-react';
import { alertsAPI, searchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // Debounced Search Effect
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchAPI.query(searchQuery);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await alertsAPI.getAll();
        // The backend now filters to STOCK only for non-admins, so no need to filter here
        setAlerts(data);
      } catch (e) {
        console.error('Failed to fetch alerts:', e);
      }
    };
    fetchAlerts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = alerts.filter(a => !a.IsRead).length;

  const handleLogout = () => {
    logout();
    navigate('/');
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
          <div className="relative hidden md:block" ref={searchRef}>
            <input 
              type="text" 
              placeholder="Global System Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true); }}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 text-xs font-bold focus:outline-none focus:border-[#047857] w-80 transition-all"
            />
            {isSearching ? (
              <div className="absolute left-3 top-2.5 w-3.5 h-3.5 border-2 border-[#047857] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            )}

            {/* Search Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-top">
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      No matching records
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {searchResults.map((item, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                            navigate(item.path);
                          }}
                          className="p-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center group"
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-900 group-hover:text-[#047857] transition-colors">{item.title}</p>
                            <p className="text-[10px] font-mono text-gray-500 mt-0.5">{item.SKU}</p>
                          </div>
                          <span className="text-[8px] font-black tracking-widest uppercase bg-gray-100 px-2 py-1 text-gray-500 rounded-sm">
                            {item.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 transition-colors ${showNotifications ? 'text-gray-900' : 'text-gray-400 hover:text-gray-900'}`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 shadow-2xl z-[60] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">Stock Notifications</h4>
                  <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                    <X size={14} />
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {alerts.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No active alerts</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {alerts.map((alert) => (
                        <div key={alert.AlertID} className={`p-4 hover:bg-gray-50 transition-colors ${!alert.IsRead ? 'bg-green-50/30' : ''}`}>
                          <div className="flex gap-4">
                            <div className={`mt-0.5 p-1.5 border ${alert.AlertType === 'CRITICAL_THRESHOLD' ? 'border-red-200 bg-red-50 text-red-500' : 'border-emerald-200 bg-emerald-50 text-emerald-500'}`}>
                              {alert.AlertType === 'CRITICAL_THRESHOLD' ? <TriangleAlert size={14} /> : <CheckCircle size={14} />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-[10px] font-black text-gray-900 uppercase">{alert.Title}</p>
                                <span className="text-[8px] font-mono text-gray-400">{new Date(alert.CreatedAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-[11px] text-gray-600 leading-relaxed line-clamp-2">{alert.Description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-100 text-center">
                  <button 
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/user/alerts');
                    }}
                    className="text-[10px] font-black text-[#047857] uppercase tracking-widest hover:underline"
                  >
                    View All Alerts
                  </button>
                </div>
              </div>
            )}
          </div>

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
