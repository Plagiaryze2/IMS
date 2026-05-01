import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  X, 
  ChevronDown,
  Info
} from 'lucide-react';

const UserOrders = () => {
  const [lineItems, setLineItems] = useState([
    { id: 1, name: 'TRX-9000 Control Unit', sku: 'SKU: 900-201-A', currStock: 45, qty: 100, unitCost: 245.50 },
    { id: 2, name: 'Optical Sensor Array v2', sku: 'SKU: 112-004-C', currStock: 12, qty: 50, unitCost: 89.00 }
  ]);

  const [taxRate, setTaxRate] = useState(10);
  
  const calculateSubtotal = () => {
    return lineItems.reduce((acc, item) => acc + (item.qty * item.unitCost), 0);
  };

  const subtotal = calculateSubtotal();
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  const removeLineItem = (id) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-fade-in">
      {/* Header Actions */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Purchase Order Entry</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Generate and configure new supplier request.</p>
          </div>
        </div>
        <div className="flex gap-4">
           <span className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-200 text-[8px] font-black uppercase tracking-widest text-gray-500 rounded-sm">
             <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div> DRAFT
           </span>
           <button className="border border-gray-300 px-6 py-2 text-[10px] font-black tracking-widest uppercase hover:bg-gray-50 transition-all flex items-center gap-2">
             <Save size={14} /> Save as Draft
           </button>
           <button className="bg-[#047857] text-white px-6 py-2 text-[10px] font-black tracking-widest uppercase hover:bg-[#059669] transition-all flex items-center gap-2">
             <Send size={14} /> Send to Supplier
           </button>
        </div>
      </div>

      {/* PO Metadata Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 bg-white border border-gray-200 p-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PO Number (Auto)</label>
          <input 
            type="text" 
            value="#PO-2026-001" 
            readOnly 
            className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold bg-gray-50 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Supplier</label>
          <div className="relative">
            <select className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold bg-white focus:outline-none focus:border-[#047857] appearance-none cursor-pointer">
              <option>Select Supplier...</option>
              <option>ElectroTech Components Ltd.</option>
              <option>Global Steel & Alloy</option>
            </select>
            <ChevronDown size={14} className="absolute right-0 top-3 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Date</label>
          <input 
            type="date" 
            defaultValue="2026-05-14"
            className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold bg-white focus:outline-none focus:border-[#047857]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expected Del.</label>
          <input 
            type="date" 
            placeholder="MM/DD/YYYY"
            className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold bg-white focus:outline-none focus:border-[#047857]"
          />
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
                <td className="px-6 py-5 text-center text-xs text-gray-400">{item.currStock}</td>
                <td className="px-6 py-5 text-center">
                  <input 
                    type="number" 
                    value={item.qty} 
                    className="w-20 border border-gray-200 p-2 text-center text-xs font-bold focus:outline-none focus:border-black"
                  />
                </td>
                <td className="px-6 py-5 text-right">
                  <input 
                    type="text" 
                    value={item.unitCost.toFixed(2)} 
                    className="w-24 border border-gray-200 p-2 text-right text-xs font-bold focus:outline-none focus:border-black"
                  />
                </td>
                <td className="px-6 py-5 text-right text-xs font-black text-gray-900">
                  {(item.qty * item.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-5 text-right">
                  <button 
                    onClick={() => removeLineItem(item.id)}
                    className="p-1.5 text-gray-300 hover:text-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {/* Search Line */}
            <tr className="bg-gray-50/30">
              <td className="px-6 py-4">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-gray-300" />
                  <input 
                    type="text" 
                    placeholder="Search product catalogue..."
                    className="w-full pl-10 pr-4 py-2 bg-transparent border border-gray-200 text-[11px] font-medium focus:outline-none focus:border-black"
                  />
                </div>
              </td>
              <td className="px-6 py-4 text-center text-gray-200">--</td>
              <td className="px-6 py-4 text-center">
                <div className="w-20 border border-gray-100 p-2 text-center text-gray-300 text-xs">0</div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="w-24 border border-gray-100 p-2 text-right text-gray-300 text-xs">0.00</div>
              </td>
              <td className="px-6 py-4 text-right text-gray-200 text-xs">0.00</td>
              <td className="px-6 py-4"></td>
            </tr>
          </tbody>
        </table>
        <div className="p-4 border-t border-gray-100">
           <button className="text-[10px] font-black text-[#047857] uppercase tracking-widest flex items-center gap-2 hover:underline">
             <Plus size={14} /> Add Line Item
           </button>
        </div>
      </div>

      {/* Footer Totals */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-8 space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Terms & Conditions / Notes</label>
          <textarea 
            placeholder="Enter any special instructions for the supplier here..."
            className="w-full h-32 border border-gray-200 p-6 text-xs font-medium focus:outline-none focus:border-black italic"
          ></textarea>
        </div>
        <div className="md:col-span-4 bg-white border border-gray-200 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span>Subtotal</span>
              <span className="text-gray-900 font-mono text-sm">${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span className="flex items-center gap-2">Tax (VAT) <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-12 border border-gray-100 p-1 text-center" /> %</span>
              <span className="text-gray-900 font-mono text-sm">${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          <div className="bg-[#047857] p-6 flex justify-between items-center">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Grand Total</span>
            <span className="text-xl font-black text-white font-mono">${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Final Action Bar */}
      <div className="flex justify-end gap-4 border-t border-gray-200 pt-8">
        <button className="px-8 py-4 border border-gray-300 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
          Cancel
        </button>
        <button className="px-8 py-4 border border-gray-300 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
          Save as Draft
        </button>
        <button className="px-12 py-4 bg-[#047857] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#059669] transition-all flex items-center gap-3">
          <Send size={16} /> Send to Supplier
        </button>
      </div>
    </div>
  );
};

export default UserOrders;
