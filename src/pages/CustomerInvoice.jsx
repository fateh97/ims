import { useState, useEffect } from 'react';
import { useStore } from '../store';
import logoImg from '../assets/wbm-logo.jpeg';
import { FileText, ArrowUpRight, CheckCircle2, Printer, Loader2, ShoppingCart, X } from 'lucide-react';

export default function CustomerInvoice() {
  const { inventory, fetchInventory, addTransaction } = useStore();
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (inventory.length === 0) await fetchInventory();
      setLoading(false);
    };
    load();
  }, [fetchInventory, inventory.length]);
  const totalAmount = (Number(quantity) || 0) * (Number(inventory.find(p => p.id === Number(selectedProductId))?.price || 0));
  const handleSubmit = async (e) => {
    e.preventDefault();

    const product = inventory.find(p => p.id === Number(selectedProductId));
    if (!product || product.stock < Number(quantity)) {
      alert("Insufficient stock!");
      return;
    }

    setIsProcessing(true);
    const invRef = `SALE-${Math.floor(1000 + Math.random() * 9000)}`;

    const data = new FormData();
    data.append('product_id', product.id);
    data.append('type', 'OUT');
    data.append('qty', quantity);
    data.append('ref', invRef);

    const result = await addTransaction(data);
    
    
    if (result) {
      // SET DATA FOR THE RECEIPT
      setLastInvoice({
        ref: invRef,
        productName: product.name,
        qty: quantity,
        price: product.price,
        total: product.price * Number(quantity),
        date: new Date().toLocaleString([], {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      });
      setSuccess(true);
      setQuantity("");
      setSelectedProductId("");
    }
    setIsProcessing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">

      {/* FORM SECTION - Hidden during print */}
      <div className="print:hidden bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-rose-600 text-white flex items-center gap-3">
          <ShoppingCart size={24} />
          <h2 className="text-xl font-bold">New Customer Sale</h2>
        </div>

        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-4 font-bold text-center border-b flex items-center justify-center gap-2">
            <CheckCircle2 size={18} /> Purchase Successfull!
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Product</label>
              <select required value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-rose-500">
                <option value="">Choose item...</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Stock: {item.stock})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quantity to Sell</label>
              <input required type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-rose-500" placeholder="0" />
            </div>
            
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Total Amount:</span>
              <span className="text-xl font-black text-red-600">RM{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          <button type="submit" disabled={isProcessing} className="w-full py-4 rounded-2xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
            {isProcessing ? <Loader2 className="animate-spin" /> : <ArrowUpRight size={18} />} Process Sale
          </button>
        </form>
      </div>

      {/* RECEIPT SECTION */}
      {lastInvoice && (
        <div className="space-y-4">
          <div className="print:hidden flex justify-between items-center px-4">
            <h3 className="font-bold text-slate-600">Recent Invoice Generated</h3>
            <button onClick={() => setLastInvoice(null)} className="text-slate-400 hover:text-rose-500">
              <X size={20} />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            {/* Design Elements */}
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <ShoppingCart size={120} />
            </div>

            {/* Receipt Content */}
            <div className="space-y-6 relative">
              <div className="flex justify-between items-start border-b pb-6">
                <div className="flex items-center gap-4">
                  <img src={logoImg} alt="wbm-logo" className="w-16 rounded-full" />
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 italic">WBM PROSHOP</h1>
                    <p className="text-sm text-slate-500">Official Purchase Receipt</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Reference</p>
                  <p className="font-mono font-bold text-rose-600">{lastInvoice.ref}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 font-medium">Date:</p>
                  <p className="font-bold text-slate-700">{lastInvoice.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-medium">Status:</p>
                  <p className="font-bold text-emerald-600 uppercase">Paid</p>
                </div>
              </div>

              <div className="border-y border-slate-100 py-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500">Item Name</span>
                  <span className="font-bold text-slate-800">{lastInvoice.productName}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-500">Unit Price</span>
                  <span className="text-slate-800">RM {lastInvoice.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quantity</span>
                  <span className="text-slate-800">x {lastInvoice.qty}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-slate-900">Total Amount</span>
                <span className="text-2xl font-black text-rose-600">RM{lastInvoice.total.toFixed(2)}</span>
              </div>

              <div className="pt-6 text-center text-[10px] text-slate-400 uppercase tracking-widest border-t border-dashed">
                Thank you for your business
              </div>
            </div>

            {/* Print Button (Hidden during print) */}
            <div className="mt-8 print:hidden">
              <button
                onClick={handlePrint}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
              >
                <Printer size={18} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}