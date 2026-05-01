import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  MapPin, 
  Box, 
  Search,
  ChevronDown,
  Loader2,
  Package,
  Layers
} from 'lucide-react';
import { warehouseAPI, inventoryAPI } from '../../services/api';
import Swal from 'sweetalert2';

const UserWarehouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [aisles, setAisles] = useState([]);
  const [selectedAisle, setSelectedAisle] = useState('');
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Fetch initial warehouse data
  useEffect(() => {
    const init = async () => {
      try {
        const whData = await warehouseAPI.getWarehouses();
        setWarehouses(whData);
        if (whData.length > 0) {
          setSelectedWarehouseId(whData[0].WarehouseID);
        }
      } catch (e) {
        console.error('Failed to load warehouses:', e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Fetch inventory when warehouse or aisle changes
  useEffect(() => {
    if (!selectedWarehouseId) return;

    const fetchInventory = async () => {
      setLoading(true);
      try {
        const data = await warehouseAPI.getInventory({ 
          warehouseId: selectedWarehouseId,
          aisle: selectedAisle === 'ALL' ? '' : selectedAisle
        });
        setInventory(data);
        
        // Dynamically extract unique aisles if no aisle is selected
        if (!selectedAisle || selectedAisle === 'ALL') {
          const uniqueAisles = [...new Set(data.map(item => item.Aisle).filter(Boolean))].sort();
          setAisles(['ALL', ...uniqueAisles]);
          if (!selectedAisle) setSelectedAisle('ALL');
        }
      } catch (e) {
        console.error('Failed to fetch inventory:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, [selectedWarehouseId, selectedAisle]);

  // Handle Quick Transfer using SweetAlert2
  const handleTransfer = async () => {
    const warehouseOptions = warehouses.map(w => `<option value="${w.WarehouseID}">${w.WarehouseName} (${w.Location})</option>`).join('');

    const { value: formValues } = await Swal.fire({
      title: '<h2 class="text-2xl font-black uppercase italic tracking-tighter">Initiate Transfer</h2>',
      html: `
        <div class="space-y-4 text-left p-2 font-sans">
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Product SKU</label>
            <input id="swal-sku" class="w-full border-2 border-gray-200 p-3 text-sm font-bold uppercase focus:border-black transition-all outline-none" placeholder="e.g. SKU-1001">
          </div>
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Source Warehouse</label>
            <select id="swal-source" class="w-full border-2 border-gray-200 p-3 text-sm font-bold uppercase focus:border-black transition-all outline-none">
              ${warehouseOptions}
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Destination Warehouse</label>
            <select id="swal-dest" class="w-full border-2 border-gray-200 p-3 text-sm font-bold uppercase focus:border-black transition-all outline-none">
              ${warehouseOptions}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Transfer Quantity</label>
              <input id="swal-qty" type="number" min="1" class="w-full border-2 border-gray-200 p-3 text-sm font-bold focus:border-black transition-all outline-none" placeholder="Units">
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Destination Aisle</label>
              <input id="swal-aisle" class="w-full border-2 border-gray-200 p-3 text-sm font-bold uppercase focus:border-black transition-all outline-none" placeholder="e.g. A1">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Shelf</label>
              <input id="swal-shelf" class="w-full border-2 border-gray-200 p-3 text-sm font-bold uppercase focus:border-black transition-all outline-none" placeholder="e.g. S1">
            </div>
            <div>
              <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Bin</label>
              <input id="swal-bin" class="w-full border-2 border-gray-200 p-3 text-sm font-bold uppercase focus:border-black transition-all outline-none" placeholder="e.g. B3">
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'EXECUTE TRANSFER',
      cancelButtonText: 'CANCEL',
      customClass: {
        confirmButton: 'bg-black text-white px-6 py-3 font-black text-[10px] tracking-widest uppercase rounded-none hover:bg-gray-800',
        cancelButton: 'bg-gray-200 text-black px-6 py-3 font-black text-[10px] tracking-widest uppercase rounded-none hover:bg-gray-300'
      },
      preConfirm: async () => {
        const sku = document.getElementById('swal-sku').value;
        const sourceWarehouseId = document.getElementById('swal-source').value;
        const destWarehouseId = document.getElementById('swal-dest').value;
        const qty = parseInt(document.getElementById('swal-qty').value);
        const destAisle = document.getElementById('swal-aisle').value.trim().toUpperCase() || 'TBD';
        const destShelf = document.getElementById('swal-shelf').value.trim().toUpperCase() || null;
        const destBin = document.getElementById('swal-bin').value.trim().toUpperCase() || null;

        if (!sku || !sourceWarehouseId || !destWarehouseId || isNaN(qty) || qty <= 0) {
          Swal.showValidationMessage('Please fill all fields correctly');
          return false;
        }

        if (sourceWarehouseId === destWarehouseId) {
          Swal.showValidationMessage('Source and destination cannot be the same');
          return false;
        }

        // We need the productId for the backend. We'll fetch it by SKU.
        try {
          Swal.showLoading();
          const searchData = await inventoryAPI.getAll({ search: sku });
          const product = searchData.items.find(p => p.SKU.toUpperCase() === sku.toUpperCase());
          
          if (!product) {
            Swal.showValidationMessage('Product SKU not found');
            return false;
          }

          return { productId: product.ProductID, sourceWarehouseId, destWarehouseId, qty, destAisle, destShelf, destBin };
        } catch (e) {
          Swal.showValidationMessage('Error validating SKU');
          return false;
        }
      }
    });

    if (formValues) {
      try {
        Swal.fire({ title: 'Processing Transfer...', didOpen: () => Swal.showLoading() });
        await warehouseAPI.transfer(formValues);
        
        // Refresh data
        const [newWhData, newInvData] = await Promise.all([
          warehouseAPI.getWarehouses(),
          warehouseAPI.getInventory({ warehouseId: selectedWarehouseId, aisle: selectedAisle === 'ALL' ? '' : selectedAisle })
        ]);
        setWarehouses(newWhData);
        setInventory(newInvData);

        Swal.fire({
          icon: 'success',
          title: 'Transfer Complete',
          text: `Successfully moved ${formValues.qty} units.`,
          confirmButtonColor: '#047857'
        });
      } catch (e) {
        Swal.fire('Transfer Failed', e.message, 'error');
      }
    }
  };

  const getOccupancyColor = (percentage) => {
    if (percentage > 90) return '#ef4444'; // Red
    if (percentage > 75) return '#f59e0b'; // Amber
    return '#047857'; // Green
  };

  const filteredInventory = inventory.filter(item => 
    item.ProductName.toLowerCase().includes(search.toLowerCase()) || 
    item.SKU.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && warehouses.length === 0) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#047857]" size={48} /></div>;

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in bg-[#fafafa]">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic">Logistics Hub</h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage physical inventory distribution and site capacity.</p>
        </div>
        <button 
          onClick={handleTransfer}
          className="bg-black text-white px-8 py-3 text-[10px] font-black tracking-widest uppercase hover:bg-gray-800 transition-all flex items-center gap-2 shadow-2xl"
        >
          <ArrowRightLeft size={14} /> Quick Transfer
        </button>
      </div>

      {/* Warehouse Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {warehouses.map((wh) => {
          // Dummy calculation for occupancy since we don't have max capacity
          const estimatedMax = 10000; 
          const rawOccupancy = Math.min(((wh.totalOccupancy || 0) / estimatedMax) * 100, 100);
          const occupancy = parseInt(rawOccupancy);
          
          return (
            <div 
              key={wh.WarehouseID} 
              onClick={() => { setSelectedWarehouseId(wh.WarehouseID); setSelectedAisle('ALL'); }}
              className={`bg-white border-2 p-6 cursor-pointer transition-all ${selectedWarehouseId === wh.WarehouseID ? 'border-black shadow-lg scale-[1.02]' : 'border-gray-200 hover:border-gray-300 shadow-sm'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none mb-1">{wh.WarehouseName}</h3>
                  <div className="flex items-center gap-1 text-[9px] font-black uppercase text-gray-400 tracking-widest">
                    <MapPin size={10} /> {wh.Location}
                  </div>
                </div>
                <div className="p-2 bg-gray-50 text-gray-900">
                  <Box size={16} />
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>Capacity</span>
                  <span style={{color: getOccupancyColor(occupancy)}}>{occupancy}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000" 
                    style={{ width: `${occupancy}%`, backgroundColor: getOccupancyColor(occupancy) }}
                  ></div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active SKUs</span>
                <span className="text-xl font-black text-gray-900">{wh.totalSkus || 0}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-gray-200 shadow-sm">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/50">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <Layers size={18} className="text-gray-400" />
                 <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Location Matrix</h2>
              </div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Aisle:</label>
                 <select 
                   value={selectedAisle}
                   onChange={(e) => setSelectedAisle(e.target.value)}
                   className="bg-transparent text-sm font-bold uppercase focus:outline-none cursor-pointer"
                 >
                   {aisles.map(a => <option key={a} value={a}>{a}</option>)}
                 </select>
              </div>
           </div>

           <div className="relative w-full md:w-64 border-b-2 border-gray-200 pb-2">
             <Search size={14} className="absolute left-0 top-1 text-gray-400" />
             <input 
               type="text" 
               placeholder="SEARCH SKU OR PRODUCT..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-6 text-[11px] font-bold bg-transparent focus:outline-none placeholder:text-gray-300 uppercase tracking-widest"
             />
           </div>
        </div>

        {/* Inventory Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-gray-300" size={32} />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-[9px] font-black uppercase tracking-widest text-gray-400 bg-white">
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Aisle</th>
                  <th className="px-6 py-4">Shelf / Bin</th>
                  <th className="px-6 py-4 text-right">Physical Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono text-xs">
                {filteredInventory.map((item, idx) => (
                  <tr key={`${item.ProductID}-${idx}`} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                       <p className="font-sans font-black text-gray-900 uppercase">{item.ProductName}</p>
                       <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.SKU}</p>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900">
                       <span className="bg-gray-100 px-2 py-1 rounded-sm">{item.Aisle || 'UNASSIGNED'}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-500">
                       {item.Shelf || '-'}/{item.Bin || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-lg font-black text-gray-900">{item.QuantityOnHand}</span>
                    </td>
                  </tr>
                ))}
                {filteredInventory.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-20 text-center">
                       <Package size={32} className="mx-auto text-gray-200 mb-3" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">No inventory found in this location</p>
                    </td>
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

export default UserWarehouse;
