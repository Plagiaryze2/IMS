import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Plus, 
  MapPin, 
  Box, 
  Warehouse, 
  Thermometer,
  Search,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

const UserWarehouse = () => {
  const [selectedAisle, setSelectedAisle] = useState('A2');

  const warehouses = [
    { name: 'Main Warehouse', type: 'AMBIENT', occupancy: 82, skus: '12,450', color: '#047857' },
    { name: 'Retail Storefront', type: 'MIXED', occupancy: 95, skus: '3,120', color: '#ef4444' },
    { name: 'Overflow Container', type: 'COLD STORAGE', occupancy: 45, skus: '8,900', color: '#047857' },
  ];

  const aisles = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];

  const aisleProducts = [
    { sku: 'PRD-8821', name: 'Titanium Widget X1', shelf: '12', bin: '04-B', stock: '1,240' },
    { sku: 'PRD-3390', name: 'Carbon Fiber Casing', shelf: '11', bin: '12-A', stock: '450' },
    { sku: 'PRD-1022', name: 'Polymer Gasket Ring', shelf: '13', bin: '01-C', stock: '12' },
  ];

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Warehouse & Location Management</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage inventory distribution across facilities.</p>
        </div>
        <button className="bg-[#047857] text-white px-6 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-[#059669] transition-all">
          <ArrowRightLeft size={14} /> Quick Transfer
        </button>
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {warehouses.map((wh) => (
          <div key={wh.name} className="bg-white border border-gray-200 p-8 space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-black text-gray-900">{wh.name}</h3>
              <span className="text-[8px] font-black px-2 py-0.5 border border-gray-200 text-gray-400 rounded-sm tracking-widest">{wh.type}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Occupancy</span>
                <span>{wh.occupancy}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500" 
                  style={{ width: `${wh.occupancy}%`, backgroundColor: wh.color }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total SKUs</span>
              <span className="text-lg font-black text-gray-900">{wh.skus}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Floorplan & Table Column */}
        <div className="lg:col-span-9 space-y-8">
          {/* Floorplan */}
          <div className="bg-white border border-gray-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Main Warehouse - Floorplan</h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-6 gap-2 h-40">
                {aisles.map((aisle) => (
                  <button
                    key={aisle}
                    onClick={() => setSelectedAisle(aisle)}
                    className={`border-2 flex items-center justify-center text-xs font-black transition-all ${
                      selectedAisle === aisle 
                        ? 'bg-[#047857] border-[#047857] text-white' 
                        : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {aisle}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white border border-gray-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Products in Selected Aisle: {selectedAisle}</h3>
               <span className="text-[9px] font-mono font-bold text-gray-400 uppercase">14 Results</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Shelf</th>
                    <th className="px-6 py-4">Bin</th>
                    <th className="px-6 py-4">Current Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {aisleProducts.map((p) => (
                    <tr key={p.sku} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 text-xs font-bold text-gray-400">{p.sku}</td>
                      <td className="px-6 py-5 text-xs font-black text-gray-900 font-sans">{p.name}</td>
                      <td className="px-6 py-5 text-xs font-bold text-gray-600">{p.shelf}</td>
                      <td className="px-6 py-5 text-xs font-bold text-gray-600">{p.bin}</td>
                      <td className="px-6 py-5 text-xs font-black text-gray-900">
                        <span className={p.stock === '12' ? 'text-red-500' : ''}>{p.stock}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Transfer Sidebar */}
        <div className="lg:col-span-3 bg-[#047857] text-white overflow-hidden flex flex-col shadow-xl">
          <div className="p-6 flex justify-between items-center border-b border-white/10">
            <h3 className="text-xl font-bold uppercase tracking-tight">Quick Transfer</h3>
            <ArrowRightLeft size={18} />
          </div>
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/50">Source Location</label>
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 p-4">
                <MapPin size={14} className="text-white/40" />
                <span className="text-xs font-bold">Main Warehouse / {selectedAisle}</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/50">Destination Location</label>
              <div className="relative">
                <select className="w-full bg-transparent border-b-2 border-white/20 py-2 text-sm font-bold focus:outline-none focus:border-white appearance-none cursor-pointer">
                  <option className="text-black">Select Facility / Bin</option>
                  <option className="text-black">Retail Storefront</option>
                  <option className="text-black">Overflow Container</option>
                </select>
                <ChevronDown size={14} className="absolute right-0 top-3 text-white/40 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/50">Product Search</label>
              <div className="relative border-b-2 border-white/20 pb-2">
                <Search size={14} className="absolute left-0 top-1 text-white/40" />
                <input 
                  type="text" 
                  placeholder="SKU or Name"
                  className="w-full pl-6 bg-transparent text-sm font-bold focus:outline-none placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/50">Quantity</label>
              <input 
                type="number" 
                defaultValue="100"
                className="w-full bg-white/10 border border-white/20 p-4 text-xl font-bold focus:outline-none focus:border-white"
              />
            </div>

            <button className="w-full py-5 bg-white text-[#047857] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all mt-4 flex items-center justify-center gap-2">
              Confirm Transfer <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserWarehouse;
