import React, { useState, useEffect } from 'react';
import { TriangleAlert, Check, RefreshCw, Loader2 } from 'lucide-react';
import TopBar from '../../../components/TopBar';
import { usersAPI } from '../../../services/api';
import Swal from 'sweetalert2';

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return `GEN-${Array.from({length:4},()=>chars[Math.floor(Math.random()*chars.length)]).join('')}-${Array.from({length:3},()=>chars[Math.floor(Math.random()*chars.length)]).join('')}`;
};

const CustomCheckbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group" onClick={onChange}>
    <div className={`w-5 h-5 flex items-center justify-center rounded-sm border transition-colors cursor-pointer ${checked ? 'bg-[#047857] border-[#047857]' : 'border-gray-300 group-hover:border-[#047857]'}`}>
      {checked && <Check size={14} className="text-white" strokeWidth={3} />}
    </div>
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

const initialForm = { fullName: '', email: '', role: 'Administrator', password: generatePassword(),
  permissions: { manageUsers: true, accessFinancial: true, databaseBackups: true, modifyGlobal: true },
  requirePasswordChange: true };

const Users = () => {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading]   = useState(false);
  const [roles, setRoles]       = useState([]);
  const [users, setUsers]       = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    usersAPI.getRoles().then(setRoles).catch(() => {});
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try { setUsers(await usersAPI.getAll()); }
    catch { }
    finally { setLoadingUsers(false); }
  };

  const togglePermission = (key) => setFormData(prev => ({
    ...prev, permissions: { ...prev.permissions, [key]: !prev.permissions[key] }
  }));

  const handleCancel = () => {
    Swal.fire({ title: 'Discard Changes?', text: 'All entered data will be lost.', icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#dc2626', cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, discard', cancelButtonText: 'Go back' }).then(r => {
      if (r.isConfirmed) setFormData({ ...initialForm, password: generatePassword() });
    });
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      return Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Full Name is required.', confirmButtonColor: '#047857' });
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      return Swal.fire({ icon: 'error', title: 'Validation Error', text: 'A valid email address is required.', confirmButtonColor: '#047857' });
    }
    const confirm = await Swal.fire({
      title: 'Confirm Account Creation',
      html: `<p style="font-size:14px;color:#374151;margin-bottom:12px;">Creating <strong>${formData.role}</strong> account for:</p>
             <p style="font-size:18px;font-weight:700;color:#111827;">${formData.fullName}</p>
             <p style="font-size:12px;font-family:monospace;color:#6b7280;">${formData.email}</p>
             <div style="margin-top:12px;padding:8px;background:#fef2f2;border:1px solid #fca5a5;font-size:12px;color:#dc2626;">
               ⚠ This will grant elevated system privileges.
             </div>`,
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#047857', cancelButtonColor: '#6b7280', confirmButtonText: 'Create Account'
    });
    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      await usersAPI.create({
        fullName: formData.fullName, email: formData.email,
        role: formData.role, password: formData.password,
        requirePasswordChange: formData.requirePasswordChange,
        permissions: formData.permissions,
      });
      Swal.fire({ icon: 'success', title: 'Account Created!',
        html: `<p>Admin account for <strong>${formData.fullName}</strong> has been created.</p>
               <p style="font-size:12px;font-family:monospace;color:#6b7280;margin-top:8px;">Temp password: <strong>${formData.password}</strong></p>`,
        confirmButtonColor: '#047857' }).then(() => {
        setFormData({ ...initialForm, password: generatePassword() });
        loadUsers();
      });
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.message, confirmButtonColor: '#047857' });
    } finally { setLoading(false); }
  };

  const handleToggleUser = async (user) => {
    const action = user.IsActive ? 'deactivate' : 'activate';
    const confirm = await Swal.fire({ title: `${action.charAt(0).toUpperCase() + action.slice(1)} ${user.FullName}?`,
      icon: 'question', showCancelButton: true, confirmButtonColor: '#047857', cancelButtonColor: '#6b7280',
      confirmButtonText: action.charAt(0).toUpperCase() + action.slice(1) });
    if (confirm.isConfirmed) {
      try { await usersAPI.toggle(user.UserID); loadUsers(); }
      catch (e) { Swal.fire({ icon: 'error', text: e.message }); }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#fafafa] fade-in">
      <TopBar title="Create Administrative Account" />
      <div className="flex-1 overflow-auto p-10">
        <p className="text-gray-500 mb-6">Manually register a new user with elevated system privileges.</p>
        <hr className="border-gray-300 mb-8" />

        <div className="flex gap-8">
          {/* Form */}
          <div className="flex-1 max-w-3xl bg-white border border-gray-300 p-8 shadow-sm">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Personal Info</h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                  <input type="text" placeholder="Enter full name" className="form-input"
                    value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
                  <input type="email" placeholder="operator@system.internal" className="form-input font-mono text-gray-400 placeholder-gray-400"
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-t border-gray-200 pt-8">Role Assignment</h2>
              <div className="max-w-md mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">System Role</label>
                <select className="w-full border-b border-gray-300 py-2 focus:outline-none bg-transparent text-sm appearance-none cursor-pointer"
                  value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundPosition: 'right 0 center', backgroundRepeat: 'no-repeat' }}>
                  {roles.length > 0
                    ? roles.map(r => <option key={r.RoleID} value={r.RoleName}>{r.RoleName}</option>)
                    : ['Administrator','Warehouse Manager','Sales Representative'].map(r => <option key={r}>{r}</option>)
                  }
                </select>
              </div>
              {formData.role === 'Administrator' && (
                <div className="bg-[#fef2f2] border border-[#fca5a5] p-4 flex gap-4">
                  <TriangleAlert className="text-[#dc2626] flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="text-xs font-bold text-[#dc2626] uppercase tracking-wider mb-1">Critical Privilege Warning</h3>
                    <p className="text-sm text-[#dc2626]">Warning: This user will have full access to system logs, financial data, and user controls.</p>
                  </div>
                </div>
              )}
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-t border-gray-200 pt-8">Access Permissions</h2>
              <div className="grid grid-cols-2 gap-y-4">
                <CustomCheckbox label="Manage Users" checked={formData.permissions.manageUsers} onChange={() => togglePermission('manageUsers')} />
                <CustomCheckbox label="Access Financial Reports" checked={formData.permissions.accessFinancial} onChange={() => togglePermission('accessFinancial')} />
                <CustomCheckbox label="Database Backups" checked={formData.permissions.databaseBackups} onChange={() => togglePermission('databaseBackups')} />
                <CustomCheckbox label="Modify Global Settings" checked={formData.permissions.modifyGlobal} onChange={() => togglePermission('modifyGlobal')} />
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-t border-gray-200 pt-8">Authentication</h2>
              <div className="max-w-md mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Initial Password</label>
                <div className="flex items-center gap-3 border-b border-gray-300 py-2">
                  <span className="font-mono text-sm text-gray-600 flex-1">{formData.password}</span>
                  <button onClick={() => setFormData({...formData, password: generatePassword()})} className="text-gray-400 hover:text-gray-700 transition-colors" title="Regenerate">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>
              <CustomCheckbox label="Require password change on first login" checked={formData.requirePasswordChange}
                onChange={() => setFormData({...formData, requirePasswordChange: !formData.requirePasswordChange})} />
            </section>

            <div className="flex justify-end gap-4 border-t border-gray-200 pt-6">
              <button onClick={handleCancel} className="px-6 py-2 border border-gray-300 text-sm font-bold text-gray-700 tracking-wider uppercase hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSubmit} disabled={loading}
                className="px-6 py-2 bg-[#047857] text-white text-sm font-bold tracking-wider uppercase hover:bg-[#059669] transition-colors flex items-center gap-2 disabled:opacity-70">
                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                + Create Admin Account
              </button>
            </div>
          </div>

          {/* Existing Users Panel */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white border border-gray-300 shadow-sm">
              <div className="p-4 border-b border-gray-300 bg-gray-50">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Existing Users ({users.length})</h3>
              </div>
              <div className="overflow-auto max-h-[600px]">
                {loadingUsers ? (
                  <div className="flex justify-center p-8"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
                ) : users.map(u => (
                  <div key={u.UserID} className="p-4 border-b border-gray-200 flex items-start justify-between gap-3 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{u.FullName}</p>
                      <p className="text-[10px] font-mono text-gray-500 truncate">{u.Email}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#047857]">{u.RoleName}</span>
                    </div>
                    <button onClick={() => handleToggleUser(u)} title={u.IsActive ? 'Deactivate' : 'Activate'}
                      className={`flex-shrink-0 w-8 h-5 rounded-full transition-colors ${u.IsActive ? 'bg-[#059669]' : 'bg-gray-300'} relative`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${u.IsActive ? 'translate-x-3' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
