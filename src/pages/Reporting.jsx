import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { DollarSign, Download, TrendingUp, TrendingDown, FileSpreadsheet } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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

  const chartData = logs.reduce((acc, log) => {
    const date = new Date(log.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const existing = acc.find(item => item.date === date);

    const amount = log.type === 'IN'
      ? (Number(log.qty) * (Number(log.product?.supplier_price) || 0))
      : (Number(log.qty) * (Number(log.product?.price) || 0));

    if (existing) {
      if (log.type === 'IN') existing.Spent += amount;
      else existing.Earned += amount;
    } else {
      acc.push({
        date,
        Spent: log.type === 'IN' ? amount : 0,
        Earned: log.type === 'OUT' ? amount : 0
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7);

  const hasChartData = chartData.length > 0;

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

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Cash Flow Trend (Last 7 Days)</h3>

        {hasChartData ? (
          <div className="h-[300px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `RM${value}`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" height={36} />
                <Area
                  type="monotone"
                  dataKey="Earned"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorEarned)"
                />
                <Area
                  type="monotone"
                  dataKey="Spent"
                  stroke="#f43f5e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSpent)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          /* NO DATA STATE */
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 opacity-40 py-10">
            <div className="p-4 bg-slate-100 rounded-full text-slate-400">
              <TrendingUp size={40} />
            </div>
            <div className="text-center">
              <p className="text-slate-600 font-bold">No data available</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}