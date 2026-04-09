import { useState } from 'react';
import { useStore } from '../store';
import logoImg from '../assets/WBM logo.jpeg';
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useStore(state => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- Reset States ---
  const [isResetMode, setIsResetMode] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('auth_token', token);
      login(user);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/reset-password', {
        email: email,
        password: password,
        password_confirmation: confirmPassword
      });
      setSuccess(response.data.message);
      setTimeout(() => {
        setIsResetMode(false);
        setSuccess('');
        setPassword('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-800/10">
        
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl mb-4">
            <img src={logoImg} alt="WBM Logo" className="w-16 rounded-full" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isResetMode ? "Reset Password" : "WBM PROSHOP"}
          </h2>
        </div>

        <form onSubmit={isResetMode ? handleReset : handleSubmit} className="space-y-5">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl">{error}</div>}
          {success && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-bold rounded-xl flex items-center gap-2"><CheckCircle2 size={16}/> {success}</div>}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="email" required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@test.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {isResetMode ? "New Password" : "Password"}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type={showPassword ? "text" : "password"} required
                className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {isResetMode && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                  type="password" required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isResetMode ? "Update Password" : "Sign In")}
          </button>

          <button 
            type="button"
            onClick={() => {
              setIsResetMode(!isResetMode);
              setError('');
              setSuccess('');
            }}
            className="w-full text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            {isResetMode ? <><ArrowLeft size={16}/> Back to Login</> : "Forgot Password?"}
          </button>
        </form>
      </div>
    </div>
  );
}