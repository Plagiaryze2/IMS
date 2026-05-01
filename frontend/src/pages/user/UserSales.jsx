import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  FileText, 
  Eye, 
  Edit2, 
  CheckCircle2, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

const UserSales = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');
  
  const invoices = [
    { id: 'INV-9901', date: '2023-10-24', customer: 'Acme Corp Logistics', amount: '$4,520.00', status: 'PAID' },
    { id: 'INV-9902', date: '2023-10-25', customer: 'Nexus Heavy Industries', amount: '$12,850.50', status: 'UNPAID' },
    { id: 'INV-9903', date: '--', customer: 'Stellar Dynamics', amount: '$890.00', status: 'DRAFT' },
    { id: 'INV-9904', date: '2023-10-21', customer: 'Omni Consumer Products', amount: '$54,200.00', status: 'PAID' },
  ];

  const getStatusBadge = (status) => {
    const baseClass = "px-3 py-1 text-[9px] font-black border rounded-sm tracking-tighter uppercase whitespace-nowrap";
    switch (status) {
      case 'PAID':
        return <span className={`${baseClass} text-[#047857] bg-green-50 border-green-200`}>PAID</span>;
      case 'UNPAID':
        return <span className={`${baseClass} text-red-600 bg-red-50 border-red-200`}>UNPAID</span>;
      case 'DRAFT':
        return <span className={`${baseClass} text-gray-400 bg-gray-50 border-gray-200`}>DRAFT</span>;
      default:
        return <span className={`${baseClass} text-gray-400 bg-gray-50 border-gray-200`}>{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      {/* Header Actions */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Sales Invoices</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage and track all issued invoices across regions.</p>
        </div>
        <div className="flex gap-4">
          <button className="border border-gray-300 px-6 py-3 text-[10px] font-black tracking-widest uppercase hover:bg-gray-50 transition-all flex items-center gap-2">
            Post Sale
          </button>
          <button 
            onClick={() => navigate('/user/sales/create')}
            className="bg-[#047857] text-white px-6 py-3 text-[10px] font-black tracking-widest uppercase hover:bg-[#059669] transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Create New Invoice
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-gray-200 p-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1 space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice # or Customer</label>
          <div className="relative border-b-2 border-gray-200 pb-2">
            <Search size={14} className="absolute left-0 top-1 text-gray-400" />
            <input 
              type="text" 
              placeholder="e.g. INV-9901"
              className="w-full pl-6 text-sm font-bold focus:outline-none placeholder:text-gray-300"
            />
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status:</label>
          <div className="flex gap-px bg-gray-200 border border-gray-200">
            {['ALL', 'PAID', 'UNPAID', 'DRAFT'].map((s) => (
              <button 
                key={s}
                onClick={() => setFilter(s)}
                className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === s ? 'bg-[#047857] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50">
                <th className="px-6 py-4">Invoice Number</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-5 text-xs font-mono font-bold text-gray-400">{inv.id}</td>
                  <td className="px-6 py-5 text-xs font-mono text-gray-500">{inv.date}</td>
                  <td className="px-6 py-5 text-xs font-black text-gray-900">{inv.customer}</td>
                  <td className="px-6 py-5 text-right text-xs font-mono font-bold text-gray-900">{inv.amount}</td>
                  <td className="px-6 py-5 text-center">{getStatusBadge(inv.status)}</td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end items-center gap-4">
                      <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black">View</button>
                      <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#047857]">Edit</button>
                      {inv.status === 'UNPAID' && (
                        <button className="bg-[#047857] text-white px-3 py-1.5 text-[8px] font-black uppercase tracking-widest hover:bg-[#059669] transition-all">
                          Post Sale
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
            Showing 1-4 of 124 records
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-200 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all">Prev</button>
            <button className="px-4 py-2 bg-white border border-gray-200 text-[9px] font-black uppercase tracking-widest text-gray-900 hover:bg-gray-50 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSales;
