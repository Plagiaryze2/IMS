import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Download, 
  Eye, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { inventoryAPI } from '../../services/api';
import Swal from 'sweetalert2';

const UserInventory = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showAdjustment, setShowAdjustment] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [page, lowStockOnly]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryAPI.getAll({ page, limit: 10, search: searchTerm });
      setItems(data.items || []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const baseClass = "px-2 py-1 text-[9px] font-black border rounded-sm tracking-tighter uppercase";
    switch (status?.toLowerCase()) {
      case 'in stock':
        return <span className={`${baseClass} text-[#047857] bg-green-50 border-green-200`}>IN STOCK</span>;
      case 'low stock':
        return <span className={`${baseClass} text-orange-600 bg-orange-50 border-orange-200`}>LOW STOCK</span>;
      case 'out of stock':
        return <span className={`${baseClass} text-red-600 bg-red-50 border-red-200`}>OUT OF STOCK</span>;
      default:
        return <span className={`${baseClass} text-gray-600 bg-gray-50 border-gray-200`}>{status || 'UNKNOWN'}</span>;
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in relative">
      {/* Top Header Actions */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Live Inventory Status</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/user/inventory/add')}
            className="bg-[#047857] text-white px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-[#059669] transition-all"
          >
            <Plus size={14} /> Add Product
          </button>
          <button 
            onClick={() => setShowAdjustment(true)}
            className="bg-[#047857] text-white px-6 py-3 text-[10px] font-black tracking-widest uppercase hover:bg-[#059669] transition-all"
          >
            Bulk Adjustment
          </button>
          <button className="border border-gray-300 px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-gray-50 transition-all">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-gray-200 p-8 flex flex-col justify-between h-40">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Items in Stock</p>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-bold text-gray-900">124,592</span>
            <span className="text-[10px] font-black text-[#047857] uppercase tracking-widest">+2.4% ↑</span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-8 flex flex-col justify-between h-40">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Value on Hand</p>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-bold text-gray-900">$3.2M</span>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">USD</span>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 p-8 flex flex-col justify-between h-40">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-600">Items Below Threshold</p>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-bold text-red-600">47</span>
            <AlertCircle size={24} className="text-red-500 opacity-50" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Filters Bar */}
        <div className="flex items-center gap-4 border border-gray-200 p-2 bg-white">
          <div className="flex-1 flex items-center gap-4 px-4">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Quick Search SKU or Name..."
              className="flex-1 py-2 text-sm focus:outline-none placeholder:text-gray-300 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 px-6 border-l border-gray-100">
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Low Stock Only</span>
            <button 
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`w-10 h-5 rounded-full transition-all relative ${lowStockOnly ? 'bg-[#047857]' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${lowStockOnly ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>
        </div>

        <div className="border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50">
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Unit Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-xs font-bold text-gray-400">Loading master list...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-xs font-bold text-gray-400">No records found.</td></tr>
                ) : items.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5 text-xs font-mono text-gray-400">{item.SKU || `PRD-${String(i).padStart(3, '0')}`}</td>
                    <td className="px-6 py-5 text-xs font-black tracking-tight text-gray-900">{item.ProductName}</td>
                    <td className="px-6 py-5 text-xs font-bold text-gray-500">{item.CategoryName || 'General'}</td>
                    <td className="px-6 py-5">
                      {getStatusBadge(item.Quantity > 50 ? 'IN STOCK' : item.Quantity > 0 ? 'LOW STOCK' : 'OUT OF STOCK')}
                    </td>
                    <td className="px-6 py-5 text-xs font-mono text-gray-600">${parseFloat(item.Price || 0).toFixed(2)}</td>
                    <td className="px-6 py-5 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-black transition-colors"><Eye size={14} /></button>
                      <button 
                        onClick={() => setShowAdjustment(true)}
                        className="p-1.5 text-gray-400 hover:text-[#047857] transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 p-6 flex justify-between items-center bg-gray-50/50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Showing 1-{items.length} of {totalRecords} records
            </p>
            <div className="flex gap-px bg-gray-200 border border-gray-200">
              <button className="bg-white p-2 text-gray-400 hover:text-black transition-colors disabled:opacity-30" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              <button className={`px-4 py-2 text-[10px] font-black ${page === 1 ? 'bg-[#047857] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>1</button>
              <button className={`px-4 py-2 text-[10px] font-black ${page === 2 ? 'bg-[#047857] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>2</button>
              <button className={`px-4 py-2 text-[10px] font-black ${page === 3 ? 'bg-[#047857] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>3</button>
              <button className="bg-white p-2 text-gray-400 hover:text-black transition-colors" onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Adjustment Modal */}
      {showAdjustment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-[#047857] text-white p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold tracking-tight">Quick Adjustment</h3>
              <button 
                onClick={() => setShowAdjustment(false)}
                className="p-1 hover:bg-white/20 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Product Search</label>
                <div className="relative border-b-2 border-gray-200 pb-2">
                  <Search size={14} className="absolute left-0 top-1 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Scan SKU or type name"
                    className="w-full pl-6 text-sm font-bold focus:outline-none placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Adjustment Type</label>
                <div className="flex gap-px bg-gray-200 border border-gray-200">
                  <button className="flex-1 py-3 text-[10px] font-black bg-white hover:bg-gray-50 transition-colors uppercase">Add</button>
                  <button className="flex-1 py-3 text-[10px] font-black bg-white hover:bg-gray-50 transition-colors uppercase">Remove</button>
                  <button className="flex-1 py-3 text-[10px] font-black bg-white hover:bg-gray-50 transition-colors uppercase">Set</button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Quantity</label>
                <input 
                  type="number" 
                  defaultValue="1"
                  className="w-full border-2 border-gray-100 p-4 text-xl font-bold focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Reason</label>
                <select className="w-full border-b-2 border-gray-200 p-2 text-sm font-bold bg-white focus:outline-none focus:border-black">
                  <option>Inventory Count</option>
                  <option>Damage</option>
                  <option>Returned Goods</option>
                  <option>Sales Shipment</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => setShowAdjustment(false)}
                  className="flex-1 py-4 border border-gray-300 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button className="flex-[2] py-4 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all">
                  Confirm Adjustment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInventory;


