import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Clock, 
  Truck, 
  MapPin, 
  FileText,
  Package,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { salesAPI } from '../../services/api';
import Swal from 'sweetalert2';

const UserTracking = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCheckpoints, setShowCheckpoints] = useState(false);

  const fetchShipments = async () => {
    try {
      const data = await salesAPI.getShipments({ search, status: statusFilter });
      setOrders(data);
      if (data.length > 0) {
        setSelectedOrder(prev => prev ? data.find(o => o.id === prev.id) || data[0] : data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShipments();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleUpdateTracking = async () => {
    if (!selectedOrder) return;

    const { value: formValues } = await Swal.fire({
      title: '<h2 class="text-2xl font-black uppercase italic tracking-tighter">Update Tracking</h2>',
      html: `
        <div class="space-y-4 text-left mt-4">
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">New Status</label>
            <select id="swal-status" class="w-full border-2 border-gray-200 p-3 text-sm font-bold uppercase focus:border-black transition-all outline-none">
              <option value="Scheduled">Scheduled</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Returned">Returned</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Current Address / Location</label>
            <input id="swal-location" class="w-full border-2 border-gray-200 p-3 text-sm font-bold uppercase focus:border-black transition-all outline-none" placeholder="e.g. Transit Hub, Frankfurt or Final Destination">
          </div>
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Notes (Optional)</label>
            <input id="swal-notes" class="w-full border-2 border-gray-200 p-3 text-sm font-bold uppercase focus:border-black transition-all outline-none" placeholder="e.g. Delayed due to weather">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'UPDATE',
      cancelButtonText: 'CANCEL',
      customClass: {
        confirmButton: 'bg-black text-white px-6 py-3 font-black text-[10px] tracking-widest uppercase rounded-none hover:bg-gray-800',
        cancelButton: 'bg-gray-200 text-black px-6 py-3 font-black text-[10px] tracking-widest uppercase rounded-none hover:bg-gray-300'
      },
      preConfirm: () => {
        const status = document.getElementById('swal-status').value;
        const location = document.getElementById('swal-location').value;
        const notes = document.getElementById('swal-notes').value;
        return { status, location, notes };
      }
    });

    if (formValues) {
      try {
        Swal.showLoading();
        await salesAPI.updateTracking(selectedOrder.id, formValues);
        await fetchShipments();
        Swal.fire({
          icon: 'success',
          title: 'UPDATED',
          text: 'Tracking information has been logged.',
          confirmButtonColor: '#000',
          customClass: { confirmButton: 'rounded-none font-black text-[10px] tracking-widest uppercase px-6 py-3' }
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'ERROR',
          text: error.message || 'Failed to update tracking',
          confirmButtonColor: '#000',
          customClass: { confirmButton: 'rounded-none font-black text-[10px] tracking-widest uppercase px-6 py-3' }
        });
      }
    }
  };

  const handleViewManifest = () => {
    if (!selectedOrder) return;
    setShowCheckpoints(true);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#047857]" size={48} /></div>;

  return (
    <div className="flex h-full bg-[#fafafa]">
      {/* Main Content Area */}
      <div className={`flex-1 p-8 transition-all duration-300 ${selectedOrder ? 'mr-[450px]' : ''}`}>
        {/* Header Search */}
        <div className="mb-8 relative">
           <Search size={16} className="absolute left-4 top-4 text-gray-400" />
           <input 
             type="text" 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="SEARCH ORDER / TRACKING ID"
             className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 text-sm font-bold focus:outline-none focus:border-black tracking-widest uppercase"
           />
        </div>

        {/* Table Container */}
        <div className="bg-white border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Active Shipments</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-gray-400" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest border-none focus:ring-0 cursor-pointer"
                  >
                    <option value="ALL">ALL STATUS</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Returned">Returned</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Carrier</th>
                  <th className="px-6 py-4">Status / Location</th>
                  <th className="px-6 py-4 text-right">Est. Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-xs">
                {orders.map((o) => (
                  <tr 
                    key={o.id} 
                    onClick={() => setSelectedOrder(o === selectedOrder ? null : o)}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer group ${selectedOrder?.id === o.id ? 'bg-gray-50' : ''}`}
                  >
                    <td className="px-6 py-6 font-black text-[#047857]">{o.id}</td>
                    <td className="px-6 py-6 font-sans font-bold text-gray-900">{o.customer}</td>
                    <td className="px-6 py-6 text-gray-500 font-sans">{o.carrier}</td>
                    <td className="px-6 py-6">
                      <p className={`font-black tracking-tighter ${
                        o.status === 'OUT FOR DELIVERY' ? 'text-blue-600' : 'text-[#047857]'
                      }`}>{o.status}</p>
                      <p className="text-[10px] text-gray-400 uppercase mt-0.5">{o.location}</p>
                    </td>
                    <td className="px-6 py-6 text-right font-bold text-gray-900">{o.delivery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing {orders.length} Shipments</p>
             <div className="flex gap-2">
               <button className="px-4 py-2 bg-white border border-gray-200 text-[10px] font-black uppercase hover:bg-gray-100"><ChevronLeft size={14} /></button>
               <button className="px-4 py-2 bg-white border border-gray-200 text-[10px] font-black uppercase hover:bg-gray-100"><ChevronRight size={14} /></button>
             </div>
          </div>
        </div>
      </div>

      {/* Tracking Detail Sidebar */}
      {selectedOrder && (
        <div className="fixed right-0 top-20 bottom-0 w-[450px] bg-white border-l border-gray-200 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="bg-[#047857] p-8 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Tracking Detail</p>
            <div className="flex justify-between items-end">
               <h3 className="text-3xl font-black tracking-tight">{selectedOrder.id}</h3>
               <span className="text-xs font-mono font-bold border border-white/20 px-2 py-1">DHL</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-12">
            {/* Stepper */}
            <div className="space-y-0 relative pl-4 mt-8">
              {/* Vertical Line */}
              <div className="absolute left-[29px] top-4 bottom-8 w-0.5 bg-gray-300"></div>
              
              {(selectedOrder.timeline || []).map((step, idx) => (
                <div key={idx} className="relative flex gap-6 pb-8">
                  <div className={`relative w-7 h-7 border-2 flex flex-shrink-0 items-center justify-center transition-colors z-10 bg-white ${
                    step.completed ? 'bg-[#047857] border-[#047857] text-white' : 
                    step.current ? 'border-[#047857] text-[#047857]' : 
                    'border-gray-300 text-gray-200'
                  }`}>
                    {step.completed ? <Check size={16} strokeWidth={3} /> : <div className={`w-2.5 h-2.5 ${step.current ? 'bg-[#047857]' : 'bg-transparent'}`}></div>}
                  </div>
                  <div className="pt-0.5">
                    <p className={`text-[11px] font-black tracking-widest uppercase ${
                      step.completed || step.current ? 'text-gray-900' : 'text-gray-300'
                    }`}>{step.status}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 whitespace-pre-line leading-relaxed">
                      {step.location ? `${step.location}\n` : ''}{step.time}
                    </p>
                  </div>
                </div>
              ))}
              {(!selectedOrder.timeline || selectedOrder.timeline.length === 0) && (
                <p className="text-[10px] font-bold text-gray-400 uppercase">No tracking history available.</p>
              )}
            </div>

            {/* Update Tracking Button */}
            <button 
              onClick={handleUpdateTracking}
              className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              <Truck size={16} /> Update Tracking
            </button>

            {/* Checkpoints Button */}
            <button 
              onClick={handleViewManifest}
              className="w-full py-5 bg-[#047857] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#059669] transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Package size={16} /> View Checkpoints
            </button>
          </div>
        </div>
      )}
      {/* Checkpoints Full Screen Overlay */}
      {showCheckpoints && selectedOrder && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in fade-in duration-300">
          {/* Header */}
          <div className="bg-[#047857] p-12 text-white relative">
            <button 
              onClick={() => setShowCheckpoints(false)}
              className="absolute top-8 right-8 p-2 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={24} className="rotate-180" />
            </button>
            <p className="text-xs font-black uppercase tracking-[0.4em] opacity-60 mb-3">Tracking Detail</p>
            <div className="flex justify-between items-end">
               <div>
                 <h3 className="text-6xl font-black tracking-tighter italic">{selectedOrder.id}</h3>
                 <p className="text-sm font-bold uppercase tracking-widest mt-2 opacity-80 flex items-center gap-2">
                   <MapPin size={14} /> {selectedOrder.location}
                 </p>
               </div>
               <div className="border-2 border-white/40 px-4 py-2 font-mono font-bold text-xl">DHL</div>
            </div>
          </div>

          {/* Timeline Content */}
          <div className="flex-1 overflow-y-auto p-12 max-w-4xl mx-auto w-full">
            <div className="space-y-0 relative pl-4">
              {/* Vertical Line */}
              <div className="absolute left-[39px] top-6 bottom-12 w-0.5 bg-gray-200"></div>
              
              {(selectedOrder.timeline || []).map((step, idx) => (
                <div key={idx} className="relative flex gap-10 pb-16">
                  <div className={`relative w-12 h-12 border-[3px] flex flex-shrink-0 items-center justify-center transition-colors z-10 bg-white ${
                    step.completed ? 'bg-[#047857] border-[#047857] text-white' : 
                    step.current ? 'border-[#047857] text-[#047857]' : 
                    'border-gray-200 text-gray-200'
                  }`}>
                    {step.completed ? <Check size={28} strokeWidth={4} /> : <div className={`w-4 h-4 ${step.current ? 'bg-[#047857]' : 'bg-transparent'}`}></div>}
                  </div>
                  <div className="pt-1">
                    <p className={`text-xl font-black tracking-widest uppercase ${
                      step.completed || step.current ? 'text-gray-900' : 'text-gray-300'
                    }`}>{step.status}</p>
                    <p className="text-lg font-bold text-gray-400 mt-2 whitespace-pre-line leading-relaxed">
                      {step.location ? `${step.location}\n` : ''}{step.time}
                    </p>
                  </div>
                </div>
              ))}
              {(!selectedOrder.timeline || selectedOrder.timeline.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Package size={48} className="text-gray-200 mb-4" />
                  <p className="text-xl font-black text-gray-300 uppercase tracking-widest">No movement history recorded yet</p>
                  <p className="text-sm text-gray-400 font-bold mt-2 uppercase">Tracking updates will appear here once logged.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Close */}
          <div className="p-12 border-t border-gray-100 flex justify-center">
            <button 
              onClick={() => setShowCheckpoints(false)}
              className="px-12 py-5 bg-black text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-gray-800 transition-all shadow-xl"
            >
              Close View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTracking;
