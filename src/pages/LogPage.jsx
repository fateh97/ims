import { useState } from 'react';
import { useStore } from '../store';
import { Printer, FileText, X, ShoppingCart } from 'lucide-react';
import logoImg from '../assets/WBM logo.jpeg'; // Import your logo

export default function ActivityLog() {
  const { logs } = useStore();
  const [printData, setPrintData] = useState(null); // State for the selected receipt

  const API_BASE_URL = "http://127.0.0.1:8000";

  const handlePreparePrint = (log) => {
    // Format the data to match our receipt structure
    setPrintData({
      ref: log.ref,
      productName: log.product?.name,
      qty: log.qty,
      price: log.product?.price,
      total: log.qty * log.product?.price,
      date: new Date(log.created_at).toLocaleString([], { 
        year: 'numeric', month: 'numeric', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      })
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. THE TABLE SECTION (Hidden when printing the receipt) */}
      <div className="print:hidden bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4">Ref #</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 font-mono text-xs">{log.ref}</td>
                <td className="px-6 py-4 font-medium">{log.product?.name}</td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                    log.type === 'IN' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
                  }`}>
                    {log.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-center space-x-2">
                  {/* SHOW PRINT BUTTON ONLY FOR 'OUT' (SALES) */}
                  {log.type === 'OUT' && (
                    <button 
                      onClick={() => handlePreparePrint(log)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Reprint Receipt"
                    >
                      <Printer size={18} />
                    </button>
                  )}
                  
                  {/* Existing attachment viewer for 'IN' logs */}
                  {log.attachment && (
                    <button onClick={() => window.open(`${API_BASE_URL}/uploads/${log.attachment}`, '_blank')}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                      <FileText size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. THE PRINTABLE RECEIPT MODAL */}
      {printData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:static print:bg-white print:p-0">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 print:shadow-none print:border-none print:w-full">
            
            {/* Modal Header (Hidden on Print) */}
            <div className="print:hidden flex justify-between mb-6 border-b pb-4">
              <h3 className="font-bold">Reprint Receipt</h3>
              <button onClick={() => setPrintData(null)}><X size={20}/></button>
            </div>

            {/* --- ACTUAL RECEIPT CONTENT (Same as your Customer Page) --- */}
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-6">
                <div className="flex items-center gap-3">
                  <img src={logoImg} className="w-14 rounded-full" alt="Logo" />
                  <h1 className="text-xl font-black italic">WBM PROSHOP</h1>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Ref</p>
                  <p className="font-mono font-bold text-rose-600">{printData.ref}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs border-b pb-4">
                <p>Date: <strong>{printData.date}</strong></p>
                <p className="text-right">Status: <strong className="text-emerald-600">PAID</strong></p>
              </div>

              <div className="space-y-2 py-4">
                <div className="flex justify-between">
                  <span>{printData.productName}</span>
                  <span className="font-bold">x {printData.qty}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-sm">
                  <span>Unit Price</span>
                  <span>RM {parseFloat(printData.price).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-dashed">
                <span className="text-lg font-bold">Total Amount</span>
                <span className="text-2xl font-black text-rose-600">RM {parseFloat(printData.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Print Trigger (Hidden on Print) */}
            <button 
              onClick={() => window.print()}
              className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 print:hidden"
            >
              <Printer size={18} /> Confirm Print
            </button>
          </div>
        </div>
      )}
    </div>
  );
}