import React, { useState, useEffect } from 'react';
import { TriangleAlert, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';
import TopBar from '../../../components/TopBar';
import { alertsAPI } from '../../../services/api';
import Swal from 'sweetalert2';

const typeConfig = {
  CRITICAL_THRESHOLD: { label: 'CRITICAL THRESHOLD', colorClass: 'text-red-600', borderClass: 'border-red-300', bgClass: 'bg-red-50', Icon: TriangleAlert },
  INBOUND_DELIVERY:   { label: 'INBOUND DELIVERY',   colorClass: 'text-emerald-600', borderClass: 'border-emerald-300', bgClass: 'bg-emerald-50', Icon: CheckCircle },
  SYSTEM_LOG:         { label: 'SYSTEM LOG',          colorClass: 'text-gray-800', borderClass: 'border-gray-300', bgClass: 'bg-white', Icon: ShieldAlert },
  STOCK_WARNING:      { label: 'STOCK WARNING',        colorClass: 'text-gray-400', borderClass: 'border-gray-300', bgClass: 'bg-white', Icon: TriangleAlert },
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const AlertsCenter = () => {
  const [alerts, setAlerts]           = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [activeTab, setActiveTab]     = useState('ALL');
  const [search, setSearch]           = useState('');
  const [loading, setLoading]         = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await alertsAPI.getAll();
      setAlerts(data);
      if (!selectedAlert && data.length > 0) setSelectedAlert(data[0]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadAlerts(); }, []);

  const unreadCount = alerts.filter(a => !a.IsRead).length;

  const filtered = alerts.filter(alert => {
    const matchTab =
      activeTab === 'ALL' ||
      (activeTab === 'UNREAD' && !alert.IsRead) ||
      (activeTab === 'STOCK'  && alert.Category === 'STOCK') ||
      (activeTab === 'SYSTEM' && alert.Category === 'SYSTEM');
    const matchSearch = !search ||
      alert.AlertID?.toString().includes(search) ||
      alert.Title?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleAcknowledge = async () => {
    const confirm = await Swal.fire({
      title: 'Acknowledge Alert?',
      text: `This will mark Alert #${selectedAlert.AlertID} as resolved.`,
      icon: 'question', showCancelButton: true,
      confirmButtonColor: '#047857', cancelButtonColor: '#6b7280', confirmButtonText: 'Acknowledge'
    });
    if (!confirm.isConfirmed) return;
    try {
      await alertsAPI.acknowledge(selectedAlert.AlertID);
      Swal.fire({ icon: 'success', title: 'Acknowledged', timer: 1500, showConfirmButton: false });
      setAlerts(prev => prev.map(a => a.AlertID === selectedAlert.AlertID ? {...a, IsRead: true} : a));
      setSelectedAlert(prev => ({...prev, IsRead: true}));
    } catch (e) { Swal.fire({ icon: 'error', text: e.message }); }
  };

  const handleExecute = async () => {
    const confirm = await Swal.fire({
      title: 'Generate Purchase Order?',
      html: `<p style="font-size:13px;color:#374151;">Auto-fill PO for <strong>50 units</strong> of <strong>${selectedAlert.ProductName || 'this item'}</strong></p>`,
      icon: 'question', showCancelButton: true,
      confirmButtonColor: '#047857', cancelButtonColor: '#6b7280', confirmButtonText: 'Execute'
    });
    if (!confirm.isConfirmed) return;
    try {
      await alertsAPI.create({
        type: 'INBOUND_DELIVERY', category: 'STOCK',
        title: `PO Executed: ${selectedAlert.ProductName || 'Item'}`,
        description: `Purchase order for 50 units generated and submitted to supplier.`,
        relatedID: selectedAlert.RelatedID
      });
      Swal.fire({ icon: 'success', title: 'PO Generated!', text: 'Purchase order submitted to supplier.', confirmButtonColor: '#047857', timer: 2000, showConfirmButton: false });
      loadAlerts();
    } catch (e) { Swal.fire({ icon: 'error', text: e.message }); }
  };

  const handleInitiate = () => {
    Swal.fire({
      title: 'Initiate Stock Transfer?',
      html: `<p style="font-size:13px;color:#374151;">Transfer surplus units from another warehouse to resolve shortage.</p>`,
      icon: 'info', showCancelButton: true, confirmButtonColor: '#047857',
      cancelButtonColor: '#6b7280', confirmButtonText: 'Initiate Transfer'
    }).then(r => {
      if (r.isConfirmed) Swal.fire({ icon: 'success', title: 'Transfer Initiated!', timer: 2000, showConfirmButton: false });
    });
  };

  const tabs = [
    { key: 'ALL',    label: 'ALL' },
    { key: 'UNREAD', label: `UNREAD (${unreadCount})` },
    { key: 'STOCK',  label: 'STOCK' },
    { key: 'SYSTEM', label: 'SYSTEM' },
  ];

  const cfg = selectedAlert ? (typeConfig[selectedAlert.AlertType] || typeConfig.SYSTEM_LOG) : null;

  return (
    <div className="flex flex-col h-full bg-white font-['Inter',sans-serif] fade-in">
      <TopBar title="ALERTS_CENTER" alertCount={unreadCount} />

      <div className="flex flex-1 min-h-0">
        {/* Left Pane */}
        <div className="w-[450px] border-r border-gray-300 flex flex-col flex-shrink-0">
          <div className="p-6 pb-4">
            <div className="flex border border-gray-300 mb-4 text-[10px] font-bold tracking-widest uppercase">
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 text-center border-l border-gray-300 first:border-l-0 transition-colors ${activeTab === tab.key ? 'bg-black text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Filter alerts by ID or keyword..."
              className="w-full border border-gray-300 px-4 py-2 text-xs font-mono text-gray-500 focus:outline-none focus:border-gray-500" />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-gray-400 text-xs font-mono">No alerts match your filter.</div>
            ) : filtered.map(alert => {
              const c = typeConfig[alert.AlertType] || typeConfig.SYSTEM_LOG;
              const { Icon } = c;
              return (
                <div key={alert.AlertID} onClick={() => setSelectedAlert(alert)}
                  className={`p-6 border-b border-gray-300 cursor-pointer transition-colors ${selectedAlert?.AlertID === alert.AlertID ? 'bg-[#f0fdf4]' : 'hover:bg-gray-50'}`}>
                  <div className="flex gap-4">
                    <div className={`mt-1 flex-shrink-0 border ${c.borderClass} p-1.5 ${c.bgClass}`}>
                      <Icon size={20} className={c.colorClass} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 ${c.colorClass}`}>
                          {!alert.IsRead && <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />}
                          {c.label}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">{timeAgo(alert.CreatedAt)}</span>
                      </div>
                      <h3 className="text-base font-bold mb-1 text-gray-900 leading-tight">{alert.Title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{alert.Description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane */}
        <div className="flex-1 bg-white overflow-y-auto">
          {selectedAlert && cfg ? (
            <div className="p-12 max-w-4xl">
              <div className="flex justify-between items-start mb-6">
                <div className={`flex items-center gap-2 border ${cfg.borderClass} px-3 py-1 ${cfg.bgClass} ${cfg.colorClass} text-[10px] font-black uppercase tracking-widest`}>
                  <cfg.Icon size={12} strokeWidth={3} />
                  {cfg.label}
                </div>
                <button onClick={handleAcknowledge}
                  className={`border px-6 py-2 text-[10px] font-black tracking-widest uppercase transition-colors ${!selectedAlert.IsRead ? 'border-gray-400 text-gray-700 hover:bg-gray-50' : 'border-green-400 text-green-600 bg-green-50 cursor-default'}`}>
                  {selectedAlert.IsRead ? '✓ Acknowledged' : 'Acknowledge'}
                </button>
              </div>

              <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-4">{selectedAlert.Title}</h2>
              <p className="text-xs font-mono text-gray-500 mb-10 tracking-widest uppercase">
                Alert ID: ALRT-{selectedAlert.AlertID} • {new Date(selectedAlert.CreatedAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mb-10">{selectedAlert.Description}</p>

              {/* Stock details if critical */}
              {selectedAlert.AlertType === 'CRITICAL_THRESHOLD' && selectedAlert.CurrentStock !== undefined && (
                <>
                  <div className="grid grid-cols-2 border-t border-l border-gray-400 mb-12 text-sm font-mono uppercase">
                    <div className="border-b border-r border-gray-400 p-6">
                      <div className="text-[10px] font-black tracking-widest text-gray-500 mb-2">Current Stock</div>
                      <div className="text-red-600 font-bold">{selectedAlert.CurrentStock}</div>
                    </div>
                    <div className="border-b border-r border-gray-400 p-6">
                      <div className="text-[10px] font-black tracking-widest text-gray-500 mb-2">Min Threshold</div>
                      <div className="text-gray-900 font-bold">{selectedAlert.ReorderLevel}</div>
                    </div>
                    <div className="border-b border-r border-gray-400 p-6">
                      <div className="text-[10px] font-black tracking-widest text-gray-500 mb-2">SKU</div>
                      <div className="text-gray-600">{selectedAlert.SKU || '—'}</div>
                    </div>
                    <div className="border-b border-r border-gray-400 p-6">
                      <div className="text-[10px] font-black tracking-widest text-gray-500 mb-2">Product</div>
                      <div className="text-gray-600">{selectedAlert.ProductName || '—'}</div>
                    </div>
                  </div>

                  <h3 className="text-[10px] font-black tracking-widest uppercase text-gray-800 mb-4">Recommended Actions</h3>
                  <div className="border border-gray-400 p-6 mb-4 bg-white flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">Generate Purchase Order</h4>
                      <p className="text-xs text-gray-500">Auto-fill PO for 50 units from supplier.</p>
                    </div>
                    <button onClick={handleExecute} className="bg-[#059669] hover:bg-[#047857] text-white px-6 py-2 text-[10px] font-black tracking-widest uppercase transition-colors">Execute</button>
                  </div>
                  <div className="border border-gray-400 p-6 bg-white flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">Transfer Internal Stock</h4>
                      <p className="text-xs text-gray-500">Move surplus units from another warehouse location.</p>
                    </div>
                    <button onClick={handleInitiate} className="border border-gray-400 text-gray-800 hover:bg-gray-50 px-6 py-2 text-[10px] font-black tracking-widest uppercase transition-colors">Initiate</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-400 text-sm">Select an alert to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsCenter;
