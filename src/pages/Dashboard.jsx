import { useStore } from '../store';
import { Package, AlertCircle, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function Dashboard() {
  const { inventory, logs } = useStore();

  const totalRevenue = logs
    .filter(log => log.type === 'OUT')
    .reduce((acc, log) => {
      // Find the price of the product from inventory to calculate value
      const product = inventory.find(p => p.name === log.productName);
      const price = product ? product.price : 0;
      return acc + (price * log.qty);
    }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Overview</h2>
        <p className="text-slate-500 text-sm">Real-time inventory and sales performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Products" val={inventory.length} icon={<Package/>} color="bg-blue-500" />
        <StatCard label="Low Stock" val={inventory.filter(i => i.stock < 5).length} icon={<AlertCircle/>} color="bg-red-500" />
        <StatCard label="Total Sales" val={logs.filter(l => l.type === 'OUT').length} icon={<ShoppingCart/>} color="bg-amber-500" />
        <StatCard 
          label="Total Revenue" 
          val={`$${totalRevenue.toLocaleString()}`} 
          icon={<DollarSign/>} 
          color="bg-emerald-500" 
        />
      </div>

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
              {logs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{log.productName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      log.type === 'IN' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                    }`}>
                      {log.type === 'IN' ? <ArrowDownLeft size={12}/> : <ArrowUpRight size={12}/>}
                      {log.type === 'IN' ? 'IN' : 'OUT'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${log.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {log.type === 'IN' ? `+${log.qty}` : `-${log.qty}`}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-slate-400 italic text-sm">No recent activity found.</td>
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
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-5 hover:shadow-md transition-shadow">
      <div className={`${color} p-4 rounded-2xl text-white shadow-lg shadow-inner`}>{icon}</div>
      <div>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-none">{val}</p>
      </div>
    </div>
  );
}