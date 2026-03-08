import { useState } from 'react';
import { useStore } from '../store';
import { FileText, ArrowUpRight, ArrowDownLeft, CheckCircle2, Printer } from 'lucide-react';

export default function InvoicePage() {
  const { inventory, addTransaction } = useStore();

  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("OUT"); 
  const [success, setSuccess] = useState(false);
  
  const [lastInvoice, setLastInvoice] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const product = inventory.find(p => p.id === Number(selectedProductId));
    const invRef = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    addTransaction(
      Number(selectedProductId), 
      Number(quantity), 
      type, 
      invRef
    );

    setLastInvoice({
      ref: invRef,
      productName: product.name,
      qty: quantity,
      price: product.price,
      total: product.price * quantity,
      date: new Date().toLocaleString(),
      type: type
    });

    setSuccess(true);
    setQuantity("");
    setSelectedProductId("");
    setTimeout(() => setSuccess(false), 5000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      
      <div className="print:hidden space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <FileText size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Create New Invoice</h2>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {success && (
            <div className="bg-emerald-50 text-emerald-700 p-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={20} />
              <span className="font-bold">Transaction Successful! Stock and Logs updated.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setType("OUT")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  type === "OUT" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"
                }`}
              >
                <ArrowUpRight size={18} /> Customer (Out)
              </button>
              <button
                type="button"
                onClick={() => setType("IN")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                  type === "IN" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
                }`}
              >
                <ArrowDownLeft size={18} /> Supplier (In)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Product</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose from inventory...</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Stock: {item.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-95 ${
                type === "OUT" ? "bg-rose-600 hover:bg-rose-700 shadow-rose-100" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
              }`}
            >
              Process {type === "OUT" ? "Customer Sale" : "Supplier Restock"}
            </button>
          </form>
        </div>
      </div>

      {lastInvoice && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center print:hidden">
            <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Recent Receipt Preview</h3>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2 rounded-xl font-bold hover:bg-black transition-all shadow-lg"
            >
              <Printer size={18} /> Print Receipt
            </button>
          </div>

          <div className="bg-white border-2 border-slate-100 rounded-3xl p-10 shadow-xl max-w-xl mx-auto print:shadow-none print:border-none print:m-0">
            <div className="flex justify-between items-start border-b pb-6 mb-6">
              <div>
                <h1 className="text-2xl font-black text-blue-600">IMS SYSTEM</h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Official Transaction Receipt</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800 text-sm">{lastInvoice.ref}</p>
                <p className="text-slate-400 text-[10px]">{lastInvoice.date}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Transaction Type:</span>
                <span className={`font-bold ${lastInvoice.type === 'OUT' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {lastInvoice.type === 'OUT' ? 'CUSTOMER SALE' : 'SUPPLIER RESTOCK'}
                </span>
              </div>
              <div className="flex justify-between text-lg border-y py-4">
                <span className="text-slate-800 font-medium">{lastInvoice.productName} x {lastInvoice.qty}</span>
                <span className="font-bold text-slate-900">${lastInvoice.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="text-[10px] text-slate-400 italic">
                Thank you for using our Inventory System.
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] font-bold uppercase">Total Amount</p>
                <p className="text-3xl font-black text-slate-900">${lastInvoice.total.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}