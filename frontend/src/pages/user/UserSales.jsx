import React, { useState, useEffect } from 'react';
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
  Filter,
  Loader2,
  Printer,
  Download,
  Mail,
  MoreVertical,
  X,
  CreditCard,
  History
} from 'lucide-react';
import { salesAPI } from '../../services/api';
import Swal from 'sweetalert2';

const UserSales = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('LIST'); // 'LIST' or 'DETAILS'
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, [filter, search]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await salesAPI.getInvoices({ search, status: filter });
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      setLoading(true);
      const data = await salesAPI.getInvoice(id);
      setSelectedInvoice(data);
      setView('DETAILS');
    } catch (e) {
      Swal.fire('Error', 'Failed to load invoice details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await salesAPI.updateStatus(id, status);
      const data = await salesAPI.getInvoice(id);
      setSelectedInvoice(data);
      fetchInvoices();
      Swal.fire('Success', `Invoice marked as ${status}`, 'success');
    } catch (e) {
      Swal.fire('Error', 'Failed to update status.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const baseClass = "px-3 py-1 text-[9px] font-black border rounded-sm tracking-tighter uppercase whitespace-nowrap";
    switch (status?.toUpperCase()) {
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

  if (view === 'DETAILS' && selectedInvoice) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
         {/* Detail Header */}
         <div className="flex justify-between items-center bg-black text-white p-8 rounded-sm shadow-2xl">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setView('LIST')}
                className="p-3 border border-white/20 hover:bg-white hover:text-black transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase">Invoice #{selectedInvoice.InvoiceID}</h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  Issued on {new Date(selectedInvoice.InvoiceDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(selectedInvoice.InvoiceStatus)}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Customer Info */}
              <div className="bg-white border border-gray-200 p-8 shadow-sm">
                 <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                    <div>
                      <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer Billing</h2>
                      <h3 className="text-xl font-black text-gray-900 uppercase">{selectedInvoice.CustomerName}</h3>
                      <p className="text-xs text-gray-500 mt-1">{selectedInvoice.Address}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact</p>
                       <p className="text-xs font-bold">{selectedInvoice.Email}</p>
                       <p className="text-xs text-gray-500">{selectedInvoice.Phone}</p>
                    </div>
                 </div>

                 {/* Items Table */}
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                          <th className="py-4">Item Details</th>
                          <th className="py-4 text-center">Qty</th>
                          <th className="py-4 text-right">Price</th>
                          <th className="py-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 font-mono text-xs">
                        {selectedInvoice.items?.map((i, idx) => (
                          <tr key={idx}>
                            <td className="py-5">
                               <p className="font-sans font-black text-gray-900 uppercase">{i.ProductName}</p>
                               <p className="text-[9px] text-gray-400 uppercase">{i.SKU}</p>
                            </td>
                            <td className="py-5 text-center font-black">{i.Quantity}</td>
                            <td className="py-5 text-right">${parseFloat(i.UnitPrice).toFixed(2)}</td>
                            <td className="py-5 text-right font-black text-gray-900">${parseFloat(i.Subtotal).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>

                 {/* Totals */}
                 <div className="mt-10 border-t-2 border-gray-900 pt-6 flex justify-end">
                    <div className="w-64 space-y-3">
                       <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                          <span>Subtotal</span>
                          <span>${parseFloat(selectedInvoice.TotalAmount * 0.8).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                       </div>
                       <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                          <span>Estimated Tax (20%)</span>
                          <span>${parseFloat(selectedInvoice.TotalAmount * 0.2).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                       </div>
                       <div className="flex justify-between text-xl font-black uppercase text-gray-900 pt-3 border-t border-gray-100">
                          <span>Total</span>
                          <span>${parseFloat(selectedInvoice.TotalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
               <div className="bg-white border border-gray-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-3">Actions</h3>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-black hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                     Print Invoice <Printer size={14} />
                  </button>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-black hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                     Download PDF <Download size={14} />
                  </button>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-black hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                     Email Customer <Mail size={14} />
                  </button>
               </div>

               {selectedInvoice.InvoiceStatus !== 'Paid' && (
                 <div className="bg-[#047857] p-6 shadow-xl space-y-4">
                    <div className="flex items-center gap-3 text-white mb-2">
                      <CreditCard size={20} />
                      <h3 className="text-[10px] font-black uppercase tracking-widest">Payment Management</h3>
                    </div>
                    <button 
                      onClick={() => handleUpdateStatus(selectedInvoice.InvoiceID, 'Paid')}
                      className="w-full py-4 bg-white text-[#047857] hover:bg-gray-100 transition-all text-[11px] font-black uppercase tracking-widest shadow-lg"
                    >
                      Record Full Payment
                    </button>
                    <p className="text-[9px] text-green-100 text-center font-bold uppercase">Payment will be logged in reports</p>
                 </div>
               )}

               <div className="bg-white border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 text-gray-400 mb-6">
                    <History size={16} />
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Audit Trail</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex gap-4">
                        <div className="w-1 bg-[#047857] h-auto"></div>
                        <div>
                          <p className="text-[10px] font-black uppercase">Invoice Created</p>
                          <p className="text-[9px] text-gray-400 font-bold">{new Date(selectedInvoice.InvoiceDate).toLocaleString()}</p>
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="w-1 bg-gray-200 h-auto"></div>
                        <div>
                          <p className="text-[10px] font-black uppercase">Due Date Set</p>
                          <p className="text-[9px] text-gray-400 font-bold">{new Date(selectedInvoice.DueDate).toLocaleDateString()}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in bg-[#fafafa]">
      {/* Header Actions */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic">Sales Ledger</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Comprehensive tracking of all outbound inventory and revenue.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/user/sales/create')}
            className="bg-black text-white px-8 py-3 text-[10px] font-black tracking-widest uppercase hover:bg-gray-800 transition-all flex items-center gap-2 shadow-2xl"
          >
            <Plus size={14} /> Create New Invoice
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-gray-200 p-6 flex flex-col md:flex-row md:items-end justify-between gap-6 shadow-sm">
        <div className="flex-1 space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Search</label>
          <div className="relative border-b-2 border-gray-200 pb-2">
            <Search size={14} className="absolute left-0 top-1 text-gray-400" />
            <input 
              type="text" 
              placeholder="SEARCH BY INVOICE ID OR CUSTOMER..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-6 text-xs font-bold focus:outline-none placeholder:text-gray-200 uppercase"
            />
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter By Status:</label>
          <div className="flex gap-px bg-gray-100 border border-gray-200 p-1">
            {['ALL', 'PAID', 'UNPAID', 'DRAFT'].map((s) => (
              <button 
                key={s}
                onClick={() => setFilter(s)}
                className={`px-6 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === s ? 'bg-black text-white' : 'bg-transparent text-gray-400 hover:text-black'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="animate-spin text-[#047857]" size={48} />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/50">
                  <th className="px-6 py-4">Serial</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer Entity</th>
                  <th className="px-6 py-4 text-right">Value (USD)</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {invoices.map((inv) => (
                  <tr key={inv.InvoiceID} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5 text-xs font-bold text-gray-400">INV-{inv.InvoiceID}</td>
                    <td className="px-6 py-5 text-xs text-gray-500">{new Date(inv.InvoiceDate).toLocaleDateString()}</td>
                    <td className="px-6 py-5">
                       <span className="text-xs font-black text-gray-900 font-sans uppercase">{inv.CustomerName}</span>
                    </td>
                    <td className="px-6 py-5 text-right text-xs font-black text-gray-900 tracking-tighter">
                      ${parseFloat(inv.TotalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-5 text-center">{getStatusBadge(inv.InvoiceStatus)}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end items-center gap-4 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleViewDetails(inv.InvoiceID)}
                          className="flex items-center gap-2 bg-black text-white px-4 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-gray-800"
                        >
                          Details <ArrowRight size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">No matching records found in ledger</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSales;
