import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Barcode, 
  RefreshCw, 
  UploadCloud, 
  Save, 
  XCircle,
  Hash,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { inventoryAPI } from '../../services/api';
import Swal from 'sweetalert2';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    description: '',
    sku: 'AUTO-GEN-PENDING',
    barcode: '',
    unitCost: '0.00',
    sellingPrice: '0.00',
    taxRate: '20.0',
    initialQty: '0',
    alertLevel: '10'
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Logic for saving to backend would go here
      // Reusing inventoryAPI.create if available
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate
      await Swal.fire({
        icon: 'success',
        title: 'Product Registered',
        text: 'The new item has been added to the master list.',
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/user/inventory');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Execution Failed', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex items-center gap-6 border-b border-gray-200 pb-8">
        <button 
          onClick={() => navigate('/user/inventory')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-400" />
        </button>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Product Initialization</h1>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* 1. BASIC_INFO */}
          <section className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b border-gray-100 pb-2">1. BASIC_INFO</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Product Name *</label>
                <input 
                  type="text" 
                  placeholder="Enter product designation"
                  className="w-full border-b-2 border-gray-200 p-2 text-xl font-bold focus:outline-none focus:border-[#047857] transition-colors placeholder:text-gray-300"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Category</label>
                  <select 
                    className="w-full border-b-2 border-gray-200 p-2 text-sm font-bold bg-white focus:outline-none focus:border-[#047857] transition-colors"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">SELECT_CLASSIFICATION</option>
                    <option value="electronics">Electronics</option>
                    <option value="hardware">Hardware</option>
                    <option value="consumables">Consumables</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Brand / MFR</label>
                  <input 
                    type="text" 
                    placeholder="Manufacturer name"
                    className="w-full border-b-2 border-gray-200 p-2 text-sm font-bold focus:outline-none focus:border-[#047857] transition-colors placeholder:text-gray-300"
                    value={formData.brand}
                    onChange={e => setFormData({...formData, brand: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Description</label>
                <textarea 
                  rows="4"
                  placeholder="Technical specifications and usage notes..."
                  className="w-full border-2 border-gray-100 p-4 text-sm font-medium bg-gray-50/50 focus:outline-none focus:border-[#047857] transition-colors placeholder:text-gray-300 resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>
          </section>

          {/* 2. IDENTIFIERS */}
          <section className="space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b border-gray-100 pb-2">2. IDENTIFIERS</h2>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">SKU_ID</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    className="flex-1 border-b-2 border-gray-200 p-2 text-sm font-mono font-bold focus:outline-none focus:border-[#047857] transition-colors"
                    value={formData.sku}
                    readOnly
                  />
                  <button type="button" className="bg-gray-100 px-4 py-2 text-[10px] font-black tracking-widest uppercase hover:bg-gray-200 transition-colors">Generate</button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Barcode_EAN</label>
                <div className="flex gap-4 relative">
                  <input 
                    type="text" 
                    placeholder="Scan or enter manually"
                    className="flex-1 border-b-2 border-gray-200 p-2 text-sm font-mono font-bold focus:outline-none focus:border-[#047857] transition-colors placeholder:text-gray-300"
                    value={formData.barcode}
                    onChange={e => setFormData({...formData, barcode: e.target.value})}
                  />
                  <div className="absolute right-0 top-2 p-1 text-gray-400 hover:text-black cursor-pointer transition-colors border border-gray-200">
                    <Barcode size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Dark Camera Preview Area */}
            <div className="w-full aspect-video bg-zinc-900 rounded-sm flex items-center justify-center border border-zinc-800">
               <div className="text-zinc-700 flex flex-col items-center gap-4">
                 <RefreshCw size={48} className="animate-spin-slow" />
                 <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Awaiting Sensor Input...</span>
               </div>
            </div>
          </section>

        </div>

        {/* Right Column - Secondary Settings */}
        <div className="space-y-12">
          
          {/* 3. FINANCIALS */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b border-gray-100 pb-2">3. FINANCIALS</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Unit_Cost (USD)</label>
                <input 
                  type="number" 
                  className="w-full border-b-2 border-gray-200 p-2 text-lg font-mono font-bold focus:outline-none focus:border-[#047857] transition-colors"
                  value={formData.unitCost}
                  onChange={e => setFormData({...formData, unitCost: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Selling_Price (USD)</label>
                <input 
                  type="number" 
                  className="w-full border-b-2 border-gray-200 p-2 text-lg font-mono font-bold focus:outline-none focus:border-[#047857] transition-colors"
                  value={formData.sellingPrice}
                  onChange={e => setFormData({...formData, sellingPrice: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Tax_Rate_PCT</label>
                <input 
                  type="number" 
                  className="w-full border-b-2 border-gray-200 p-2 text-sm font-mono font-bold text-gray-500 focus:outline-none focus:border-[#047857] transition-colors"
                  value={formData.taxRate}
                  onChange={e => setFormData({...formData, taxRate: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* 4. THRESHOLDS */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b border-gray-100 pb-2">4. THRESHOLDS</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Initial_Stock_QTY</label>
                <input 
                  type="number" 
                  className="w-full border-b-2 border-gray-200 p-2 text-lg font-mono font-bold focus:outline-none focus:border-[#047857] transition-colors"
                  value={formData.initialQty}
                  onChange={e => setFormData({...formData, initialQty: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Low_Stock_Alert_Level</label>
                <input 
                  type="number" 
                  className="w-full border-b-2 border-gray-200 p-2 text-sm font-mono font-bold text-red-600 focus:outline-none focus:border-red-600 transition-colors"
                  value={formData.alertLevel}
                  onChange={e => setFormData({...formData, alertLevel: e.target.value})}
                />
              </div>
            </div>
          </section>

          {/* 5. MEDIA */}
          <section className="space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b border-gray-100 pb-2">5. MEDIA</h2>
            
            <div className="w-full p-10 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 hover:border-[#047857] hover:bg-green-50/30 transition-all cursor-pointer">
              <UploadCloud size={32} className="text-gray-300" />
              <div className="text-center">
                <p className="text-[10px] font-black tracking-widest uppercase text-gray-700">Drag_&_Drop_Assets</p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">PNG, JPG, WEBP up to 5MB</p>
              </div>
            </div>
          </section>

        </div>

        {/* Floating Footer Buttons */}
        <div className="fixed bottom-0 right-0 left-72 bg-white border-t border-gray-200 p-6 flex justify-end gap-4 z-50">
          <button 
            type="button"
            onClick={() => navigate('/user/inventory')}
            className="px-10 py-4 border border-gray-300 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
          >
            Cancel_Operation
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-10 py-4 bg-[#047857] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#059669] transition-all flex items-center gap-2"
          >
            {loading ? <><RefreshCw size={14} className="animate-spin" /> Executing...</> : <>Execute_Save <Save size={14} /></>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
