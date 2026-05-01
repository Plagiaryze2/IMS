import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  X, 
  ExternalLink,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Truck,
  Loader2,
  Edit2,
  Trash2,
  MapPin,
  Save,
  CheckCircle2
} from 'lucide-react';
import { procurementAPI } from '../../services/api';
import Swal from 'sweetalert2';

const UserSuppliers = () => {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await procurementAPI.getSuppliers();
      setSuppliers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setIsEditing(true);
      setFormData({
        id: supplier.SupplierID,
        name: supplier.SupplierName,
        contact: supplier.ContactName,
        phone: supplier.Phone,
        email: supplier.Email || '',
        address: supplier.Address || ''
      });
    } else {
      setIsEditing(false);
      setFormData({
        id: null,
        name: '',
        contact: '',
        phone: '',
        email: '',
        address: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      Swal.fire({ title: 'Saving...', didOpen: () => Swal.showLoading() });
      if (isEditing) {
        await procurementAPI.updateSupplier(formData.id, formData);
        Swal.fire('Updated', 'Supplier details updated.', 'success');
      } else {
        await procurementAPI.createSupplier(formData);
        Swal.fire('Created', 'New supplier added.', 'success');
      }
      setShowModal(false);
      fetchSuppliers();
    } catch (e) {
      Swal.fire('Error', e.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Supplier?',
      text: 'This action cannot be undone if no orders exist.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Yes, delete'
    });

    if (result.isConfirmed) {
      try {
        await procurementAPI.deleteSupplier(id);
        Swal.fire('Deleted', 'Supplier removed.', 'success');
        fetchSuppliers();
      } catch (e) {
        Swal.fire('Error', e.message, 'error');
      }
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.SupplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.ContactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.Email && s.Email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#047857]" size={48} /></div>;

  return (
    <div className="flex h-full bg-[#fafafa] font-sans">
      {/* Main Content Area */}
      <div className={`flex-1 p-8 transition-all duration-300 ${selectedVendor ? 'mr-[400px]' : ''}`}>
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Vendor Directory</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage global supply chain partnerships.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#047857] text-white px-8 py-3 text-[10px] font-black tracking-widest uppercase flex items-center gap-2 hover:bg-[#059669] transition-all shadow-lg shadow-green-900/10"
          >
            <Plus size={14} /> Add New Supplier
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME, CONTACT OR EMAIL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 text-xs font-bold focus:outline-none focus:border-black uppercase tracking-widest"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50/50">
                  <th className="px-6 py-4">Vendor Info</th>
                  <th className="px-6 py-4">Primary Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSuppliers.map((s) => (
                  <tr 
                    key={s.SupplierID} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer group ${selectedVendor?.SupplierID === s.SupplierID ? 'bg-gray-50' : ''}`}
                    onClick={() => setSelectedVendor(s)}
                  >
                    <td className="px-6 py-5 text-sm font-bold text-gray-900 uppercase tracking-tighter">
                      {s.SupplierName}
                      <p className="text-[10px] font-mono text-gray-400 font-normal uppercase tracking-normal mt-0.5">{s.Email || 'No Email'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-black text-gray-700 uppercase">{s.ContactName}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{s.Phone}</p>
                    </td>
                    <td className="px-6 py-5">
                       <span className="px-2 py-1 text-[9px] font-black border rounded-sm tracking-tighter uppercase text-[#047857] bg-green-50 border-green-200">ACTIVE</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleOpenModal(s); }}
                           className="p-1.5 text-gray-400 hover:text-black transition-colors"
                         >
                           <Edit2 size={14} />
                         </button>
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleDelete(s.SupplierID); }}
                           className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                         >
                           <Trash2 size={14} />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Sidebar */}
      {selectedVendor && (
        <div className="fixed right-0 top-20 bottom-0 w-[400px] bg-white border-l border-gray-200 p-8 overflow-y-auto animate-in slide-in-from-right duration-300 z-40 shadow-2xl">
          <div className="flex justify-between items-start mb-10">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none">Vendor Profile</h2>
            <button onClick={() => setSelectedVendor(null)} className="text-gray-400 hover:text-black"><X size={20} /></button>
          </div>

          <div className="space-y-10">
            <div>
              <div className="w-16 h-16 bg-gray-50 border border-gray-200 flex items-center justify-center text-2xl font-black text-gray-400 mb-4 uppercase">
                {selectedVendor.SupplierName.charAt(0)}
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">{selectedVendor.SupplierName}</h3>
              <p className="text-[10px] font-black text-[#047857] uppercase tracking-widest mt-1">Contracted Supplier</p>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-10 border-t border-gray-100">
              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-gray-50 border border-gray-200 text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-bold text-gray-900">{selectedVendor.Email || 'NOT SET'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-gray-50 border border-gray-200 text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Phone Line</p>
                  <p className="text-sm font-bold text-gray-900">{selectedVendor.Phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group">
                <div className="p-3 bg-gray-50 border border-gray-200 text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">HQ Address</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{selectedVendor.Address || 'GLOBAL DISTRIBUTION HUB'}</p>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-gray-100">
               <button className="w-full py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-3">
                 <ExternalLink size={14} /> View Order History
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                {isEditing ? 'Update Vendor' : 'New Supplier'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-200 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Supplier Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold focus:outline-none focus:border-[#047857]"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold focus:outline-none focus:border-[#047857]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <input 
                    required
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold focus:outline-none focus:border-[#047857]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold focus:outline-none focus:border-[#047857]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Office Address</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full border-b-2 border-gray-200 py-2 text-sm font-bold focus:outline-none focus:border-[#047857] resize-none h-20"
                ></textarea>
              </div>

              <div className="pt-6 flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-[#047857] text-white px-10 py-3 text-[10px] font-black tracking-widest uppercase hover:bg-[#059669] transition-all flex items-center gap-2"
                >
                  <Save size={14} /> {isEditing ? 'Save Changes' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserSuppliers;
