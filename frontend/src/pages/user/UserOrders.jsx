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
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { procurementAPI, inventoryAPI } from '../../services/api';
import Swal from 'sweetalert2';

const UserOrders = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierID, setSelectedSupplierID] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [taxRate, setTaxRate] = useState(10);

  useEffect(() => {
    const init = async () => {
      try {
        const supps = await procurementAPI.getSuppliers();
        setSuppliers(supps);
        if (supps.length > 0) setSelectedSupplierID(supps[0].SupplierID);
      } catch (e) {
        console.error('Failed to init PO page:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

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
        price: parseFloat(p.UnitPrice || 0) * 0.7 // Assuming purchase cost is 70% of sell price
      }]);
    }
    setShowProductSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeLineItem = (id) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const handleSendToSupplier = async () => {
    if (!selectedSupplierID || lineItems.length === 0) {
      Swal.fire('Error', 'Please select a supplier and add items.', 'error');
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
      navigate('/user/dashboard');
    } catch (e) {
      Swal.fire('Error', e.message, 'error');
    }
  };

  const subtotal = lineItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#047857]" size={48} /></div>;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-fade-in">
      {/* Header Actions */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Purchase Order Entry</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Generate and configure new supplier request.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={handleSendToSupplier} className="bg-[#047857] text-white px-6 py-2 text-[10px] font-black tracking-widest uppercase hover:bg-[#059669] transition-all flex items-center gap-2">
             <Send size={14} /> Send to Supplier
           </button>
        </div>
      </div>

      {/* PO Metadata Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-gray-200 p-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Supplier</label>
          <div className="relative">
            <select 
              value={selectedSupplierID}
              onChange={(e) => setSelectedSupplierID(e.target.value)}
              className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold bg-white focus:outline-none focus:border-[#047857] appearance-none cursor-pointer"
            >
              {suppliers.map(s => (
                <option key={s.SupplierID} value={s.SupplierID}>{s.SupplierName}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-0 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Date</label>
          <input type="text" readOnly value={new Date().toISOString().split('T')[0]} className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold bg-gray-50 focus:outline-none" />
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50">
              <th className="px-6 py-4 w-1/3">Product Name / SKU</th>
              <th className="px-6 py-4 text-center">Curr. Stock</th>
              <th className="px-6 py-4 text-center">Order Qty</th>
              <th className="px-6 py-4 text-right">Unit Cost ($)</th>
              <th className="px-6 py-4 text-right">Total ($)</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono">
            {lineItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 group">
                <td className="px-6 py-5">
                  <p className="text-xs font-black text-gray-900 font-sans">{item.name}</p>
                  <p className="text-[9px] text-gray-400 uppercase mt-0.5">{item.sku}</p>
                </td>
                <td className="px-6 py-5 text-center text-xs text-gray-400">{item.stock}</td>
                <td className="px-6 py-5 text-center">
                  <input 
                    type="number" 
                    value={item.qty} 
                    onChange={(e) => setLineItems(lineItems.map(li => li.id === item.id ? {...li, qty: parseInt(e.target.value) || 0} : li))}
                    className="w-20 border border-gray-200 p-2 text-center text-xs font-bold focus:outline-none focus:border-black"
                  />
                </td>
                <td className="px-6 py-5 text-right text-xs font-bold">${item.price.toFixed(2)}</td>
                <td className="px-6 py-5 text-right text-xs font-black text-gray-900">
                  {(item.qty * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-5 text-right">
                  <button onClick={() => removeLineItem(item.id)} className="p-1.5 text-gray-300 hover:text-red-600 transition-colors">
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 border-t border-gray-100 relative">
           <button 
             onClick={() => setShowProductSearch(!showProductSearch)}
             className="text-[10px] font-black text-[#047857] uppercase tracking-widest flex items-center gap-2 hover:underline"
           >
             <Plus size={14} /> Add Line Item
           </button>

           {showProductSearch && (
             <div className="absolute top-full left-0 w-full max-w-md bg-white border border-gray-200 shadow-2xl z-50 p-4 mt-2">
               <div className="relative mb-4">
                 <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                 <input 
                   type="text"
                   autoFocus
                   placeholder="Search catalogue..."
                   className="w-full pl-10 pr-4 py-2 text-xs font-bold border-b border-gray-200 focus:outline-none"
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
                       <p className="text-[9px] text-gray-400 font-mono">{p.SKU}</p>
                     </div>
                     <span className="text-[10px] font-mono text-[#047857]">Stock: {p.Stock}</span>
                   </button>
                 ))}
               </div>
             </div>
           )}
        </div>
      </div>

      {/* Footer Totals */}
      <div className="flex justify-end">
        <div className="w-full max-w-md bg-white border border-gray-200 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span>Subtotal</span>
              <span className="text-gray-900 font-mono text-sm">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span>Tax ({taxRate}%)</span>
              <span className="text-gray-900 font-mono text-sm">${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="bg-[#047857] p-6 flex justify-between items-center">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Grand Total</span>
            <span className="text-xl font-black text-white font-mono">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-gray-200 pt-8">
        <button onClick={() => navigate('/user/dashboard')} className="px-8 py-4 border border-gray-300 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
          Cancel
        </button>
        <button onClick={handleSendToSupplier} className="px-12 py-4 bg-[#047857] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#059669] transition-all flex items-center gap-3">
          <Send size={16} /> Send to Supplier
        </button>
      </div>
    </div>
  );
};

export default UserOrders;
