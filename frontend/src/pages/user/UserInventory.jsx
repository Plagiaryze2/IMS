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
  XCircle,
  RefreshCw
} from 'lucide-react';
import { inventoryAPI } from '../../services/api';
import Swal from 'sweetalert2';

const UserInventory = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalStock: 0, totalValue: 0, lowStock: 0 });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [adjustmentData, setAdjustmentData] = useState({
    productID: '',
    type: 'ADD',
    quantity: 1,
    reason: 'Inventory Count',
    productName: ''
  });
  const [editData, setEditData] = useState({
    productID: '',
    name: '',
    sku: '',
    price: '',
    cost: '',
    description: ''
  });

  const toggleSelect = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) setSelectedItems([]);
    else setSelectedItems(items.map(i => i.ProductID));
  };

  const handleBulkAdjustSubmit = async () => {
    if (selectedItems.length === 0 && !adjustmentData.productID) {
      Swal.fire('Error', 'Please select items to adjust', 'error');
      return;
    }

    try {
      const adjustments = selectedItems.length > 0 
        ? selectedItems.map(id => ({
            productID: id,
            type: adjustmentData.type,
            quantity: adjustmentData.quantity,
            reason: adjustmentData.reason
          }))
        : [{
            productID: adjustmentData.productID,
            type: adjustmentData.type,
            quantity: adjustmentData.quantity,
            reason: adjustmentData.reason
          }];

      await inventoryAPI.bulkAdjust({ adjustments });
      Swal.fire('Success', `Adjusted ${adjustments.length} items successfully`, 'success');
      setShowAdjustment(false);
      setSelectedItems([]);
      fetchInventory();
      fetchStats();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchStats();
  }, [page, lowStockOnly]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryAPI.getAll({ 
        page, 
        limit: 10, 
        search: searchTerm,
        status: lowStockOnly ? 'REORDER_WARNING' : ''
      });
      setItems(data.items || []);
      setTotalRecords(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await inventoryAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This will deactivate the product from the system.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await inventoryAPI.remove(id);
        Swal.fire('Deleted!', 'Product has been deactivated.', 'success');
        fetchInventory();
        fetchStats();
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  const handleEditSubmit = async () => {
    if (parseFloat(editData.price) < parseFloat(editData.cost)) {
      return Swal.fire('Error', 'Selling Price cannot be lower than Unit Cost.', 'error');
    }
    try {
      await inventoryAPI.update(editData.productID, {
        productName: editData.name,
        unitPrice: editData.price,
        description: editData.description
      });
      Swal.fire('Updated!', 'Product details updated successfully.', 'success');
      setShowEdit(false);
      fetchInventory();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const openEdit = (item) => {
    setEditData({
      productID: item.ProductID,
      name: item.ProductName,
      sku: item.SKU,
      price: item.UnitPrice,
      cost: item.CostPrice,
      description: item.Description || ''
    });
    setShowEdit(true);
  };

  const handleView = (item) => {
    Swal.fire({
      title: `<span class="text-lg font-black uppercase tracking-widest">${item.ProductName}</span>`,
      html: `
        <div class="text-left space-y-4 font-sans p-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">SKU</p>
              <p class="text-xs font-mono font-bold">${item.SKU}</p>
            </div>
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</p>
              <p class="text-xs font-bold">${item.Category || 'N/A'}</p>
            </div>
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Level</p>
              <p class="text-xs font-bold">${item.Stock} Units</p>
            </div>
            <div>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit Price</p>
              <p class="text-xs font-bold">$${parseFloat(item.UnitPrice).toFixed(2)}</p>
            </div>
          </div>
          <div class="pt-4 border-t border-gray-100">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</p>
            <p class="text-xs text-gray-600 italic mt-1">${item.Description || 'No description provided.'}</p>
          </div>
        </div>
      `,
      confirmButtonColor: '#047857',
      confirmButtonText: 'CLOSE_DETAIL'
    });
  };

  const handleExport = () => {
    if (items.length === 0) return;
    const headers = ['SKU', 'Product Name', 'Category', 'Stock', 'Unit Price', 'Status'];
    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        item.SKU,
        `"${item.ProductName}"`,
        item.Category,
        item.Stock,
        item.UnitPrice,
        item.Status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAdjustForProduct = (item) => {
    setAdjustmentData({
      productID: item.ProductID,
      type: 'ADD',
      quantity: 1,
      reason: 'Inventory Count',
      productName: item.ProductName
    });
    setShowAdjustment(true);
  };

  const getStatusBadge = (status) => {
    const baseClass = "px-2 py-1 text-[9px] font-black border rounded-sm tracking-tighter uppercase";
    switch (status?.toUpperCase()) {
      case 'OPTIMAL':
        return <span className={`${baseClass} text-[#047857] bg-green-50 border-green-200`}>IN STOCK</span>;
      case 'REORDER_WARNING':
        return <span className={`${baseClass} text-orange-600 bg-orange-50 border-orange-200`}>LOW STOCK</span>;
      case 'CRITICAL_SHORTAGE':
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
            className="bg-[#047857] text-white px-8 py-4 text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-3 hover:bg-[#065f46] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-green-900/20 rounded-sm"
          >
            <Plus size={16} /> New_Product_Reg
          </button>
          <button 
            onClick={() => setShowAdjustment(true)}
            className={`px-6 py-4 text-[10px] font-black tracking-widest uppercase flex items-center gap-3 transition-all border-2 rounded-sm ${selectedItems.length > 0 ? 'bg-black text-white border-black hover:bg-zinc-800' : 'bg-white text-gray-300 border-gray-100'}`}
          >
            <RefreshCw size={14} className={selectedItems.length > 0 ? 'animate-spin-slow' : ''} />
            Bulk_Sync {selectedItems.length > 0 && `(${selectedItems.length})`}
          </button>
          <button 
            onClick={handleExport}
            className="border-2 border-gray-100 bg-white px-6 py-4 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-gray-50 transition-all rounded-sm"
          >
            <Download size={14} /> Export_CSV
          </button>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-gray-200 p-8 flex flex-col justify-between h-40 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Units in Stock</p>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-bold text-gray-900 tracking-tighter">{stats.totalStock.toLocaleString()}</span>
            <span className="text-[10px] font-black text-[#047857] uppercase tracking-widest">Global_Qty</span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 p-8 flex flex-col justify-between h-40 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Asset Value</p>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-bold text-gray-900 tracking-tighter">${(stats.totalValue / 1000).toFixed(1)}k</span>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">USD_Net</span>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 p-8 flex flex-col justify-between h-40 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-600 font-bold">Alert_Threshold_Items</p>
          <div className="flex items-baseline justify-between">
            <span className="text-4xl font-bold text-red-600 tracking-tighter">{stats.lowStock}</span>
            <AlertCircle size={24} className="text-red-500 opacity-50" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Filters Bar */}
        <div className="flex items-center gap-4 border border-gray-200 p-2 bg-white shadow-sm">
          <div className="flex-1 flex items-center gap-4 px-4">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Query Master Database (SKU, Name, Category)..."
              className="flex-1 py-3 text-sm focus:outline-none placeholder:text-gray-300 font-medium bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchInventory()}
            />
          </div>
          <div className="flex items-center gap-4 px-6 border-l border-gray-100">
            <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Alert_Filter</span>
            <button 
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`w-12 h-6 rounded-full transition-all relative ${lowStockOnly ? 'bg-red-600' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${lowStockOnly ? 'right-1' : 'left-1'}`}></div>
            </button>
          </div>
        </div>

        <div className="border border-gray-200 bg-white shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50/50">
                  <th className="px-6 py-5 w-12">
                    <input 
                      type="checkbox" 
                      checked={items.length > 0 && selectedItems.length === items.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-[#047857]"
                    />
                  </th>
                  <th className="px-6 py-5">UID/SKU</th>
                  <th className="px-6 py-5">Classification</th>
                  <th className="px-6 py-5">Product_Label</th>
                  <th className="px-6 py-5 text-center">Available_Qty</th>
                  <th className="px-6 py-5">Integrity_State</th>
                  <th className="px-6 py-5">Rate_USD</th>
                  <th className="px-6 py-5 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="8" className="px-6 py-16 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Synchronizing Ledger Data...</td></tr>
                ) : items.length === 0 ? (
                  <tr><td colSpan="8" className="px-6 py-16 text-center text-xs font-bold text-gray-400">0 records found in current segment.</td></tr>
                ) : items.map((item, i) => (
                  <tr key={i} className={`hover:bg-gray-50 transition-colors group ${selectedItems.includes(item.ProductID) ? 'bg-green-50/30' : ''}`}>
                    <td className="px-6 py-5">
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(item.ProductID)}
                        onChange={() => toggleSelect(item.ProductID)}
                        className="w-4 h-4 accent-[#047857]"
                      />
                    </td>
                    <td className="px-6 py-5 text-xs font-mono font-bold text-gray-400">{item.SKU}</td>
                    <td className="px-6 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.Category || 'GENERAL'}</td>
                    <td className="px-6 py-5 text-xs font-black tracking-tight text-gray-900">{item.ProductName}</td>
                    <td className="px-6 py-5 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-sm font-black ${item.Stock <= item.ReorderLevel ? 'text-red-600' : 'text-gray-900'}`}>
                          {item.Stock}
                        </span>
                        <div className="w-8 h-1 bg-gray-100 mt-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${item.Stock <= item.ReorderLevel ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ width: `${Math.min(100, (item.Stock / (item.ReorderLevel * 2)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(item.Status)}
                    </td>
                    <td className="px-6 py-5 text-xs font-mono font-bold text-gray-600">${parseFloat(item.UnitPrice || 0).toFixed(2)}</td>
                    <td className="px-6 py-5 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleView(item)}
                        title="SPECIFICATION_SHEET"
                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 transition-all rounded-sm"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => openEdit(item)}
                        title="METADATA_UPDATE"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => openAdjustForProduct(item)}
                        title="STOCK_ADJUSTMENT"
                        className="p-2 text-gray-400 hover:text-[#047857] hover:bg-green-50 transition-all rounded-sm"
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.ProductID)}
                        title="ARCHIVE_DEACTIVATE"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 p-6 flex justify-between items-center bg-gray-50/50">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Showing {((page-1)*10)+1}-{Math.min(page*10, totalRecords)} of {totalRecords} records
            </p>
            <div className="flex gap-px bg-gray-200 border border-gray-200">
              <button className="bg-white p-2 text-gray-400 hover:text-black transition-colors disabled:opacity-30" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} />
              </button>
              <div className="flex bg-white px-4 items-center text-[10px] font-black uppercase tracking-widest">
                Page {page} of {Math.ceil(totalRecords / 10)}
              </div>
              <button 
                className="bg-white p-2 text-gray-400 hover:text-black transition-colors disabled:opacity-30" 
                disabled={page >= Math.ceil(totalRecords / 10)} 
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
              <h3 className="text-xl font-bold tracking-tight uppercase">Update Product Details</h3>
              <button onClick={() => setShowEdit(false)} className="p-1 hover:bg-white/20 transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">SKU (Read Only)</label>
                <input type="text" value={editData.sku} readOnly className="w-full bg-gray-50 border border-gray-200 p-3 text-sm font-mono font-bold text-gray-400 cursor-not-allowed" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product Name</label>
                <input 
                  type="text" 
                  value={editData.name} 
                  onChange={e => setEditData({...editData, name: e.target.value})}
                  className="w-full border-b-2 border-gray-200 p-3 text-lg font-bold focus:outline-none focus:border-blue-600" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Unit Cost (USD)</label>
                  <input 
                    type="text" 
                    value={editData.cost} 
                    readOnly
                    className="w-full bg-gray-50 border-b-2 border-gray-100 p-3 text-lg font-mono font-bold text-gray-400 cursor-not-allowed" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Selling Price (USD)</label>
                  <input 
                    type="number" 
                    value={editData.price} 
                    onChange={e => setEditData({...editData, price: e.target.value})}
                    className={`w-full border-b-2 p-3 text-lg font-mono font-bold focus:outline-none transition-colors ${parseFloat(editData.price) < parseFloat(editData.cost) ? 'border-red-500 text-red-600 focus:border-red-600' : 'border-gray-200 focus:border-blue-600'}`} 
                  />
                  {parseFloat(editData.price) < parseFloat(editData.cost) && (
                    <p className="text-[9px] font-bold text-red-500 uppercase mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> Selling below cost
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                <textarea 
                  value={editData.description} 
                  onChange={e => setEditData({...editData, description: e.target.value})}
                  rows="3"
                  className="w-full border border-gray-200 p-3 text-sm font-medium focus:outline-none focus:border-blue-600 resize-none" 
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button onClick={() => setShowEdit(false)} className="flex-1 py-4 border border-gray-300 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={handleEditSubmit} className="flex-[2] py-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Update_SKU_Data</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Adjustment Modal */}
      {showAdjustment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-[#047857] text-white p-6 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold tracking-tight uppercase">Batch_Stock_Sync</h3>
              <button 
                onClick={() => {
                  setShowAdjustment(false);
                  setSelectedItems([]);
                  setAdjustmentData({ productID: '', type: 'ADD', quantity: 1, reason: 'Inventory Count', productName: '' });
                }}
                className="p-1 hover:bg-white/20 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-8">
              {/* Product Selector for Modal */}
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Target Selection ({selectedItems.length} items)</label>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search SKU or Name in current view..."
                      className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-black"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.target.value.toLowerCase().trim();
                          if (!val) return;
                          const found = items.find(i => 
                            (i.SKU?.toLowerCase() === val) || 
                            (i.ProductName?.toLowerCase().includes(val))
                          );
                          if (found) {
                            if (!selectedItems.includes(found.ProductID)) {
                              setSelectedItems([...selectedItems, found.ProductID]);
                              e.target.value = '';
                            }
                          } else {
                            Swal.fire({
                              title: 'Not Found',
                              text: 'Item not in current view. Use main search to filter first.',
                              icon: 'info',
                              toast: true,
                              position: 'top-end',
                              timer: 3000,
                              showConfirmButton: false
                            });
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                {selectedItems.length > 0 && (
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-100 bg-gray-50/50">
                    {selectedItems.map(id => {
                      const item = items.find(i => i.ProductID === id);
                      return (
                        <div key={id} className="bg-white border border-gray-200 px-3 py-1 flex items-center gap-2 group">
                          <span className="text-[10px] font-bold text-gray-700">{item?.ProductName || `ID: ${id}`}</span>
                          <button onClick={() => toggleSelect(id)} className="text-gray-300 hover:text-red-500 group-hover:text-gray-500">
                            <XCircle size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Adjustment Type</label>
                  <div className="flex flex-col gap-2">
                    {['ADD', 'REMOVE', 'SET'].map((t) => (
                      <button 
                        key={t}
                        onClick={() => setAdjustmentData({...adjustmentData, type: t})}
                        className={`w-full py-4 text-[10px] font-black transition-colors uppercase border ${adjustmentData.type === t ? 'bg-[#047857] text-white border-[#047857]' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
                      >
                        {t === 'ADD' ? 'Inventory_Increase' : t === 'REMOVE' ? 'Inventory_Decrease' : 'Reset_To_Value'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Delta Quantity</label>
                    <input 
                      type="number" 
                      value={adjustmentData.quantity}
                      onChange={(e) => setAdjustmentData({...adjustmentData, quantity: Math.max(0, parseInt(e.target.value) || 0)})}
                      className="w-full border-b-2 border-gray-200 p-4 text-3xl font-black focus:outline-none focus:border-black text-center"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Operation Reason</label>
                    <select 
                      value={adjustmentData.reason}
                      onChange={(e) => setAdjustmentData({...adjustmentData, reason: e.target.value})}
                      className="w-full border-b-2 border-gray-200 p-2 text-sm font-bold bg-white focus:outline-none focus:border-black"
                    >
                      <option>Inventory Count</option>
                      <option>Damage</option>
                      <option>Returned Goods</option>
                      <option>Sales Shipment</option>
                      <option>Internal Transfer</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 flex gap-4">
                <button 
                  onClick={() => {
                    setShowAdjustment(false);
                    setSelectedItems([]);
                    setAdjustmentData({ productID: '', type: 'ADD', quantity: 1, reason: 'Inventory Count', productName: '' });
                  }}
                  className="flex-1 py-5 border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all rounded-sm"
                >
                  Discard_Queue
                </button>
                <button 
                  onClick={handleBulkAdjustSubmit}
                  disabled={selectedItems.length === 0 && !adjustmentData.productID}
                  className="flex-[2] py-5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all rounded-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Commit_Sync {selectedItems.length > 0 ? `(${selectedItems.length} Items)` : (adjustmentData.productID ? '(Single)' : '')}
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
