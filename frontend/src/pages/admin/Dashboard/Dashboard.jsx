import React, { useState, useEffect, useRef } from 'react';
import { Hash, TriangleAlert, Truck, Cpu, SquareTerminal, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import TopBar from '../../../components/TopBar';
import { dashboardAPI } from '../../../services/api';

const Dashboard = () => {
  const [chartMode, setChartMode] = useState('VOL');
  const [stats, setStats]         = useState(null);
  const [chartData, setChartData] = useState([]);
  const [logs, setLogs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [terminalInput, setTerminalInput] = useState('');
  const logsEndRef = useRef(null);

  const loadStats = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch(e) { console.error(e); }
  };

  const loadChart = async (mode) => {
    try {
      const data = await dashboardAPI.getChart(mode);
      setChartData(data.map((d, i) => ({ name: d.week || `D${i+1}`, value: Number(d.value) })));
    } catch(e) { console.error(e); }
  };

  const loadLogs = async () => {
    try {
      const data = await dashboardAPI.getLogs();
      setLogs(data.map(l => ({
        time: l.time,
        type: l.LogType,
        color: l.LogType === 'SYNC' ? 'text-[#059669]' :
               l.LogType === 'WARN' ? 'text-[#d97706]' :
               l.LogType === 'ERR'  ? 'text-[#dc2626]' :
               l.LogType === 'USER' ? 'text-[#0ea5e9]' :
               l.LogType === 'CMD'  ? 'text-[#a78bfa]' : 'text-gray-400',
        msg: l.Message,
      })));
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    Promise.all([loadStats(), loadChart('VOL'), loadLogs()]).finally(() => setLoading(false));
    // Poll logs every 15 seconds
    const interval = setInterval(loadLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { loadChart(chartMode); }, [chartMode]);
  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  const handleTerminalCommand = async (e) => {
    if (e.key === 'Enter' && terminalInput.trim()) {
      const cmd = terminalInput.trim();
      setTerminalInput('');
      await dashboardAPI.addLog(cmd).catch(() => {});
      await loadLogs();
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    Promise.all([loadStats(), loadChart(chartMode), loadLogs()]).finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-col h-full bg-[#fafafa] fade-in">
      <TopBar title="Overview Segment" onRefresh={handleRefresh} alertCount={stats?.unreadAlerts || 0} />

      <div className="flex flex-col flex-1 p-6 overflow-auto">
        {/* Header Info */}
        <div className="flex justify-between items-end mb-6">
          <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">
            DATA_LAKE_SYNC: <span className="text-[#059669] font-bold">REALTIME</span>
          </p>
          <div className="text-xs font-mono text-gray-500 uppercase tracking-wider">
            TIMESTAMP: {new Date().toISOString().slice(0, 19)}Z
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-0 border border-gray-300 mb-6 bg-white">
          {[
            { label: 'Total SKUs', icon: <Hash size={16} className="text-gray-400" />, value: loading ? '—' : stats?.totalSKUs?.toLocaleString() || '—', color: 'text-gray-900' },
            { label: 'Low Stock Alerts', icon: <TriangleAlert size={16} className="text-[#dc2626]" />, value: loading ? '—' : stats?.lowStockAlerts ?? '—', color: 'text-[#dc2626]' },
            { label: 'Recent Orders (24h)', icon: <Truck size={16} className="text-gray-400" />, value: loading ? '—' : stats?.recentOrders ?? '—', color: 'text-gray-900' },
            { label: 'System Health', icon: <Cpu size={16} className="text-[#059669]" />, value: null, color: '' },
          ].map((card, i) => (
            <div key={i} className={`p-4 flex flex-col justify-between h-28 ${i < 3 ? 'border-r border-gray-300' : ''}`}>
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono text-gray-600">{card.label}</span>
                {card.icon}
              </div>
              {card.value !== null ? (
                <div className={`text-xl font-mono font-bold mt-4 ${card.color}`}>
                  {loading ? <Loader2 size={18} className="animate-spin text-gray-400" /> : card.value}
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-3 h-3 bg-[#059669]"></div>
                  <span className="text-sm font-mono font-bold text-[#059669] tracking-wider uppercase">OPTIMAL</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex gap-6 h-[400px]">
          {/* Chart */}
          <div className="flex-1 border border-gray-300 flex flex-col bg-white">
            <div className="flex justify-between items-center p-3 border-b border-gray-300 bg-gray-50">
              <h3 className="text-xs font-bold text-gray-700 tracking-wider">
                Stock Level Analytics — {chartMode === 'VOL' ? '30D Volume' : '30D Valuation'}
              </h3>
              <div className="flex border border-gray-300 text-xs font-mono">
                {['VOL', 'VAL'].map(m => (
                  <button key={m} onClick={() => setChartMode(m)}
                    className={`px-3 py-1 transition-colors ${chartMode === m ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'} ${m === 'VAL' ? 'border-l border-gray-300' : ''}`}
                  >{m}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 p-4 pb-0 pl-0">
              {loading ? (
                <div className="h-full flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'monospace' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontFamily: 'monospace' }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <Tooltip contentStyle={{ fontSize: '11px', fontFamily: 'monospace', border: '1px solid #e5e7eb' }}
                      formatter={v => [chartMode === 'VAL' ? `$${(v/1000).toFixed(1)}k` : v.toLocaleString(), chartMode]} />
                    <Line type="linear" dataKey="value" stroke="#10b981" strokeWidth={4} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Terminal */}
          <div className="w-[350px] flex flex-col border border-gray-300 bg-white">
            <div className="flex justify-between items-center p-3 border-b border-gray-300 bg-gray-50">
              <h3 className="text-xs font-bold text-gray-700 tracking-wider">System Activity</h3>
              <SquareTerminal size={14} className="text-gray-500" />
            </div>
            <div className="flex-1 bg-[#0a0a0a] p-4 flex flex-col text-[10px] font-mono leading-tight overflow-hidden">
              <div className="flex-1 overflow-auto space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-gray-500 flex-shrink-0">{log.time}</span>
                    <span className={`${log.color} flex-shrink-0`}>[{log.type}]</span>
                    <span className="text-gray-300 break-all">{log.msg}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
              <div className="mt-4 pt-2 border-t border-gray-800 flex gap-2">
                <span className="text-[#10b981]">&gt;_</span>
                <input
                  type="text" value={terminalInput}
                  onChange={e => setTerminalInput(e.target.value)}
                  onKeyDown={handleTerminalCommand}
                  className="bg-transparent border-none outline-none w-full text-gray-300 placeholder-gray-600"
                  placeholder="Type a command and press Enter..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
