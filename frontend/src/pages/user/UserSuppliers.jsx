import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  X, 
  ExternalLink,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Truck,
  Loader2
} from 'lucide-react';
import { procurementAPI } from '../../services/api';

const UserSuppliers = () => {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await procurementAPI.getSuppliers();
        // Map backend fields to frontend fields
        const mapped = data.map(s => ({
          id: `V-${s.SupplierID}`,
          SupplierID: s.SupplierID,
          name: s.SupplierName,
          category: 'INDUSTRIAL',
          contact: s.ContactName,
          email: `${s.ContactName.toLowerCase().replace(' ', '.')}@example.com`,
          leadTime: '3-5 Days',
          rating: '98%',
          status: 'ACTIVE',
          spend: '$0',
          onTime: '100%',
          terms: 'Net 30'
        }));
        setSuppliers(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#047857]" size={48} /></div>;

  const getStatusBadge = (status) => {
    const baseClass = "px-2 py-1 text-[9px] font-black border rounded-sm tracking-tighter uppercase whitespace-nowrap";
    switch (status) {
      case 'ACTIVE':
        return <span className={`${baseClass} text-[#047857] bg-green-50 border-green-200`}>ACTIVE</span>;
      case 'INACTIVE':
        return <span className={`${baseClass} text-gray-400 bg-gray-50 border-gray-200`}>INACTIVE</span>;
      case 'UNDER REVIEW':
        return <span className={`${baseClass} text-red-600 bg-red-50 border-red-200`}>UNDER REVIEW</span>;
      default:
        return <span className={`${baseClass} text-gray-400 bg-gray-50 border-gray-200`}>{status}</span>;
    }
  };

  return (
    <div className="flex h-full bg-[#fafafa]">
      {/* Main Content Area */}
      <div className={`flex-1 p-8 transition-all duration-300 ${selectedVendor ? 'mr-[400px]' : ''}`}>
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-8 mb-8">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Vendor Directory</h1>
          <button className="bg-[#047857] text-white px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-[#059669] transition-all">
            <Plus size={14} /> Add New Supplier
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search suppliers..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 text-sm font-bold focus:outline-none focus:border-black"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
            <Filter size={14} /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50">
                  <th className="px-6 py-4">Supplier Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Lead Time</th>
                  <th className="px-6 py-4">Rating [QS%]</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suppliers.map((s) => (
                  <tr 
                    key={s.id} 
                    onClick={() => setSelectedVendor(s)}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer group ${selectedVendor?.id === s.id ? 'bg-gray-50' : ''}`}
                  >
                    <td className="px-6 py-5">
                      <p className="text-xs font-black text-gray-900">{s.name}</p>
                      <p className="text-[9px] font-mono text-gray-400 uppercase mt-0.5">{s.id}</p>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-gray-500">{s.category}</td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-bold text-gray-700">{s.contact}</p>
                      <p className="text-[10px] font-medium text-gray-400">{s.email}</p>
                    </td>
                    <td className="px-6 py-5 text-xs font-mono text-gray-400">{s.leadTime}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#047857]">{s.rating}</span>
                        <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#047857]" 
                            style={{ width: s.rating }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">{getStatusBadge(s.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vendor Detail Sidebar */}
      {selectedVendor && (
        <div className="fixed right-0 top-20 bottom-0 w-[400px] bg-white border-l border-gray-200 shadow-2xl z-40 animate-in slide-in-from-right duration-300 overflow-y-auto">
          <div className="p-8 space-y-8">
            {/* Sidebar Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedVendor.name}</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Vendor ID: {selectedVendor.id}</p>
              </div>
              <button 
                onClick={() => setSelectedVendor(null)}
                className="p-1 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Vendor Summary */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] border-b border-gray-100 pb-2">Vendor Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 border border-gray-100">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total Spend (YTD)</p>
                  <p className="text-lg font-black text-gray-900 mt-1">{selectedVendor.spend || '$0'}</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-100">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">On-Time Delivery</p>
                  <p className="text-lg font-black text-[#047857] mt-1">{selectedVendor.onTime || '0%'}</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-100">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Payment Terms</p>
                  <p className="text-[10px] font-bold text-gray-700 mt-1">{selectedVendor.terms || 'N/A'}</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-100">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Primary Contact</p>
                  <p className="text-[10px] font-bold text-gray-700 mt-1">{selectedVendor.contact}</p>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Recent Transactions</h3>
                <button className="text-[9px] font-black text-[#047857] uppercase tracking-widest hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'PO-2023-4921', item: 'Microcontrollers (x5000)', date: 'Oct 12, 2023', amount: '$45,000.00', status: 'DELIVERED' },
                  { id: 'PO-2023-4880', item: 'Capacitors & Resistors Kit', date: 'Oct 05, 2023', amount: '$12,450.00', status: 'IN TRANSIT' },
                  { id: 'PO-2023-4712', item: 'PCB Boards (Custom)', date: 'Sep 28, 2023', amount: '$89,200.00', status: 'DELIVERED' },
                ].map((po) => (
                  <div key={po.id} className="p-4 border border-gray-100 hover:border-gray-300 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] font-black text-gray-900 uppercase">{po.id}</p>
                      <span className={`text-[8px] font-black px-2 py-0.5 border rounded-sm ${
                        po.status === 'DELIVERED' ? 'text-[#047857] border-green-200 bg-green-50' : 'text-blue-600 border-blue-200 bg-blue-50'
                      }`}>
                        {po.status}
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-gray-700">{po.item}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-[10px] font-medium text-gray-400">{po.date}</p>
                      <p className="text-[10px] font-black text-gray-900">{po.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Button */}
            <button className="w-full py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
              View Full Vendor Profile <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSuppliers;
