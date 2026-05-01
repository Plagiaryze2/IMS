import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Briefcase, 
  ShoppingCart, 
  Box,
  Download,
  Calendar,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';

const UserReports = () => {
  const salesData = [
    { name: '01', value: 400 },
    { name: '05', value: 800 },
    { name: '10', value: 600 },
    { name: '15', value: 1200 },
    { name: '20', value: 1000 },
    { name: '25', value: 1800 },
    { name: '30', value: 1500 },
  ];

  const pieData = [
    { name: 'Electronics', value: 45 },
    { name: 'Hardware', value: 30 },
    { name: 'Consumables', value: 15 },
    { name: 'Other', value: 10 },
  ];

  const COLORS = ['#047857', '#64748b', '#94a3b8', '#e2e8f0'];

  const kpis = [
    { title: 'Total Revenue', value: '$1,245,890.00', trend: '+14.2%', up: true, icon: <DollarSign size={20} /> },
    { title: 'Gross Profit', value: '$415,230.00', trend: '+8.7%', up: true, icon: <Briefcase size={20} /> },
    { title: 'Active Orders', value: '1,432', trend: '-2.1%', up: false, icon: <ShoppingCart size={20} /> },
    { title: 'Inventory Valuation', value: '$3,890,150.00', trend: '0.0%', up: null, icon: <Box size={20} /> },
  ];

  const topProducts = [
    { name: 'PRO-X SERVER BLADE', units: '1,204', percent: 85 },
    { name: 'QUANTUM ROUTER V4', units: '960', percent: 70 },
    { name: 'FIBER OPTIC CABLE (100M)', units: '845', percent: 60 },
    { name: 'COOLING MODULE AX', units: '620', percent: 45 },
    { name: 'POWER SUPPLY 1000W', units: '410', percent: 30 },
  ];

  const lowVelocity = [
    { sku: 'HW-772-A', name: 'Legacy IDE Controller', cat: 'HARDWARE', qty: 165, value: '$3,625.00', days: 124 },
    { sku: 'EL-901-X', name: 'VGA Monitor 15"', cat: 'ELECTRONICS', qty: 42, value: '$2,100.00', days: 98 },
    { sku: 'CS-112-Q', name: 'Serial Cable 5m', cat: 'CONSUMABLES', qty: 310, value: '$1,550.00', days: 85 },
    { sku: 'OT-555-P', name: 'Packaging Foam (Bulk)', cat: 'OTHER', qty: 850, value: '$4,250.00', days: 62 },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in bg-[#fafafa]">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic">Analytics & Performance</h1>
        <div className="flex gap-4">
          <div className="relative">
            <button className="bg-white border border-gray-200 px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-gray-50 transition-all">
              <Calendar size={14} /> Last 30 Days
            </button>
          </div>
          <button className="bg-white border border-gray-200 px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-gray-50 transition-all">
            <Download size={14} /> Export PDF
          </button>
          <button className="bg-white border border-gray-200 px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-gray-50 transition-all">
            <Download size={14} /> Export Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.title} className="bg-white border-t-4 border-[#047857] border-x border-b border-gray-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.title}</p>
              <div className="text-[#047857]">{kpi.icon}</div>
            </div>
            <p className="text-2xl font-black text-gray-900 leading-none">{kpi.value}</p>
            <div className="flex items-center gap-2">
              {kpi.up !== null && (
                kpi.up 
                  ? <TrendingUp size={14} className="text-[#047857]" /> 
                  : <TrendingDown size={14} className="text-red-500" />
              )}
              <span className={`text-[10px] font-black ${kpi.up ? 'text-[#047857]' : kpi.up === false ? 'text-red-500' : 'text-gray-400'}`}>
                {kpi.trend} vs last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white border border-gray-200 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Sales Trend (Daily Vol)</h3>
          <MoreVertical size={16} className="text-gray-400 cursor-pointer" />
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#047857" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ border: '1px solid #e2e8f0', borderRadius: '0', fontSize: '10px', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#047857" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorVal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock Distribution */}
        <div className="bg-white border border-gray-200 p-8 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-8">Stock Distribution</h3>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-full h-[250px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                 <p className="text-[10px] font-black text-gray-400 uppercase">Total</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 flex-1">
              {pieData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top 5 Selling Products */}
        <div className="bg-white border border-gray-200 p-8 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-8">Top 5 Selling Products</h3>
          <div className="space-y-6">
            {topProducts.map((p) => (
              <div key={p.name} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-900">{p.name}</span>
                  <span className="text-gray-400">{p.units} units</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-sm overflow-hidden">
                  <div 
                    className="h-full bg-[#047857] transition-all duration-1000" 
                    style={{ width: `${p.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Velocity Items */}
      <div className="bg-white border border-gray-200 p-8 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <AlertTriangle size={20} className="text-red-500" />
             <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Low Velocity Items (&gt;60 Days)</h3>
          </div>
          <button className="text-[10px] font-black text-[#047857] border border-[#047857] px-4 py-2 uppercase tracking-widest hover:bg-green-50 transition-all">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-200">
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4 text-right">Value</th>
                <th className="px-6 py-4 text-right text-red-500">Days Stagnant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {lowVelocity.map((item) => (
                <tr key={item.sku} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 text-xs font-bold text-gray-400">{item.sku}</td>
                  <td className="px-6 py-5 text-xs font-black text-gray-900 font-sans">{item.name}</td>
                  <td className="px-6 py-5 text-[10px] font-bold text-gray-500 uppercase">{item.cat}</td>
                  <td className="px-6 py-5 text-center text-xs font-bold text-gray-700">{item.qty}</td>
                  <td className="px-6 py-5 text-right text-xs font-bold text-gray-900">{item.value}</td>
                  <td className="px-6 py-5 text-right text-xs font-black text-red-600">{item.days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserReports;
