import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { DollarSign, Download, TrendingUp, TrendingDown, FileSpreadsheet } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

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

  console.log("Logs for Reporting Page:", logs);
  // Calculate Financials
  const moneyIn = logs
    .filter(l => l.type === 'IN' || l.type === 'DELETE')
    .reduce((sum, l) => {
      const logValue = Number(l.qty || 0) * (Number(l.supplier_price) || 0);

      if (l.type === 'IN') {
        return sum + logValue;
      } else if (l.type === 'DELETE') {
        return sum - logValue;
      }

      return sum;
    }, 0);

  const moneyOut = logs
    .filter(l => l.type === 'OUT')
    .reduce((sum, l) => {
      const productTotal = Number(l.qty) * (Number(l.price) || 0);

      const serviceTotal = Number(l.service_price) || 0;

      return sum + productTotal + serviceTotal;
    }, 0);

  const handleExport = () => {
    // Direct link to your Laravel API endpoint
    window.location.href = "http://127.0.0.1:8000/api/export-financial-report";
  };

  const chartData = logs.reduce((acc, log) => {
    const dateObj = new Date(log.created_at);

    if (isNaN(dateObj.getTime())) return acc;
    const month = dateObj.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === month);

    const amount = log.type === 'IN'
      ? (Number(log.qty) * (Number(log.supplier_price) || 0))
      : (Number(log.qty) * (Number(log.price) || 0));

    if (existing) {
      if (log.type === 'IN') existing.Spent += amount;
      else existing.Earned += amount;
    } else {
      acc.push({
        month,
        Spent: log.type === 'IN' ? amount : 0,
        Earned: log.type === 'OUT' ? amount : 0
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.month) - new Date(b.month)) // Ensure months are in order
    .slice(-12);

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
        <h3 className="text-lg font-bold text-slate-800 mb-6">Cash Flow Trend</h3>

        {hasChartData ? (
          <div className="h-[350px] w-full"> {/* Fixed height to avoid flex conflict */}
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `RM${value.toLocaleString()}`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" height={36} />

                {/* Earned Line (Green) */}
                <Line
                  type="monotone"
                  dataKey="Earned"
                  stroke="#10b981"
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />

                {/* Spent Line (Red) */}
                <Line
                  type="monotone"
                  dataKey="Spent"
                  stroke="#f43f5e"
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
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