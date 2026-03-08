import { useState } from 'react';
import { useStore } from '../store';
import {Lock, Mail, Eye, EyeOff, ShieldCheck} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const login = useStore(state => state.login);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'admin@test.com' && password === 'password123') {
      login({ email, role: 'admin' });
    } else {
      alert('Invalid credentials. Use admin@test.com and password123');  
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-800/10">
        
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-2xl mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome to IMS</h2>
          <p className="text-slate-500 mt-2">Inventory Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type="email" 
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="admin@test.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-8">
          Protected by IMS Security Standards 2026
        </p>
      </div>
    </div>
  );
}