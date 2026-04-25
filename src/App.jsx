import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useStore } from './store';
import logoImg from './assets/wbm-logo.jpeg';
import {
  LayoutDashboard, FileText, Package, ClipboardList, ChevronDown, ChevronRight,
  ShoppingCart, Truck, LogOut, Loader2, User, Tag, Layers
} from 'lucide-react';
import axios from 'axios';

import Dashboard from './pages/Dashboard';
import LogPage from './pages/LogPage';
import ReportsPage from './pages/Reporting';
import InventoryPage from './pages/InventoryPage';
import CustomerInvoice from './pages/CustomerInvoice';
import SupplierEntry from './pages/SupplierEntry';
import BrandsPage from './pages/master/Brands';
import InventoryTypes from './pages/master/InventoryTypes';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';

const token = localStorage.getItem('auth_token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default function App() {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // If token is expired, clear local storage and redirect
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          window.location.href = '/'; // Hard redirect to login
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  if (!user) return <Login />;

  return (
    <BrowserRouter>
      <AppLayout user={user} logout={logout} />
    </BrowserRouter>
  );
}

function AppLayout({ user, logout }) {
  const location = useLocation();
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const role = user?.role?.toLowerCase();

  // Permissions Helper Functions
  const isSuper = role === 'superadmin';
  const isAdmin = role === 'admin' || isSuper;
  const isStaff = role === 'staff' || isSuper;
  const isBoss = role === 'ceo' || isSuper;

  useEffect(() => {
    const isMasterPath = location.pathname === '/brands' || location.pathname === '/inventory-types';
    if (!isMasterPath) setIsInventoryOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setIsExiting(true);
    setTimeout(() => {
      logout();
      setIsExiting(false); 
    }, 800);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col print:hidden shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-8 px-2">
            <img src={logoImg} alt="logo" className="w-10 h-10 rounded-full object-cover border-2 border-blue-400/20" />
            <h1 className="text-xl font-bold text-blue-400 uppercase tracking-tight leading-tight">WBM PROSHOP</h1>
          </div>

          <nav className="space-y-2">
            {/* Dashboard: All roles can see this for overview */}
            <Link to="/" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-blue-400 font-medium">
              <LayoutDashboard size={18} /> Dashboard
            </Link>

            {/* Inventory Management: Super, Admin, Staff */}
            {(isAdmin || isStaff) && (
              <Link to="/inventory" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-blue-400 font-medium">
                <Package size={18} /> Inventory
              </Link>
            )}

            {/* Sales & Restock: Super, Staff */}
            {isStaff && (
              <>
                <Link to="/customer-sale" className="flex items-center gap-3 p-3 rounded-xl text-rose-400 hover:bg-rose-500/10 font-medium">
                  <ShoppingCart size={20} /> Customer Sale
                </Link>
                <Link to="/supplier-restock" className="flex items-center gap-3 p-3 rounded-xl text-emerald-400 hover:bg-emerald-500/10 font-medium">
                  <Truck size={20} /> Supplier Stock
                </Link>
              </>
            )}

            {/* Inventory Log: Super, Admin, Big Boss */}
            {(isAdmin || isBoss) && (
              <Link to="/logs" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-blue-400 font-medium">
                <ClipboardList size={18} /> Inventory Log
              </Link>
            )}

            {/* Reports: Super, Big Boss */}
            {isBoss && (
              <Link to="/reports" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all text-slate-300 hover:text-blue-400 font-medium">
                <FileText size={18} /> Reports
              </Link>
            )}

            {/* Administration & Master Data: Super, Admin */}
            {isAdmin && (
              <>
                <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Master Data</div>
                <div>
                  <button onClick={() => setIsInventoryOpen(!isInventoryOpen)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${isInventoryOpen ? 'bg-slate-800 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                    <div className="flex items-center gap-3"><Package size={18} /><span>Inventory Master</span></div>
                    {isInventoryOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  {isInventoryOpen && (
                    <div className="mt-2 ml-4 pl-4 border-l border-slate-700 space-y-1">
                      <Link to="/brands" className="flex items-center gap-2 p-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"><Tag size={14} /> Brand</Link>
                      <Link to="/inventory-types" className="flex items-center gap-2 p-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"><Layers size={14} /> Types</Link>
                    </div>
                  )}
                </div>
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
          className={`flex items-center justify-center gap-3 w-full p-4 rounded-2xl font-bold transition-all duration-500 ${
              isExiting ? 'bg-red-600 opacity-50' : 'bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white'
            }`}
          >
          {isExiting ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
          <span>{isExiting ? 'Closing...' : 'Logout'}</span>
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between sticky top-0 z-30 shrink-0 print:hidden">
          <div>
            <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest">WBM ProShop</h2>
            <p className="text-slate-800 font-black text-xl italic uppercase">
              {user?.role} <span className="text-blue-600 font-normal ml-2">Panel</span>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800 leading-none">{user?.name}</p>
              <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">Authorized Access</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg"><User size={20} /></div>
          </div>
        </header>

        <main className="flex-1 p-10 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />

            {/* Protected Routes */}
            <Route path="/inventory" element={(isAdmin || isStaff) ? <InventoryPage /> : <Navigate to="/" />} />
            <Route path="/customer-sale" element={isStaff ? <CustomerInvoice /> : <Navigate to="/" />} />
            <Route path="/supplier-restock" element={isStaff ? <SupplierEntry /> : <Navigate to="/" />} />
            <Route path="/logs" element={(isAdmin || isBoss) ? <LogPage /> : <Navigate to="/" />} />
            <Route path="/reports" element={isBoss ? <ReportsPage /> : <Navigate to="/" />} />
            <Route path="/brands" element={isAdmin ? <BrandsPage /> : <Navigate to="/" />} />
            <Route path="/inventory-types" element={isAdmin ? <InventoryTypes /> : <Navigate to="/" />} />
            <Route path="/users" element={isAdmin ? <UserManagement /> : <Navigate to="/" />} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}