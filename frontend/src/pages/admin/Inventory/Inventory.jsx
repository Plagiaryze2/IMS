import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, X, Loader2, Pencil, Trash2 } from 'lucide-react';
import TopBar from '../../../components/TopBar';
import { inventoryAPI } from '../../../services/api';
import Swal from 'sweetalert2';

const LIMIT = 10;

const StatusPill = ({ status }) => {
  if (status === 'OPTIMAL')          return <span className="px-2 py-1 text-[10px] font-bold tracking-wider border border-[#059669] text-[#059669] uppercase">OPTIMAL</span>;
  if (status === 'REORDER_WARNING')  return <span className="px-2 py-1 text-[10px] font-bold tracking-wider border border-[#d97706] text-[#d97706] uppercase">REORDER_WARNING</span>;
  if (status === 'CRITICAL_SHORTAGE') return <span className="px-2 py-1 text-[10px] font-bold tracking-wider border border-[#dc2626] text-[#dc2626] uppercase bg-[#fef2f2]">CRITICAL_SHORTAGE</span>;
  return null;
};

const Inventory = () => {
  const [data, setData]         = useState([]);
  const [total, setTotal]       = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus]     = useState('');
  const [page, setPage]         = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchData = async (p = page) => {
    setLoading(true);
    try {
      const res = await inventoryAPI.getAll({ search, category, status, page: p, limit: LIMIT });
      setData(res.items);
      setTotal(res.total);
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.message, confirmButtonColor: '#047857' });
    } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const cats = await inventoryAPI.getCategories();
      setCategories(cats);
    } catch {}
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchData(1); setPage(1); }, [search, category, status]);
  useEffect(() => { fetchData(page); }, [page]);

  const toggleRow = (id) => setSelectedRows(prev =>
    prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
  );
  const toggleAll = () => {
    const ids = data.map(r => r.ProductID);
    const allSel = ids.every(id => selectedRows.includes(id));
    setSelectedRows(prev => allSel ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  const handleAddSKU = () => {
    const catOptions = categories.map(c => `<option value="${c.CategoryID}">${c.CategoryName}</option>`).join('');
    Swal.fire({
      title: 'Add New SKU',
      width: 600,
      html: `
        <div style="text-align:left;font-family:Inter,sans-serif;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
          <div style="grid-column:1/-1">
            <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;display:block;margin-bottom:4px;">SKU ID *</label>
            <input id="sku" class="swal2-input" placeholder="e.g. EL-9900-X" style="margin:0;width:100%;box-sizing:border-box;">
          </div>
          <div style="grid-column:1/-1">
            <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;display:block;margin-bottom:4px;">Product Name *</label>
            <input id="pname" class="swal2-input" placeholder="Product name" style="margin:0;width:100%;box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;display:block;margin-bottom:4px;">Category</label>
            <select id="catid" class="swal2-input" style="margin:0;width:100%;box-sizing:border-box;">${catOptions}</select>
          </div>
          <div>
            <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;display:block;margin-bottom:4px;">Initial Stock</label>
            <input id="stock" class="swal2-input" type="number" value="0" style="margin:0;width:100%;box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;display:block;margin-bottom:4px;">Unit Price ($) *</label>
            <input id="price" class="swal2-input" type="number" step="0.01" placeholder="0.00" style="margin:0;width:100%;box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;display:block;margin-bottom:4px;">Reorder Level</label>
            <input id="reorder" class="swal2-input" type="number" value="10" style="margin:0;width:100%;box-sizing:border-box;">
          </div>
        </div>`,
      confirmButtonText: '+ Add SKU',
      showCancelButton: true,
      confirmButtonColor: '#047857',
      cancelButtonColor: '#6b7280',
      preConfirm: () => {
        const sku = document.getElementById('sku').value.trim();
        const productName = document.getElementById('pname').value.trim();
        const unitPrice = document.getElementById('price').value;
        if (!sku || !productName || !unitPrice) {
          Swal.showValidationMessage('SKU ID, Product Name and Unit Price are required.');
          return false;
        }
        return {
          sku, productName, unitPrice: parseFloat(unitPrice),
          categoryID: parseInt(document.getElementById('catid').value),
          stock: parseInt(document.getElementById('stock').value) || 0,
          reorderLevel: parseInt(document.getElementById('reorder').value) || 10,
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await inventoryAPI.create(result.value);
          Swal.fire({ icon: 'success', title: 'SKU Added!', text: `${result.value.productName} has been added.`, confirmButtonColor: '#047857', timer: 2000, showConfirmButton: false });
          fetchData(1); setPage(1);
        } catch (e) {
          Swal.fire({ icon: 'error', title: 'Error', text: e.message, confirmButtonColor: '#047857' });
        }
      }
    });
  };

  const handleDelete = async (row) => {
    const confirm = await Swal.fire({
      title: 'Deactivate SKU?',
      text: `${row.ProductName} (${row.SKU}) will be removed from active inventory.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Deactivate'
    });
    if (confirm.isConfirmed) {
      try {
        await inventoryAPI.remove(row.ProductID);
        Swal.fire({ icon: 'success', title: 'Deactivated', timer: 1500, showConfirmButton: false });
        fetchData(page);
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Error', text: e.message, confirmButtonColor: '#047857' });
      }
    }
  };

  const handleRefresh = () => { setSearch(''); setCategory(''); setStatus(''); setPage(1); };

  const statuses = ['', 'OPTIMAL', 'REORDER_WARNING', 'CRITICAL_SHORTAGE'];

  return (
    <div className="flex flex-col h-full bg-white fade-in">
      <TopBar title="Inventory Registry" onRefresh={handleRefresh}>
        <button onClick={handleAddSKU} className="px-4 py-2 bg-[#047857] text-white text-xs font-bold tracking-wider uppercase hover:bg-[#059669] transition-colors flex items-center gap-2">
          + Add New SKU
        </button>
      </TopBar>

      {/* Toolbar */}
      <div className="px-6 pt-4 pb-2 flex items-end justify-between gap-4 flex-shrink-0">
        <div className="w-1/2 max-w-md">
          <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">Search Inventory</label>
          <div className="relative border border-gray-300 flex items-center p-2 focus-within:border-gray-500">
            <Search size={16} className="text-gray-400 mr-2 flex-shrink-0" />
            <input type="text" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="SKU, Name, Category..." className="w-full bg-transparent text-sm focus:outline-none"
            />
            {search && <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-700"><X size={14} /></button>}
          </div>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">Category</label>
            <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}
              className="border border-gray-300 p-2 text-sm focus:outline-none bg-white w-40">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.CategoryID} value={c.CategoryName}>{c.CategoryName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">Status</label>
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="border border-gray-300 p-2 text-sm focus:outline-none bg-white w-44">
              <option value="">All Statuses</option>
              {statuses.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={() => { setSearch(''); setCategory(''); setStatus(''); setPage(1); }}
            title="Clear filters" className="p-2 border border-gray-300 hover:bg-gray-50 h-[38px] w-[38px] flex items-center justify-center">
            <Filter size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-6 flex-1 flex flex-col min-h-0">
        <div className="border border-gray-300 flex-1 flex flex-col">
          <div className="grid grid-cols-[50px_120px_1fr_150px_100px_90px_160px_80px] bg-gray-50 border-b border-gray-300 flex-shrink-0">
            {['', 'SKU_ID', 'Product_Name', 'Category', 'Stock', 'Unit_Price', 'Status', ''].map((h, i) => (
              <div key={i} className={`p-3 ${i < 7 ? 'border-r border-gray-300' : ''} flex items-center ${i === 4 || i === 5 ? 'justify-end' : ''} text-[10px] font-bold text-gray-700 uppercase tracking-wider`}>
                {i === 0 ? <input type="checkbox" className="w-4 h-4 cursor-pointer"
                  checked={data.length > 0 && data.every(r => selectedRows.includes(r.ProductID))}
                  onChange={toggleAll}
                /> : h}
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32"><Loader2 size={24} className="animate-spin text-gray-300" /></div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm font-mono">No results. Try adjusting your filters.</div>
            ) : data.map(row => (
              <div key={row.ProductID}
                className={`grid grid-cols-[50px_120px_1fr_150px_100px_90px_160px_80px] border-b border-gray-200 hover:bg-gray-50 transition-colors ${selectedRows.includes(row.ProductID) ? 'bg-green-50' : ''}`}
              >
                <div className="p-3 border-r border-gray-200 flex items-center justify-center">
                  <input type="checkbox" className="w-4 h-4 cursor-pointer"
                    checked={selectedRows.includes(row.ProductID)} onChange={() => toggleRow(row.ProductID)} />
                </div>
                <div className="p-3 border-r border-gray-200 flex items-center text-sm font-mono text-gray-600">{row.SKU}</div>
                <div className="p-3 border-r border-gray-200 flex items-center text-sm font-bold text-gray-800">{row.ProductName}</div>
                <div className="p-3 border-r border-gray-200 flex items-center text-sm text-gray-600">{row.Category}</div>
                <div className={`p-3 border-r border-gray-200 flex items-center justify-end text-sm font-mono ${row.Stock === 0 ? 'text-[#dc2626] font-bold' : 'text-gray-800'}`}>
                  {row.Stock?.toLocaleString()}
                </div>
                <div className="p-3 border-r border-gray-200 flex items-center justify-end text-sm font-mono text-gray-800">
                  ${parseFloat(row.UnitPrice).toFixed(2)}
                </div>
                <div className="p-3 border-r border-gray-200 flex items-center">
                  <StatusPill status={row.Status} />
                </div>
                <div className="p-3 flex items-center justify-center">
                  <button onClick={() => handleDelete(row)} title="Deactivate SKU" className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-300 p-3 bg-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-gray-500">
                Showing {total === 0 ? 0 : (page-1)*LIMIT+1}–{Math.min(page*LIMIT, total)} of {total}
              </span>
              {selectedRows.length > 0 && <span className="text-xs font-mono text-[#047857]">{selectedRows.length} selected</span>}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-50 disabled:opacity-40">
                <ChevronLeft size={16} />
              </button>
              {Array.from({length: Math.min(totalPages, 5)}, (_, i) => i+1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center border font-bold ${p===page ? 'border-[#059669] bg-[#ecfdf5] text-[#059669]' : 'border-gray-300 hover:bg-gray-50 text-gray-600'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-50 disabled:opacity-40">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
