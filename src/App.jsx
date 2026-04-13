import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react'; 
import { useStore } from './store'; 
import logoImg from './assets/WBM logo.jpeg';
import { LayoutDashboard, FileText, Package, ClipboardList,ShoppingCart, Truck, LogOut, Loader2 } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import LogPage from './pages/LogPage';
import ReportsPage from './pages/Reporting';
import InventoryPage from './pages/InventoryPage';
import CustomerInvoice from './pages/CustomerInvoice';
import SupplierEntry from './pages/SupplierEntry';
import Login from './pages/Login';

export default function App() {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout); 
  const [isExiting, setIsExiting] = useState(false); 

  if(!user) {
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
      <div className="flex h-screen bg-slate-50">
        
        <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col print:hidden">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-8 px-2">
              <img 
                src={logoImg} 
                alt="WBM Logo" 
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
              <Link to="/customer-sale" className="flex items-center gap-3 p-3 rounded-xl text-rose-600 hover:bg-rose-50">
                <ShoppingCart size={20} /> Customer Sale
              </Link>

              <Link to="/supplier-restock" className="flex items-center gap-3 p-3 rounded-xl text-emerald-600 hover:bg-emerald-50">
                <Truck size={20} /> Supplier Restock
              </Link>
              <Link to="/logs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-blue-400 font-medium">
                <ClipboardList size={18} /> Inventory Log
              </Link>
              <Link to="/reports" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-blue-400 font-medium">
                <FileText size={18} /> Reports
              </Link>
            </nav>
          </div>

          {/* THE LOGOUT BUTTON (At the bottom) */}
          <button 
            onClick={handleLogout}
            disabled={isExiting}
            className={`flex items-center justify-center gap-3 w-full p-4 rounded-2xl font-bold transition-all duration-500
              ${isExiting 
                ? 'bg-red-600 opacity-50 cursor-not-allowed scale-95' 
                : 'bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white border border-slate-700 hover:border-red-500'}`}
          >
            {isExiting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <LogOut size={20} />
            )}
            <span>{isExiting ? 'Closing...' : 'Logout'}</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-10 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customer-sale" element={<CustomerInvoice />} />
            <Route path="/supplier-restock" element={<SupplierEntry />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/logs" element={<LogPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}