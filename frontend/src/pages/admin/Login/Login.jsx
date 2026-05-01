import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { authAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authAPI.login(credentials.username, credentials.password);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="bg-white p-8 border border-gray-300 w-full max-w-md shadow-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[#047857] tracking-widest">ADMIN_PANEL</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-bold">V2.0.4-STABLE — SECURE AUTH</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-300 text-red-700 p-4 mb-6">
            <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
            <p className="text-xs font-mono">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Username</label>
            <input
              type="text"
              required
              autoComplete="username"
              placeholder="admin"
              className="form-input"
              value={credentials.username}
              onChange={e => setCredentials({ ...credentials, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="form-input"
              value={credentials.password}
              onChange={e => setCredentials({ ...credentials, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#047857] text-white text-xs font-black tracking-widest uppercase hover:bg-[#059669] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> AUTHENTICATING...</> : 'SIGN IN'}
          </button>
        </form>

        <p className="text-[10px] text-gray-400 text-center mt-6 font-mono">
          Default: admin / 12345678
        </p>

        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Don't have an account? <Link to="/register" className="text-[#047857] font-bold hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
