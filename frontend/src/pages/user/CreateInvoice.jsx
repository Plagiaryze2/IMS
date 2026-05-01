import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  Plus, 
  Trash2, 
  FileText, 
  Download, 
  CheckCircle2,
  Calendar,
  X,
  Search,
  Loader2
} from 'lucide-react';
import { salesAPI, inventoryAPI } from '../../services/api';
import Swal from 'sweetalert2';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerID, setSelectedCustomerID] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const custs = await salesAPI.getCustomers();
        setCustomers(custs);
        if (custs.length > 0) setSelectedCustomerID(custs[0].CustomerID);
      } catch (e) {
        console.error('Failed to init invoice page:', e);
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

  const addProductToInvoice = (p) => {
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
        price: parseFloat(p.UnitPrice || 0),
        disc: 0
      }]);
    }
    setShowProductSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeLineItem = (id) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handlePostSale = async () => {
    if (!selectedCustomerID || lineItems.length === 0) {
      Swal.fire('Error', 'Please select a customer and add at least one item.', 'error');
      return;
    }

    try {
      Swal.fire({ title: 'Processing...', didOpen: () => Swal.showLoading() });
      await salesAPI.createInvoice({
        customerID: selectedCustomerID,
        items: lineItems.map(i => ({ productID: i.productID, qty: i.qty, price: i.price })),
        status: 'Unpaid'
      });
      Swal.fire('Success', 'Invoice created and stock updated.', 'success');
      navigate('/user/sales');
    } catch (e) {
      Swal.fire('Error', e.message, 'error');
    }
  };

  const subtotal = lineItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const discount = lineItems.reduce((acc, item) => acc + (item.qty * item.price * (item.disc / 100)), 0);
  const tax = (subtotal - discount) * 0.08;
  const grandTotal = subtotal - discount + tax;

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#047857]" size={48} /></div>;

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-fade-in relative">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Sales Invoice Entry</h1>
        <div className="flex gap-4">
          <button className="bg-[#047857] text-white px-6 py-2 text-[10px] font-black tracking-widest uppercase hover:bg-[#059669] transition-all" onClick={handlePostSale}>
            Post Sale
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-white border border-gray-200 p-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</label>
            <div className="relative">
              <input type="text" readOnly value={new Date().toISOString().split('T')[0]} className="w-full border-b border-gray-200 py-2 text-sm font-bold focus:outline-none" />
              <Calendar size={14} className="absolute right-0 top-2.5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="space-y-6 bg-white border border-gray-200 p-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Selection</label>
            <div className="relative">
              <select 
                value={selectedCustomerID}
                onChange={(e) => setSelectedCustomerID(e.target.value)}
                className="w-full border-b border-gray-200 py-2 text-sm font-bold bg-white focus:outline-none appearance-none cursor-pointer"
              >
                {customers.map(c => (
                  <option key={c.CustomerID} value={c.CustomerID}>{c.CustomerName}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-0 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Item Table */}
      <div className="bg-white border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50">
              <th className="px-6 py-4 w-1/3">Item Description/SKU</th>
              <th className="px-6 py-4 text-center">Avail. Stock</th>
              <th className="px-6 py-4 text-center">Quantity</th>
              <th className="px-6 py-4 text-right">Price</th>
              <th className="px-6 py-4 text-right">Line Total</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-mono">
            {lineItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 group transition-colors">
                <td className="px-6 py-5">
                  <p className="text-xs font-black text-gray-900 font-sans">{item.name}</p>
                  <p className="text-[9px] text-gray-400 uppercase mt-0.5">{item.sku}</p>
                </td>
                <td className="px-6 py-5 text-center text-xs font-bold text-[#047857]">{item.stock}</td>
                <td className="px-6 py-5 text-center">
                  <input 
                    type="number" 
                    value={item.qty} 
                    onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                    className="w-16 border border-gray-100 p-2 text-center text-xs font-bold bg-transparent" 
                  />
                </td>
                <td className="px-6 py-5 text-right text-xs font-bold">{item.price.toFixed(2)}</td>
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
                   placeholder="Search products..."
                   className="w-full pl-10 pr-4 py-2 text-xs font-bold border-b border-gray-200 focus:outline-none"
                   value={searchQuery}
                   onChange={(e) => searchProducts(e.target.value)}
                 />
               </div>
               <div className="space-y-1 max-h-60 overflow-y-auto">
                 {searchResults.map(p => (
                   <button 
                     key={p.ProductID}
                     onClick={() => addProductToInvoice(p)}
                     className="w-full text-left p-3 hover:bg-gray-50 flex justify-between items-center border-b border-gray-50 last:border-0"
                   >
                     <div>
                       <p className="text-[10px] font-black uppercase">{p.ProductName}</p>
                       <p className="text-[9px] text-gray-400 font-mono">{p.SKU}</p>
                     </div>
                     <span className="text-[10px] font-mono text-[#047857]">Stock: {p.Stock}</span>
                   </button>
                 ))}
                 {searchQuery.length > 1 && searchResults.length === 0 && (
                   <p className="text-[10px] text-center text-gray-400 py-4 uppercase font-black">No results found</p>
                 )}
               </div>
             </div>
           )}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex justify-end pt-12 border-t border-gray-100">
        <div className="w-full max-w-md bg-white border border-gray-200">
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span>Sub-Total</span>
              <span className="text-gray-900 font-mono text-sm">{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span>Sales Tax (8%)</span>
              <span className="text-gray-900 font-mono text-sm">{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="bg-gray-100 p-6 flex justify-between items-center border-t border-gray-200">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900">Grand Total</span>
            <span className="text-xl font-black text-gray-900 font-mono">{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button onClick={() => navigate('/user/sales')} className="px-8 py-4 border border-gray-300 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
          Cancel
        </button>
        <button onClick={handlePostSale} className="px-12 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-3">
          Post Sale & Close
        </button>
      </div>
    </div>
  );
};

export default CreateInvoice;
