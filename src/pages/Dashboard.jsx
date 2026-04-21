import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Package, AlertCircle, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownLeft, Loader2, FileText } from 'lucide-react';
import axios from 'axios';

export default function Dashboard() {
  const { inventory, fetchInventory } = useStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        await fetchInventory();
        const logRes = await axios.get('http://127.0.0.1:8000/api/logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(logRes.data);
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [fetchInventory]);

  // 1. Identify Low Stock Items
  const lowStockItems = inventory.filter(item => item.stock <= 10);

  const totalRevenue = logs
    .filter(log => log.type === 'OUT')
    .reduce((acc, log) => {
      const price = log.product ? Number(log.product.price) : 0;
      return acc + (price * log.qty);
    }, 0);

  if (loading) return (
    <div className="flex h-screen items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mr-2" /> Synchronizing...
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Overview</h2>
          <p className="text-slate-500 text-sm">Real-time performance and analytics.</p>
        </div>
      </div>

      {/* 2. BLINKING LOW STOCK ALERTS */}
      {lowStockItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-wider">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
            </span>
            Critical Stock Alerts ({lowStockItems.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map(item => (
              <div key={item.id} className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-600 text-white p-2 rounded-lg">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-rose-900 text-sm">{item.name}</p>
                    <p className="text-rose-600 text-xs">Only {item.stock} left in WBM ProShop</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Products" val={inventory.length} icon={<Package />} color="bg-blue-500" />
        <StatCard label="Low Stock" val={lowStockItems.length} icon={<AlertCircle />} color="bg-red-500" />
        <StatCard label="Total Sales" val={logs.filter(l => l.type === 'OUT').length} icon={<ShoppingCart />} color="bg-amber-500" />
        <StatCard
          label="Total Revenue"
          val={`RM${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<DollarSign />}
          color="bg-emerald-500"
        />
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Recent Transactions</h3>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">Latest 5</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs && logs.length > 0 ? (logs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{log.product?.name || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${log.type === 'IN' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                      }`}>
                      {log.type === 'IN' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                      {log.type === 'IN' ? 'IN' : 'OUT'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {log.type === 'IN' ? `+${log.qty}` : `-${log.qty}`}
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <FileText size={48} className="text-slate-300" />
                      <p className="text-slate-500 font-medium">No activity logs found yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, val, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5">
      <div className={`${color} p-4 rounded-2xl text-white shadow-lg`}>{icon}</div>
      <div>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-none">{val}</p>
      </div>
    </div>
  );
}