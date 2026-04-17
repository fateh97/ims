import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from './store';
import logoImg from './assets/wbm-logo.jpeg';
import {
  LayoutDashboard, FileText, Package, ClipboardList,
  ShoppingCart, Truck, LogOut, Loader2, User, Bell, Search
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import LogPage from './pages/LogPage';
import ReportsPage from './pages/Reporting';
import InventoryPage from './pages/InventoryPage';
import CustomerInvoice from './pages/CustomerInvoice';
import SupplierEntry from './pages/SupplierEntry';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';

export default function App() {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const [isExiting, setIsExiting] = useState(false);

  if (!user) {
    return <Login />;
  }

  const handleLogout = () => {
    setIsExiting(true);
    setTimeout(() => {
      logout();
    }, 800);
  };

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50 overflow-hidden">

        {/* SIDEBAR */}
        <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col print:hidden shrink-0">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-8 px-2">
              <img
                src={logoImg}
                alt="wbm-logo"
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-400/20"
              />
              <h1 className="text-xl font-bold text-blue-400 uppercase tracking-tight leading-tight">
                WBM PROSHOP
              </h1>
            </div>

            <nav className="space-y-2">
              <Link to="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-blue-400 font-medium">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/inventory" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-blue-400 font-medium">
                <Package size={18} /> Inventory
              </Link>
              <Link to="/customer-sale" className="flex items-center gap-3 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 font-medium">
                <ShoppingCart size={20} /> Customer Sale
              </Link>
              <Link to="/supplier-restock" className="flex items-center gap-3 p-3 rounded-xl text-emerald-400 hover:bg-emerald-500/10 font-medium">
                <Truck size={20} /> Supplier Restock
              </Link>
              <Link to="/logs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-blue-400 font-medium">
                <ClipboardList size={18} /> Inventory Log
              </Link>

              {/* ADMIN ONLY LINKS */}
              {user?.role === 'admin' && (
                <>
                  <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Administration</div>
                  <Link to="/reports" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-blue-400 font-medium">
                    <FileText size={18} /> Reports
                  </Link>
                  <Link to="/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-blue-400 font-medium">
                    <User size={18} /> User Management
                  </Link>
                </>
              )}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            disabled={isExiting}
            className={`flex items-center justify-center gap-3 w-full p-4 rounded-2xl font-bold transition-all duration-500
              ${isExiting
                ? 'bg-red-600 opacity-50 cursor-not-allowed scale-95'
                : 'bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white border border-slate-700 hover:border-red-500'}`}
          >
            {isExiting ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
            <span>{isExiting ? 'Closing...' : 'Logout'}</span>
          </button>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* NAVBAR */}
          <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-30 shrink-0 print:hidden">
            <div>
              <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest">WBM ProShop Inventory Management</h2>
              <p className="text-slate-800 font-black text-xl">
                Hello, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'Manager'}</span>! 👋
              </p>
            </div>

            <div className="flex items-center gap-6">

              <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-800 leading-none">{user?.name}</p>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tight mt-1">{user?.role}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                  <User size={20} />
                </div>
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="flex-1 p-10 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customer-sale" element={<CustomerInvoice />} />
              <Route path="/supplier-restock" element={<SupplierEntry />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/logs" element={<LogPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/users" element={<UserManagement />} />
            </Routes>
          </main>
        </div>

      </div>
    </BrowserRouter>
  );
}