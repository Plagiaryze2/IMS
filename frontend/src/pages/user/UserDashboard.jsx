import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  FileText, 
  AlertTriangle, 
  PlusCircle, 
  Edit3, 
  FileSearch,
  Activity,
  Terminal,
  Clock,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userDashboardAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-GB', { hour12: false }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);

    const fetchData = async () => {
      try {
        const [summary, logs] = await Promise.all([
          userDashboardAPI.getSummary(),
          userDashboardAPI.getActivity()
        ]);
        setStats(summary);
        setActivities(logs);
      } catch (e) {
        console.error('Dashboard data fetch failed:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => clearInterval(timer);
  }, []);
  
  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-[#047857]" size={48} />
      </div>
    );
  }

  const metrics = [
    { label: 'Live Inventory', value: stats?.totalStock || '0', detail: 'Items in Stock', color: 'text-gray-400' },
    { label: 'Active Orders', value: stats?.activeOrders || '0', detail: 'Pending Fulfillment', color: 'text-[#047857]' },
    { label: 'Low Stock Alerts', value: stats?.lowStockItems || '0', detail: 'Critical Threshold', color: 'text-red-600' },
    { label: 'Daily Revenue', value: stats?.revenueYTD ? `$${(stats.revenueYTD / 1000).toFixed(1)}k` : '$0', detail: '24h Throughput', color: 'text-gray-400' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            Welcome back, {user?.fullName || 'OPERATOR_01'}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Activity size={16} className="text-[#047857]" />
            <p className="text-sm font-bold text-gray-500">
              System healthy. <span className="text-red-600">{stats?.lowStockItems || 0} critical stock alerts pending.</span>
            </p>
          </div>
        </div>
        <div className="flex gap-px">
          <div className="bg-black text-white px-4 py-2 flex items-center gap-2">
            <span className="text-[10px] font-mono opacity-60">LOC:</span>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Sector_A</span>
          </div>
          <div className="bg-[#047857] text-white px-4 py-2 flex items-center gap-2">
            <Clock size={12} />
            <span className="text-[10px] font-mono font-bold tracking-widest">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white p-8 group hover:bg-gray-50 transition-colors">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">{m.label}</p>
            <div className="flex items-baseline justify-between">
              <span className="text-4xl font-bold text-gray-900">{m.value}</span>
              <span className={`text-[10px] font-black tracking-widest uppercase ${m.color}`}>
                {m.detail}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 border border-gray-200 bg-white">
          <div className="bg-black text-white px-6 py-3 flex justify-between items-center">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase">Recent Activity</span>
            <span className="text-[10px] font-mono opacity-50 tracking-widest">LIVE_FEED_01</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <th className="px-6 py-4 font-black">Timestamp</th>
                  <th className="px-6 py-4 font-black">Event ID</th>
                  <th className="px-6 py-4 font-black">Description</th>
                  <th className="px-6 py-4 font-black">Operator</th>
                  <th className="px-6 py-4 font-black text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-6 text-xs font-mono text-gray-400">{row.time}</td>
                    <td className="px-6 py-6 text-xs font-black tracking-tighter">{row.id}</td>
                    <td className="px-6 py-6 text-xs font-bold text-gray-700">{row.desc}</td>
                    <td className="px-6 py-6 text-xs font-mono text-gray-500">{row.op}</td>
                    <td className="px-6 py-6 text-right">
                      <span className={`px-2 py-1 text-[9px] font-black border rounded-sm tracking-tighter ${
                        row.status === 'ERR' ? 'text-red-600 bg-red-50 border-red-200' :
                        row.status === 'WARN' ? 'text-orange-600 bg-orange-50 border-orange-200' :
                        'text-[#047857] bg-green-50 border-green-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar - Tasks and Terminal */}
        <div className="space-y-8">
          {/* Operational Tasks */}
          <div className="bg-white border border-gray-200 p-8 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 pb-4 border-b border-gray-100">
              Operational Tasks
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Create New Invoice', icon: <PlusCircle size={16} />, path: '/user/sales/create' },
                { name: 'Adjust Stock Levels', icon: <Edit3 size={16} />, path: '/user/inventory' },
                { name: 'Generate Report', icon: <FileSearch size={16} />, path: '/user/reports' },
              ].map((task, i) => (
                <button 
                  key={i}
                  onClick={() => navigate(task.path)}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 text-xs font-bold uppercase tracking-widest hover:border-black hover:bg-gray-50 transition-all group"
                >
                  {task.name}
                  <span className="text-gray-400 group-hover:text-black transition-colors">{task.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status Terminal */}
          <TerminalLogs />
        </div>
      </div>
    </div>
  );
};

const TerminalLogs = () => {
  const [logs, setLogs] = useState([
    'initializing system_diagnostics...',
    'memory_check: OPTIMAL',
    'connection_to_sql_core: ESTABLISHED'
  ]);

  useEffect(() => {
    const messages = [
      'Data packet verified for NYC_NORTH_01',
      'Inventory re-indexing complete',
      'Backup heartbeat detected: [OK]',
      'Security audit: 0 vulnerabilities found',
      'Cloud sync: 124 objects updated',
      'System latency: 4ms (Excellent)',
      'Worker Node_08 joined the cluster',
      'API throughput: 1.2k req/min'
    ];

    const interval = setInterval(() => {
      setLogs(prev => {
        const next = [...prev, messages[Math.floor(Math.random() * messages.length)]];
        return next.length > 8 ? next.slice(1) : next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-zinc-900 text-green-400 p-8 font-mono shadow-2xl rounded-sm">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Terminal_Session_01</span>
        </div>
        <span className="text-[8px] text-zinc-600 font-bold">TTY/NODE_CORE_8</span>
      </div>
      <div className="space-y-3 text-[11px] leading-relaxed">
        {logs.map((log, i) => (
          <p key={i} className="animate-in fade-in slide-in-from-left-2 duration-500">
            <span className="text-zinc-500 mr-3">[$]</span> {log}
          </p>
        ))}
        <p className="text-zinc-500 animate-pulse mt-4">_ awaiting_input_command...</p>
      </div>
    </div>
  );
};

export default UserDashboard;
