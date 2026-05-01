import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  X, 
  ChevronDown,
  Info,
  Loader2,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Printer,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { procurementAPI, inventoryAPI } from '../../services/api';
import Swal from 'sweetalert2';

const UserOrders = () => {
  const navigate = useNavigate();
  const [view, setView] = useState('LIST'); // 'LIST' or 'CREATE'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Create Form State
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierID, setSelectedSupplierID] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [taxRate, setTaxRate] = useState(10);

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await procurementAPI.getOrders();
      setOrders(data);
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const supps = await procurementAPI.getSuppliers();
      setSuppliers(supps);
      if (supps.length > 0) setSelectedSupplierID(supps[0].SupplierID);
    } catch (e) {}
  };

  const handleViewDetails = async (id) => {
    try {
      Swal.fire({ title: 'Loading details...', didOpen: () => Swal.showLoading() });
      const details = await procurementAPI.getOrderDetails(id);
      setSelectedOrder(details);
      Swal.close();
    } catch (e) {
      Swal.fire('Error', 'Could not load order details', 'error');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const actionText = status === 'Received' ? 'Receive Stock' : 'Update Status';
    const confirmText = status === 'Received' 
      ? 'This will update your inventory levels. Proceed?' 
      : `Mark order as ${status}?`;

    const result = await Swal.fire({
      title: actionText,
      text: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#047857',
      confirmButtonText: 'Yes, proceed'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({ title: 'Processing...', didOpen: () => Swal.showLoading() });
        await procurementAPI.updateOrderStatus(id, status);
        Swal.fire('Success', `Order marked as ${status}`, 'success');
        setSelectedOrder(null);
        fetchOrders();
      } catch (e) {
        Swal.fire('Error', e.message, 'error');
      }
    }
  };

  const searchProducts = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const data = await inventoryAPI.getAll({ search: q, limit: 5 });
      setSearchResults(data.items || []);
    } catch (e) {}
  };

  const addProductToOrder = (p) => {
    const existing = lineItems.find(item => item.productID === p.ProductID);
    if (existing) {
      setLineItems(lineItems.map(item => 
        item.productID === p.ProductID ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setLineItems([...lineItems, {
        id: Date.now(),
        productID: p.ProductID,
        name: p.ProductName,
        sku: p.SKU,
        stock: p.Stock,
        qty: 1,
        price: parseFloat(p.UnitPrice || 0) * 0.7
      }]);
    }
    setShowProductSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCreateOrder = async () => {
    if (!selectedSupplierID || lineItems.length === 0) {
      Swal.fire('Error', 'Please select a supplier and add items.', 'error');
      return;
    }

    if (lineItems.some(item => item.qty < 1)) {
      Swal.fire('Error', 'All items must have a quantity of at least 1.', 'error');
      return;
    }

    try {
      Swal.fire({ title: 'Issuing Purchase Order...', didOpen: () => Swal.showLoading() });
      const total = lineItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
      await procurementAPI.createOrder({
        supplierID: selectedSupplierID,
        items: lineItems.map(i => ({ productID: i.productID, qty: i.qty, price: i.price })),
        totalAmount: total + (total * taxRate / 100)
      });
      Swal.fire('Success', 'Purchase Order sent to supplier.', 'success');
      setView('LIST');
      setLineItems([]);
      fetchOrders();
    } catch (e) {
      Swal.fire('Error', e.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    const baseClass = "px-3 py-1 text-[9px] font-black border rounded-sm tracking-tighter uppercase whitespace-nowrap";
    switch (status?.toUpperCase()) {
      case 'RECEIVED':
        return <span className={`${baseClass} text-[#047857] bg-green-50 border-green-200`}>RECEIVED</span>;
      case 'PENDING':
        return <span className={`${baseClass} text-amber-600 bg-amber-50 border-amber-200`}>PENDING</span>;
      case 'CANCELLED':
        return <span className={`${baseClass} text-red-600 bg-red-50 border-red-200`}>CANCELLED</span>;
      default:
        return <span className={`${baseClass} text-gray-400 bg-gray-50 border-gray-200`}>{status}</span>;
    }
  };

  if (loading && view === 'LIST') return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#047857]" size={48} /></div>;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-fade-in font-sans">
      
      {view === 'LIST' ? (
        <>
          {/* List Header */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-8">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Procurement Orders</h1>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Monitor and manage all supplier purchase orders.</p>
            </div>
            <button 
              onClick={() => setView('CREATE')}
              className="bg-[#047857] text-white px-8 py-3 text-[10px] font-black tracking-widest uppercase hover:bg-[#059669] transition-all flex items-center gap-2"
            >
              <Plus size={14} /> New Purchase Order
            </button>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-200">
                  <th className="px-6 py-4">PO ID</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4">Order Date</th>
                  <th className="px-6 py-4">Grand Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-xs">
                {orders.map(o => (
                  <tr key={o.PurchaseOrderID} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 font-black text-[#047857]">#{o.PurchaseOrderID}</td>
                    <td className="px-6 py-5 font-sans font-bold text-gray-900">{o.SupplierName}</td>
                    <td className="px-6 py-5 text-gray-500 font-sans">{new Date(o.OrderDate).toLocaleDateString()}</td>
                    <td className="px-6 py-5 font-black text-gray-900">${parseFloat(o.TotalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-5">{getStatusBadge(o.Status)}</td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleViewDetails(o.PurchaseOrderID)}
                        className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all flex items-center gap-2 ml-auto"
                      >
                        Details <ArrowRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">No purchase orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* Create Header */}
          <div className="flex justify-between items-center border-b border-gray-200 pb-8">
            <div className="flex items-center gap-6">
              <button onClick={() => setView('LIST')} className="p-2 border border-gray-200 hover:bg-gray-50"><ChevronLeft size={16} /></button>
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">New PO Entry</h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configure and issue a new procurement request.</p>
              </div>
            </div>
          </div>

          {/* Entry Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-gray-200 p-8 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Supplier</label>
              <div className="relative">
                <select 
                  value={selectedSupplierID}
                  onChange={(e) => setSelectedSupplierID(e.target.value)}
                  className="w-full border-b-2 border-gray-200 py-3 text-sm font-bold bg-white focus:outline-none focus:border-[#047857] appearance-none cursor-pointer"
                >
                  {suppliers.map(s => (
                    <option key={s.SupplierID} value={s.SupplierID}>{s.SupplierName}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-0 top-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Issue Date</label>
              <div className="border-b-2 border-gray-200 py-3 text-sm font-bold text-gray-500 uppercase tracking-widest bg-gray-50/50 px-4">
                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white border border-gray-200 shadow-sm relative">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/50">
                  <th className="px-6 py-4 w-1/3">Product / SKU</th>
                  <th className="px-6 py-4 text-center">Curr. Stock</th>
                  <th className="px-6 py-4 text-center">Order Qty</th>
                  <th className="px-6 py-4 text-right">Unit Cost</th>
                  <th className="px-6 py-4 text-right">Total</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {lineItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 group transition-colors">
                    <td className="px-6 py-5">
                      <p className="text-xs font-black text-gray-900 font-sans uppercase">{item.name}</p>
                      <p className="text-[9px] text-gray-400 uppercase mt-0.5 tracking-tighter">{item.sku}</p>
                    </td>
                    <td className="px-6 py-5 text-center text-xs text-gray-400">{item.stock}</td>
                    <td className="px-6 py-5 text-center">
                      <input 
                        type="number" 
                        min="1"
                        value={item.qty} 
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          setLineItems(lineItems.map(li => li.id === item.id ? {...li, qty: val} : li));
                        }}
                        className="w-20 border border-gray-200 p-2 text-center text-xs font-bold focus:outline-none focus:border-black"
                      />
                    </td>
                    <td className="px-6 py-5 text-right text-xs font-bold">${item.price.toFixed(2)}</td>
                    <td className="px-6 py-5 text-right text-xs font-black text-gray-900">
                      ${(item.qty * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button onClick={() => setLineItems(lineItems.filter(li => li.id !== item.id))} className="p-1.5 text-gray-300 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {lineItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">No items added to order</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="p-6 border-t border-gray-100 relative">
               <button 
                 onClick={() => setShowProductSearch(!showProductSearch)}
                 className="bg-black text-white px-6 py-2 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all"
               >
                 <Plus size={14} /> Add Line Item
               </button>

               {showProductSearch && (
                 <div className="absolute top-full left-6 w-full max-w-md bg-white border border-gray-200 shadow-2xl z-50 p-4 mt-2 animate-in slide-in-from-top-2 duration-200">
                   <div className="relative mb-4">
                     <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                     <input 
                       type="text"
                       autoFocus
                       placeholder="SEARCH CATALOGUE..."
                       className="w-full pl-10 pr-4 py-2 text-xs font-bold border-b border-gray-200 focus:outline-none uppercase tracking-widest"
                       value={searchQuery}
                       onChange={(e) => searchProducts(e.target.value)}
                     />
                   </div>
                   <div className="space-y-1 max-h-60 overflow-y-auto">
                     {searchResults.map(p => (
                       <button 
                         key={p.ProductID}
                         onClick={() => addProductToOrder(p)}
                         className="w-full text-left p-3 hover:bg-gray-50 flex justify-between items-center border-b border-gray-50 last:border-0"
                       >
                         <div>
                           <p className="text-[10px] font-black uppercase">{p.ProductName}</p>
                           <p className="text-[9px] text-gray-400 font-mono uppercase">{p.SKU}</p>
                         </div>
                         <span className="text-[10px] font-mono text-[#047857] font-black">STOCK: {p.Stock}</span>
                       </button>
                     ))}
                   </div>
                 </div>
               )}
            </div>
          </div>

          {/* Create Actions */}
          <div className="flex justify-end gap-6 pt-8 border-t border-gray-200">
            <div className="flex-1 max-w-xs space-y-2">
               <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                 <span>Subtotal</span>
                 <span className="text-gray-900 font-mono">${lineItems.reduce((acc, i) => acc + (i.qty * i.price), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="flex justify-between text-[10px] font-black text-gray-900 uppercase tracking-widest border-t border-gray-100 pt-2">
                 <span>Grand Total (Inc Tax)</span>
                 <span className="text-lg font-black text-[#047857] font-mono">
                   ${(lineItems.reduce((acc, i) => acc + (i.qty * i.price), 0) * (1 + taxRate/100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                 </span>
               </div>
            </div>
            <div className="flex gap-4 items-end">
              <button 
                onClick={() => setView('LIST')}
                className="px-8 py-4 border border-gray-300 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
              >
                Discard
              </button>
              <button 
                onClick={handleCreateOrder}
                className="px-12 py-4 bg-[#047857] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#059669] transition-all flex items-center gap-3 shadow-lg shadow-green-900/10"
              >
                <Send size={16} /> Issue Purchase Order
              </button>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Order #{selectedOrder.PurchaseOrderID}</h2>
                  {getStatusBadge(selectedOrder.Status)}
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Issued to {selectedOrder.SupplierName} on {new Date(selectedOrder.OrderDate).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 transition-colors"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
               <div className="grid grid-cols-3 gap-8 mb-12">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Supplier Details</p>
                    <p className="text-sm font-bold text-gray-900">{selectedOrder.SupplierName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ordered By</p>
                    <p className="text-sm font-bold text-gray-900">{selectedOrder.OrderedBy}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Valuation</p>
                    <p className="text-sm font-black text-[#047857]">${parseFloat(selectedOrder.TotalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
               </div>

               <div className="border border-gray-200">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-200">
                       <th className="px-6 py-3">Product / SKU</th>
                       <th className="px-6 py-3 text-center">Ordered Qty</th>
                       <th className="px-6 py-3 text-right">Unit Cost</th>
                       <th className="px-6 py-3 text-right">Subtotal</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100 font-mono text-xs">
                     {selectedOrder.items.map(i => (
                       <tr key={i.ProductID}>
                         <td className="px-6 py-4">
                           <p className="font-sans font-bold text-gray-900 uppercase">{i.ProductName}</p>
                           <p className="text-[9px] text-gray-400 uppercase">{i.SKU}</p>
                         </td>
                         <td className="px-6 py-4 text-center font-black">{i.Quantity}</td>
                         <td className="px-6 py-4 text-right">${parseFloat(i.UnitCost).toFixed(2)}</td>
                         <td className="px-6 py-4 text-right font-black text-gray-900">${parseFloat(i.LineTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>

            <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex gap-4">
                 <button className="flex items-center gap-2 px-6 py-3 border border-gray-200 bg-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                   <Printer size={14} /> Print PO
                 </button>
              </div>
              <div className="flex gap-4">
                {selectedOrder.Status === 'Pending' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.PurchaseOrderID, 'Cancelled')}
                      className="px-6 py-3 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                    >
                      Cancel Order
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.PurchaseOrderID, 'Received')}
                      className="px-10 py-3 bg-[#047857] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#059669] transition-all flex items-center gap-2 shadow-lg shadow-green-900/10"
                    >
                      <CheckCircle2 size={14} /> Mark as Received
                    </button>
                  </>
                )}
                {selectedOrder.Status === 'Received' && (
                   <div className="flex items-center gap-2 text-[#047857] font-black text-[10px] uppercase tracking-widest">
                     <CheckCircle2 size={16} /> Stock Integrated into Inventory
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserOrders;
