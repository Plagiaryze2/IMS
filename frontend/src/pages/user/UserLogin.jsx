import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

const UserLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // In our backend, username can be email
      const data = await authAPI.login(credentials.email, credentials.password);

      // Check role - if admin, reject
      if (data.user.role === 'Administrator') {
        throw new Error('Access Denied: Administrators must log in through the Admin Portal.');
      }

      login(data.user, data.token);

      Swal.fire({
        icon: 'success',
        title: 'Access Granted',
        text: `Welcome back, ${data.user.fullName || data.user.username}.`,
        timer: 2000,
        showConfirmButton: false
      });
      navigate('/user/dashboard');

    } catch (err) {
      setError(err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-gray-900">
      {/* Header Label */}
      <div className="p-8 flex items-center justify-between">
        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400">System Overview</span>
      </div>

      {/* Go Back */}
      <div className="px-8 -mt-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={12} /> Go Back
        </button>
      </div>

      <div className="max-w-md mx-auto pt-24 pb-24 px-6">
        <div className="bg-white border border-gray-200 p-10 shadow-sm">
          {/* Form Header */}
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
            <p className="text-sm text-gray-500">Access the IMS network to manage your workspace.</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 p-4 mb-8">
              <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
              <p className="text-xs font-mono">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Work Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#047857] transition-colors"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700">Password</label>
                <button type="button" className="text-[10px] font-bold text-[#047857] hover:underline uppercase tracking-widest">Forgot?</button>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#047857] transition-colors"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#047857] text-white p-4 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#059669] transition-all disabled:opacity-70"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Verifying...</> : <>Sign In <ArrowRight size={14} /></>}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-12 pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Don't have an account? <Link to="/register" className="text-[#047857] font-bold hover:underline">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
