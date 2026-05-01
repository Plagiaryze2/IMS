import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MapPin, 
  FileText,
  Package,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { salesAPI } from '../../services/api';

const UserTracking = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const data = await salesAPI.getShipments();
        setOrders(data);
        if (data.length > 0) setSelectedOrder(data[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchShipments();
  }, []);

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
             placeholder="SEARCH ORDER / TRACKING ID"
             className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 text-sm font-bold focus:outline-none focus:border-black tracking-widest"
           />
        </div>

        {/* Table Container */}
        <div className="bg-white border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Active Shipments</h2>
             <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
               <Filter size={14} /> Filter
             </button>
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
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Showing 1-3 of 142</p>
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
            <div className="space-y-8 relative">
              {/* Vertical Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
              
              {(selectedOrder.timeline || [
                { status: 'ORDER PROCESSED', time: '21.10.23 08:45 AM', completed: true },
                { status: 'PICKED & PACKED', time: '21.10.23 14:20 PM', completed: true },
                { status: 'DISPATCHED', time: 'Transit Hub, Frankfurt\n22.10.23 02:15 AM', current: true },
                { status: 'OUT FOR DELIVERY', time: 'Pending' },
                { status: 'DELIVERED', time: 'Est. 24.10.23' },
              ]).map((step, idx) => (
                <div key={idx} className="relative pl-10 flex gap-4">
                  <div className={`absolute left-0 w-6 h-6 border-2 flex items-center justify-center transition-colors z-10 ${
                    step.completed ? 'bg-[#047857] border-[#047857] text-white' : 
                    step.current ? 'bg-white border-[#047857] text-[#047857]' : 
                    'bg-white border-gray-200 text-gray-200'
                  }`}>
                    {step.completed ? <CheckCircle2 size={12} /> : <div className={`w-2 h-2 ${step.current ? 'bg-[#047857]' : 'bg-gray-200'}`}></div>}
                  </div>
                  <div>
                    <p className={`text-[11px] font-black tracking-widest uppercase ${
                      step.completed || step.current ? 'text-gray-900' : 'text-gray-300'
                    }`}>{step.status}</p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 whitespace-pre-line leading-relaxed">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Satellite Mockup */}
            <div className="relative border border-gray-200">
               <img 
                 src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=2021&auto=format&fit=crop" 
                 alt="Satellite View" 
                 className="w-full h-48 object-cover grayscale brightness-50"
               />
               <div className="absolute inset-0 bg-black/10"></div>
               <div className="absolute bottom-4 right-4 bg-white px-2 py-1 text-[8px] font-black uppercase tracking-widest border border-gray-200 shadow-sm">
                  GPS_ACTIVE
               </div>
               {/* Pulsing Dot */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 bg-[#047857] rounded-full animate-ping absolute"></div>
                  <div className="w-3 h-3 bg-[#047857] rounded-full relative"></div>
               </div>
            </div>

            {/* Manifest Button */}
            <button className="w-full py-5 bg-[#047857] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#059669] transition-all flex items-center justify-center gap-2">
              <FileText size={16} /> View Manifest
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTracking;
