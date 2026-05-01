import React from 'react';
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
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  
  const metrics = [
    { label: 'Active Shipments', value: '42', detail: '+12%', color: 'text-[#047857]' },
    { label: 'Pending Invoices', value: '18', detail: '8 URGENT', color: 'text-orange-500' },
    { label: 'Low Stock Items', value: '05', detail: <AlertTriangle size={16} className="text-red-500" />, color: 'text-red-600' },
    { label: 'Total Value on Hand', value: '$1.24M', detail: 'USD', color: 'text-gray-400' },
  ];

  const recentActivity = [
    { time: '14:01:22', id: 'INV-9904', desc: 'Payment Processed - Global', op: 'SYS_AUTO', status: 'PAID', statusColor: 'text-[#047857] bg-green-50 border-green-200' },
    { time: '13:55:01', id: 'SUPP-122', desc: 'New Supplier: Apex Foundry', op: 'OPER_01', status: 'NEW', statusColor: 'text-gray-600 bg-gray-50 border-gray-200' },
    { time: '13:42:15', id: 'STK-8812', desc: 'Adjustment: +500 Valves', op: 'OPER_03', status: 'SYNC', statusColor: 'text-blue-600 bg-blue-50 border-blue-200' },
    { time: '13:10:44', id: 'SHP-0019', desc: 'Manifest Verified', op: 'SYS_AUTO', status: 'ACTIVE', statusColor: 'text-[#047857] bg-green-50 border-green-200' },
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
              System healthy. <span className="text-red-600">5 critical stock alerts pending.</span>
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
            <span className="text-[10px] font-mono font-bold tracking-widest">14:02:44</span>
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
                {recentActivity.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-6 text-xs font-mono text-gray-400">{row.time}</td>
                    <td className="px-6 py-6 text-xs font-black tracking-tighter">{row.id}</td>
                    <td className="px-6 py-6 text-xs font-bold text-gray-700">{row.desc}</td>
                    <td className="px-6 py-6 text-xs font-mono text-gray-500">{row.op}</td>
                    <td className="px-6 py-6 text-right">
                      <span className={`px-2 py-1 text-[9px] font-black border rounded-sm tracking-tighter ${row.statusColor}`}>
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
          <div className="bg-white border border-gray-200 p-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-8 pb-4 border-b border-gray-100">
              Operational Tasks
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Create New Invoice', icon: <PlusCircle size={16} /> },
                { name: 'Adjust Stock Levels', icon: <Edit3 size={16} /> },
                { name: 'Generate Report', icon: <FileSearch size={16} /> },
              ].map((task, i) => (
                <button 
                  key={i}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 text-xs font-bold uppercase tracking-widest hover:border-black hover:bg-gray-50 transition-all group"
                >
                  {task.name}
                  <span className="text-gray-400 group-hover:text-black transition-colors">{task.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status Terminal */}
          <div className="bg-zinc-900 text-green-400 p-8 font-mono shadow-2xl rounded-sm">
            <div className="flex justify-between items-center mb-10 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold tracking-widest uppercase">Status_Terminal_v1</span>
              </div>
              <span className="text-[10px] opacity-40">0x0B23F</span>
            </div>
            <div className="space-y-4 text-[10px]">
              <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span className="opacity-50 uppercase tracking-widest">Server_Uptime:</span>
                <span>182d 04h 22m</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span className="opacity-50 uppercase tracking-widest">API_Latency:</span>
                <span>14.2ms</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span className="opacity-50 uppercase tracking-widest">DB_Cluster:</span>
                <span className="text-green-300 font-bold">HEALTHY [99.8%]</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                <span className="opacity-50 uppercase tracking-widest">MEM_Reserve:</span>
                <span>6.42 TB FREE</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="opacity-50 uppercase tracking-widest">Node_Auth:</span>
                <span className="text-zinc-500 italic">ENCRYPTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
