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
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Overview</h2>
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
            Critical Inventory Alerts ({lowStockItems.length})
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

      {/* Inventory Summarization */}
      <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Inventory Summary</h3>
          <div className="flex gap-2">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase">
              <Package size={12} /> Total {inventory.length}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto h-[400px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-md">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Product & Brand</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Stock Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 transition-colors">{item.name}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.brand?.name || 'Generic'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg uppercase">
                      {item.inventory_type?.name || item.inventory_types?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-black ${item.stock <= 10 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {item.stock}
                      </span>
                      <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.stock <= 10 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(item.stock, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
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