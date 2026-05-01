import React, { useState, useEffect } from 'react';
import { alertsAPI } from '../../services/api';
import { Bell, CheckCircle, TriangleAlert, Info, Clock, AlertOctagon } from 'lucide-react';
import Swal from 'sweetalert2';

const UserAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const data = await alertsAPI.getAll();
      setAlerts(data);
    } catch (e) {
      console.error('Failed to fetch alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (id) => {
    try {
      await alertsAPI.acknowledge(id);
      Swal.fire({
        icon: 'success',
        title: 'Acknowledged',
        text: 'The alert has been marked as read.',
        timer: 1500,
        showConfirmButton: false
      });
      fetchAlerts();
    } catch (e) {
      Swal.fire('Error', e.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#047857] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const unreadCount = alerts.filter(a => !a.IsRead).length;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in bg-[#fafafa]">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic">Notifications</h1>
          <p className="text-sm font-bold text-gray-500 mt-2">
            You have <span className={unreadCount > 0 ? 'text-red-600' : 'text-[#047857]'}>{unreadCount} unread</span> alerts requiring attention.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">
            No alerts found.
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.AlertID} 
              className={`bg-white border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md ${!alert.IsRead ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-gray-300 opacity-70'}`}
            >
              <div className="flex gap-4 items-start md:items-center flex-1">
                <div className={`p-3 rounded-sm ${alert.AlertType === 'CRITICAL_THRESHOLD' || alert.AlertType === 'ERROR' ? 'bg-red-50 text-red-600' : alert.AlertType === 'WARN' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                  {alert.AlertType === 'CRITICAL_THRESHOLD' ? <AlertOctagon size={24} /> : alert.AlertType === 'WARN' ? <TriangleAlert size={24} /> : <Info size={24} />}
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-black uppercase tracking-tight ${!alert.IsRead ? 'text-gray-900' : 'text-gray-600'}`}>
                    {alert.Title}
                  </h3>
                  <p className="text-sm font-medium text-gray-500 mt-1">
                    {alert.Description}
                  </p>
                  
                  {alert.ProductName && (
                    <div className="mt-3 flex gap-4 text-xs font-bold text-gray-400">
                      <span className="bg-gray-100 px-2 py-1 rounded-sm uppercase">SKU: {alert.SKU}</span>
                      <span className="bg-gray-100 px-2 py-1 rounded-sm">Stock: {alert.CurrentStock} / {alert.ReorderLevel}</span>
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <Clock size={12} />
                    {new Date(alert.CreatedAt).toLocaleString()}
                    {alert.AcknowledgedBy && (
                      <span className="ml-4 text-[#047857]">
                        Ack by {alert.AcknowledgedBy} at {new Date(alert.AcknowledgedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!alert.IsRead && (
                <button
                  onClick={() => handleAcknowledge(alert.AlertID)}
                  className="bg-[#047857] text-white px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#059669] transition-colors whitespace-nowrap self-start md:self-center"
                >
                  <CheckCircle size={14} /> Acknowledge
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserAlerts;
