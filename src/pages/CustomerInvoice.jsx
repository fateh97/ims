import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { FileText, ArrowUpRight, CheckCircle2, Printer, Loader2, ShoppingCart } from 'lucide-react';

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

  const handleSubmit = async (e) => {
        e.preventDefault();
        
        // For customers, we still find the product to check stock first
        const product = inventory.find(p => p.id === Number(selectedProductId));
        if (!product || product.stock < Number(quantity)) {
            alert("Insufficient stock!");
            return;
        }

        setIsProcessing(true);
        
        const data = new FormData();
        data.append('product_id', product.id); // Customer uses ID for precision
        data.append('type', 'OUT');
        data.append('qty', quantity);
        data.append('ref', `SALE-${Date.now()}`);

        const result = await addTransaction(data);

        if (result) {
            setSuccess(true);
            setQuantity("");
            setSelectedProductId("");
        }
        setIsProcessing(false);
    };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="print:hidden bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-rose-600 text-white flex items-center gap-3">
          <ShoppingCart size={24} />
          <h2 className="text-xl font-bold">New Customer Sale</h2>
        </div>
        
        {success && <div className="bg-emerald-50 text-emerald-700 p-4 font-bold text-center border-b">Transaction Recorded!</div>}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Product</label>
              <select required value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} 
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-rose-500">
                <option value="">Choose item...</option>
                {inventory.map(item => <option key={item.id} value={item.id}>{item.name} (Stock: {item.stock})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quantity to Sell</label>
              <input required type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-rose-500" placeholder="0" />
            </div>
          </div>
          <button type="submit" disabled={isProcessing} className="w-full py-4 rounded-2xl font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg flex items-center justify-center gap-2">
            {isProcessing ? <Loader2 className="animate-spin" /> : <ArrowUpRight size={18} />} Process Sale
          </button>
        </form>
      </div>
    </div>
  );
}