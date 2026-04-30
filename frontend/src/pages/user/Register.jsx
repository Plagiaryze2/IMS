import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Info, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';
import Swal from 'sweetalert2';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    accountType: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState({
    length: false,
    number: false,
    symbol: false
  });

  useEffect(() => {
    const { password } = formData;
    setValidation({
      length: password.length >= 8,
      number: /[0-9]/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password)
    });
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return Swal.fire({ icon: 'error', title: 'Mismatch', text: 'Passwords do not match.' });
    }
    if (!validation.length || !validation.number || !validation.symbol) {
      return Swal.fire({ icon: 'warning', title: 'Weak Password', text: 'Please meet all password requirements.' });
    }

    setLoading(true);
    try {
      await authAPI.register(formData);
      await Swal.fire({
        icon: 'success',
        title: 'Welcome!',
        text: 'Your account has been created successfully. Please sign in.',
        timer: 3000,
        showConfirmButton: false
      });
      navigate('/login');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Registration Failed', text: err.message });
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

      <div className="max-w-md mx-auto pt-12 pb-24 px-6">
        <div className="bg-white border border-gray-200 p-10 shadow-sm">
          {/* Form Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-sm text-gray-500">Join the IMS network to manage stock and orders.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your full name"
                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#047857] transition-colors"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Work Email</label>
              <input 
                type="email" 
                placeholder="name@company.com"
                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#047857] transition-colors"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Account Type</label>
              <select 
                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#047857] transition-colors bg-white appearance-none cursor-pointer"
                value={formData.accountType}
                onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                required
              >
                <option value="">Select account type</option>
                <option value="manager">Warehouse Manager</option>
                <option value="operator">System Operator</option>
                <option value="analyst">Data Analyst</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#047857] transition-colors"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Confirm Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full border border-gray-300 p-3 text-sm focus:outline-none focus:border-[#047857] transition-colors"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>

            {/* Password Rules */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-1.5">
                {validation.length ? <CheckCircle2 size={14} className="text-[#047857]" /> : <Circle size={14} className="text-gray-300" />}
                <span className={`text-[10px] font-bold ${validation.length ? 'text-[#047857]' : 'text-gray-500'}`}>8+ chars</span>
              </div>
              <div className="flex items-center gap-1.5">
                {validation.number ? <CheckCircle2 size={14} className="text-[#047857]" /> : <Circle size={14} className="text-gray-300" />}
                <span className={`text-[10px] font-bold ${validation.number ? 'text-[#047857]' : 'text-gray-500'}`}>1 number</span>
              </div>
              <div className="flex items-center gap-1.5">
                {validation.symbol ? <CheckCircle2 size={14} className="text-[#047857]" /> : <Circle size={14} className="text-gray-300" />}
                <span className={`text-[10px] font-bold ${validation.symbol ? 'text-[#047857]' : 'text-gray-500'}`}>1 symbol</span>
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#047857] text-white p-4 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-[#059669] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : <>Register Account <ArrowRight size={14} /></>}
            </button>


            {/* Admin Note */}
            <div className="bg-gray-100 border-l-4 border-gray-900 p-4 flex gap-3">
              <Info size={18} className="text-gray-900 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-600 leading-relaxed italic">
                Note: Admin accounts cannot be created here. Please contact the system architect for administrative credentials.
              </p>
            </div>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              Already have an account? <Link to="/login" className="text-[#047857] font-bold hover:underline">Sign In</Link>
            </p>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Register;
