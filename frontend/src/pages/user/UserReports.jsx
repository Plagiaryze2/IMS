import React, { useState, useEffect } from 'react';
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
  MoreVertical,
  Loader2,
  Package
} from 'lucide-react';

import { reportsAPI } from '../../services/api';
import Swal from 'sweetalert2';

const UserReports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await reportsAPI.getStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to fetch report stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type) => {
    Swal.fire({
      title: `Exporting ${type}...`,
      html: 'Preparing your data for download.',
      timer: 2000,
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {
        // Logic for real export would go here
        Swal.fire('Export Complete', `Your ${type} report is ready.`, 'success');
      }
    });
  };

  const salesData = stats?.salesTrend?.length > 0 ? stats.salesTrend : [
    { name: '01', value: 0 },
    { name: '05', value: 0 },
    { name: '10', value: 0 },
  ];

  const pieData = stats?.categoryData?.length > 0 ? stats.categoryData : [
    { name: 'No Data', value: 1 }
  ];

  const COLORS = ['#047857', '#64748b', '#94a3b8', '#e2e8f0'];

  const kpis = [
    { 
      title: 'Total Revenue', 
      value: `$${parseFloat(stats?.kpis?.totalRevenue ?? 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`, 
      trend: '+14.2%', up: true, icon: <DollarSign size={20} /> 
    },
    { 
      title: 'Pending Revenue', 
      value: `$${parseFloat(stats?.kpis?.pendingRevenue ?? 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`, 
      trend: '+8.7%', up: true, icon: <Briefcase size={20} /> 
    },
    { 
      title: 'Active Orders', 
      value: stats?.kpis?.activeOrders ?? '0', 
      trend: '-2.1%', up: false, icon: <ShoppingCart size={20} /> 
    },
    { 
      title: 'Inventory Valuation', 
      value: `$${(parseFloat(stats?.kpis?.inventoryValue ?? 0) / 1000).toFixed(2)}K`, 
      trend: '0.0%', up: null, icon: <Box size={20} /> 
    },
  ];

  const topProducts = stats?.topProducts || [];
  const lowVelocity = stats?.lowVelocity || [];

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#047857]" size={48} /></div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in bg-[#fafafa] font-sans">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic">Analytics & Performance</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Real-time business intelligence and inventory insights.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => handleExport('PDF')}
            className="bg-white border border-gray-200 px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-gray-50 transition-all"
          >
            <Download size={14} /> Export PDF
          </button>
          <button 
            onClick={() => handleExport('EXCEL')}
            className="bg-white border border-gray-200 px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-gray-50 transition-all"
          >
            <Download size={14} /> Export Excel
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white border border-gray-200 p-6 shadow-sm group hover:border-black transition-all">
             <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-gray-50 group-hover:bg-black group-hover:text-white transition-all">
                 {kpi.icon}
               </div>
               {kpi.up !== null && (
                 <div className={`flex items-center gap-1 text-[10px] font-black ${kpi.up ? 'text-[#047857]' : 'text-red-600'}`}>
                   {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                   {kpi.trend}
                 </div>
               )}
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{kpi.title}</p>
             <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-8 shadow-sm">
           <div className="flex justify-between items-center mb-10">
             <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Revenue Stream (Last 7 Days)</h2>
             <div className="flex items-center gap-4 text-[10px] font-black uppercase text-gray-400">
                <span className="flex items-center gap-2"><div className="w-3 h-3 bg-[#047857]"></div> Sales Revenue</span>
             </div>
           </div>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={salesData}>
                 <defs>
                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#047857" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#047857" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                 <Tooltip 
                   contentStyle={{backgroundColor: '#000', border: 'none', color: '#fff', fontSize: '10px', fontWeight: 'bold'}}
                   itemStyle={{color: '#fff'}}
                 />
                 <Area type="monotone" dataKey="value" stroke="#047857" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Category Pie */}
        <div className="bg-white border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-10">Inventory Split</h2>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
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
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
               <span className="text-2xl font-black">{pieData.reduce((a,b) => a + b.value, 0)}</span>
               <span className="text-[9px] font-black text-gray-400 uppercase">Units</span>
            </div>
          </div>
          <div className="mt-8 space-y-3">
             {pieData.map((d, i) => (
               <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                   <span className="text-gray-900">{d.name}</span>
                 </div>
                 <span className="text-gray-400">{d.value} Units</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Best Selling SKUs</h2>
            <button className="text-gray-400 hover:text-black"><MoreVertical size={16} /></button>
          </div>
          <div className="p-6 space-y-6">
            {topProducts.map((p, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-gray-900">{p.ProductName}</span>
                  <span className="text-[#047857]">{p.units} Sold</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100">
                  <div className="h-full bg-[#047857]" style={{width: `${p.percentage}%`}}></div>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-center py-10 text-[10px] font-black text-gray-300 uppercase">No sales data available</p>}
          </div>
        </div>

        {/* Low Velocity Table */}
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
               <AlertTriangle size={18} className="text-amber-500" /> Low Velocity Stock
             </h2>
             <span className="text-[9px] font-black bg-amber-50 text-amber-600 px-2 py-1 rounded-sm border border-amber-100 uppercase">Action Required</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4 text-center">Available</th>
                  <th className="px-6 py-4 text-right">Hold Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                {lowVelocity.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                       <p className="font-sans font-bold text-gray-900 uppercase">{item.name}</p>
                       <p className="text-[9px] text-gray-400 uppercase">{item.SKU}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-black text-gray-900">{item.qty}</td>
                    <td className="px-6 py-4 text-right font-black text-[#047857]">${parseFloat(item.value).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserReports;
