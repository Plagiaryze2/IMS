import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  Plus, 
  Trash2, 
  FileText, 
  Download, 
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [lineItems, setLineItems] = useState([
    { id: 1, name: 'Precision Bearing Assy', sku: 'SKU-BRG-8821', stock: 450, qty: 120, price: 45.50, disc: 0.00 },
    { id: 2, name: 'High-Temp Sealant Tube', sku: 'SKU-SLT-09A', stock: 12, qty: 5, price: 85.00, disc: 10.00 }
  ]);

  const calculateSubtotal = () => lineItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const calculateDiscount = () => lineItems.reduce((acc, item) => acc + (item.qty * item.price * (item.disc / 100)), 0);
  
  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const tax = (subtotal - discount) * 0.08;
  const grandTotal = subtotal - discount + tax;

  const removeLineItem = (id) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Sales Invoice Entry</h1>
        <div className="flex gap-4">
          <button className="border border-gray-300 px-6 py-2 text-[10px] font-black tracking-widest uppercase hover:bg-gray-50 transition-all">
            Save as Quote
          </button>
          <button className="border border-gray-300 px-6 py-2 text-[10px] font-black tracking-widest uppercase hover:bg-gray-50 transition-all flex items-center gap-2">
            <Download size={14} /> Generate PDF Invoice
          </button>
          <button className="bg-[#047857] text-white px-6 py-2 text-[10px] font-black tracking-widest uppercase hover:bg-[#059669] transition-all">
            Post Sale
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side Metadata */}
        <div className="space-y-6 bg-white border border-gray-200 p-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice Number</label>
            <input 
              type="text" 
              value="INV-9901" 
              readOnly 
              className="w-full border-b border-gray-200 py-2 text-sm font-bold bg-gray-50 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</label>
            <div className="relative">
              <input 
                type="text" 
                defaultValue="2023-10-27"
                className="w-full border-b border-gray-200 py-2 text-sm font-bold focus:outline-none focus:border-[#047857]"
              />
              <Calendar size={14} className="absolute right-0 top-2.5 text-gray-400" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Status</label>
            <div className="relative">
              <select className="w-full border-b border-gray-200 py-2 text-sm font-bold bg-white focus:outline-none focus:border-[#047857] appearance-none cursor-pointer">
                <option>Unpaid</option>
                <option>Paid</option>
                <option>Partial</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right Side Customer Info */}
        <div className="space-y-6 bg-white border border-gray-200 p-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Selection</label>
            <div className="relative">
              <select className="w-full border-b border-gray-200 py-2 text-sm font-bold bg-white focus:outline-none focus:border-[#047857] appearance-none cursor-pointer">
                <option>Acme Corp Engineering</option>
                <option>Global Steel & Alloy</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Billing Address</label>
            <div className="w-full bg-gray-50 border border-gray-100 p-4 min-h-[100px] text-xs font-bold text-gray-600 leading-relaxed">
              100 Industrial Parkway<br />
              Building 4, Suite A<br />
              Metropolis, NY 10001<br />
              Attn: Accounts Payable
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
              <th className="px-6 py-4 text-center">Disc %</th>
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
                <td className="px-6 py-5 text-center">
                  <span className={`text-xs font-bold ${item.stock < 20 ? 'text-red-500' : 'text-[#047857]'}`}>{item.stock}</span>
                </td>
                <td className="px-6 py-5 text-center">
                  <input type="number" value={item.qty} className="w-16 border border-gray-100 p-2 text-center text-xs font-bold bg-transparent" />
                </td>
                <td className="px-6 py-5 text-right text-xs font-bold">{item.price.toFixed(2)}</td>
                <td className="px-6 py-5 text-center text-xs font-bold">{item.disc.toFixed(2)}</td>
                <td className="px-6 py-5 text-right text-xs font-black text-gray-900">
                  {(item.qty * item.price * (1 - item.disc/100)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
        <div className="p-4 border-t border-gray-100">
           <button className="text-[10px] font-black text-[#047857] uppercase tracking-widest flex items-center gap-2 hover:underline">
             <Plus size={14} /> Add Line Item
           </button>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="flex justify-end">
        <div className="w-full max-w-md bg-white border border-gray-200">
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              <span>Sub-Total</span>
              <span className="text-gray-900 font-mono text-sm">{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[#047857]">
              <span>Applied Discount</span>
              <span className="font-mono text-sm">-{discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button onClick={() => navigate('/user/sales')} className="px-8 py-4 border border-gray-300 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all">
          Cancel
        </button>
        <button className="px-12 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-3">
          Post Sale & Close
        </button>
      </div>
    </div>
  );
};

export default CreateInvoice;
