import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Loader2, KeyRound, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import Swal from 'sweetalert2';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwords.new.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    if (passwords.new !== passwords.confirm) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await authAPI.changePassword(passwords.new);
      
      // Update local user state to reflect that password change is no longer required
      const updatedUser = { ...user, requirePasswordChange: false };
      login(updatedUser, localStorage.getItem('ims_token'));

      await Swal.fire({
        icon: 'success',
        title: 'Password Updated',
        text: 'Your password has been changed successfully. You now have full access to the system.',
        confirmButtonColor: '#047857'
      });

      navigate(user.role === 'Administrator' ? '/dashboard' : '/user/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="bg-white p-8 border border-gray-300 w-full max-w-md shadow-sm">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="text-[#047857]" size={24} />
          </div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Security Verification</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Mandatory Password Update Required</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 mb-6 flex gap-3">
          <ShieldAlert className="text-amber-600 flex-shrink-0" size={18} />
          <p className="text-xs text-amber-800 leading-relaxed">
            Admin has flagged this account for a mandatory password change on first login. Please set a new secure password.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 p-4 mb-6">
            <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
            <p className="text-xs font-mono">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">New Password</label>
            <input
              type="password"
              required
              placeholder="Min. 8 characters"
              className="form-input"
              value={passwords.new}
              onChange={e => setPasswords({ ...passwords, new: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Confirm New Password</label>
            <input
              type="password"
              required
              placeholder="Repeat new password"
              className="form-input"
              value={passwords.confirm}
              onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <CheckCircle2 size={12} className={passwords.new.length >= 8 ? 'text-green-500' : ''} />
              <span>Minimum 8 characters</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <CheckCircle2 size={12} className={passwords.new && passwords.new === passwords.confirm ? 'text-green-500' : ''} />
              <span>Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#047857] text-white text-xs font-black tracking-widest uppercase hover:bg-[#059669] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> UPDATING...</> : 'UPDATE PASSWORD'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
