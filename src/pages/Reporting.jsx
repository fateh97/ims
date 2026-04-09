import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { DollarSign, Download, TrendingUp, TrendingDown, FileSpreadsheet } from 'lucide-react';

export default function ReportsPage() {
  const { logs, fetchLogs } = useStore(); // Pull fetchLogs from store
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await fetchLogs();
      setLoading(false);
    };
    loadData();
  }, [fetchLogs]);

  // Calculate Financials
  const moneyIn = logs
  .filter(l => l.type === 'IN')
  .reduce((sum, l) => sum + (Number(l.qty) * (Number(l.product?.supplier_price) || 0)), 0);

  const moneyOut = logs
    .filter(l => l.type === 'OUT')
    .reduce((sum, l) => sum + (l.qty * (l.product?.price || 0)), 0);

  const handleExport = () => {
    // Direct link to your Laravel API endpoint
    window.location.href = "http://127.0.0.1:8000/api/export-financial-report";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-slate-800">Financial Overview</h2>
        <button 
          onClick={handleExport}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
        >
          <FileSpreadsheet size={20} /> Export to Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Money In Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 w-fit rounded-2xl mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-slate-500 font-medium uppercase text-xs tracking-widest">Total Purchases (In)</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">RM {moneyIn.toLocaleString()}</h3>
        </div>

        {/* Money Out Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="p-3 bg-rose-50 text-rose-600 w-fit rounded-2xl mb-4">
            <TrendingDown size={24} />
          </div>
          <p className="text-slate-500 font-medium uppercase text-xs tracking-widest">Total Sales (Out)</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">RM {moneyOut.toLocaleString()}</h3>
        </div>

        {/* Profit/Net Card */}
        <div className="bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200 text-white">
          <div className="p-3 bg-slate-800 text-blue-400 w-fit rounded-2xl mb-4">
            <DollarSign size={24} />
          </div>
          <p className="text-slate-400 font-medium uppercase text-xs tracking-widest">Net Cash Flow</p>
          <h3 className="text-3xl font-black mt-1">RM {(moneyOut - moneyIn).toLocaleString()}</h3>
        </div>
      </div>

      {/* Logic for a simple table summary could go here */}
    </div>
  );
}