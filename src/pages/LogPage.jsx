import { useState } from 'react';
import { useStore } from '../store';
import { Clock, ArrowUpRight, ArrowDownLeft, Printer, X, FileText } from 'lucide-react';

export default function LogPage() {
  const logs = useStore((state) => state.logs);
  const inventory = useStore((state) => state.inventory);
  
  const [selectedLog, setSelectedLog] = useState(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Activity Logs</h2>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Product</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-2">
                    <Clock size={14} /> {log.date}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{log.productName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      log.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {log.type === 'IN' ? 'STOCK IN' : 'STOCK OUT'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Printer size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:bg-white print:p-0 print:static print:inset-auto">
          
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 print:hidden">
              <h3 className="font-bold text-slate-500 uppercase tracking-widest text-xs">Reprinting {selectedLog.ref}</h3>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all">
                  <Printer size={18} /> Print Receipt
                </button>
                <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600 p-2">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="bg-white p-10 print:p-0">
              <div className="flex justify-between items-start border-b pb-8 mb-8">
                <div>
                  <h1 className="text-3xl font-black text-blue-600 mb-1 tracking-tighter">IMS</h1>
                  <p className="text-slate-400 text-sm font-medium uppercase tracking-tighter">Official Transaction Receipt</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 text-lg">Invoice: {selectedLog.ref}</p>
                  <p className="text-slate-500 text-sm">{selectedLog.date}</p>
                </div>
              </div>

              <table className="w-full mb-12">
                <thead>
                  <tr className="text-slate-400 text-sm uppercase text-left border-b">
                    <th className="pb-4 font-bold">Description</th>
                    <th className="pb-4 font-bold">Qty</th>
                    <th className="pb-4 font-bold text-right">Movement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-slate-800 font-semibold text-lg">
                    <td className="py-8">{selectedLog.productName}</td>
                    <td className="py-8">{selectedLog.qty} units</td>
                    <td className={`py-8 text-right font-black ${selectedLog.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedLog.type === 'IN' ? `+${selectedLog.qty}` : `-${selectedLog.qty}`}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t pt-8 flex justify-between items-center">
                <div className="text-[10px] text-slate-400 max-w-[250px] italic">
                  This document is a historical record retrieved from the Inventory Management System logs. Verified by Admin.
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Transaction Status</p>
                  <p className="text-4xl font-black text-slate-900">COMPLETED</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}