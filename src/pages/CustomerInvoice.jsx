import { useState, useEffect } from 'react';
import { useStore } from '../store';
import logoImg from '../assets/wbm-logo.jpeg';
import { FileText, ArrowUpRight, CheckCircle2, Printer, Loader2, ShoppingCart, X, Plus, Trash2 } from 'lucide-react';

export default function CustomerInvoice() {
  const { inventory, fetchInventory, customerInvoice } = useStore();
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]); // Array of { id, name, qty, price }

  // Temporary form state for adding to cart
  const [selectedId, setSelectedId] = useState("");
  const [qty, setQty] = useState("");

  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);

  useEffect(() => {
    if (inventory.length === 0) fetchInventory();
    setLoading(false);
  }, []);

  const addToCart = () => {
    const product = inventory.find(p => p.id === Number(selectedId));
    if (!product || !qty || qty <= 0) return;
    if (product.stock < qty) return alert("Insufficient stock!");

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + Number(qty) } : item));
    } else {
      setCart([...cart, { id: product.id, name: product.name, qty: Number(qty), price: product.price }]);
    }
    setSelectedId("");
    setQty("");
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const totalAmount = cart.reduce((sum, item) => sum + (item.qty * item.price), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);

    // We send the array of items to the backend
    const data = {
      items: cart.map(item => ({ product_id: item.id, qty: item.qty })),
      type: 'OUT'
    };

    // Note: Since we are sending a JSON array, ensure your store.js addTransaction 
    // handles JSON instead of FormData, OR adjust accordingly.
    const result = await customerInvoice(data);

    if (result) {
      setLastInvoice({
        ref: result.ref,
        items: cart,
        total: totalAmount,
        date: new Date().toLocaleString()
      });
      setSuccess(true);
      setCart([]);
    }
    setIsProcessing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="print:hidden bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-rose-600 text-white flex items-center gap-3">
          <ShoppingCart size={24} />
          <h2 className="text-xl font-bold">Customer Sale</h2>
        </div>

        <div className="p-8 space-y-6">
          {/* Add Item to Cart Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Product</label>
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
                className="w-full p-3 bg-white border rounded-xl outline-none">
                <option value="">Select Item</option>
                {inventory.map(item => <option key={item.id} value={item.id}>{item.name} ({item.stock})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Qty</label>
              <input type="number" value={qty} onChange={(e) => setQty(e.target.value)}
                className="w-full p-3 bg-white border rounded-xl outline-none" placeholder="0" />
            </div>
            <button onClick={addToCart} className="bg-slate-800 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700">
              <Plus size={18} /> Add to List
            </button>
          </div>

          {/* Cart Table */}
          {cart.length > 0 && (
            <div className="border rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Subtotal</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cart.map(item => (
                    <tr key={item.id}>
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">{item.qty}</td>
                      <td className="p-3">RM{(item.qty * item.price).toFixed(2)}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => removeFromCart(item.id)} className="text-rose-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between items-center py-4 border-t">
            <span className="text-xl font-black text-rose-600">Total: RM{totalAmount.toFixed(2)}</span>
            <button onClick={handleSubmit} disabled={cart.length === 0 || isProcessing} className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-100 flex items-center gap-2">
              {isProcessing ? <Loader2 className="animate-spin" /> : <ArrowUpRight size={18} />} Process Transaction
            </button>
          </div>
        </div>
      </div>
      {/* RECEIPT SECTION */}
      {lastInvoice && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="print:hidden flex justify-between items-center px-4">
            <h3 className="font-bold text-slate-600">Generated Invoice</h3>
            <button onClick={() => setLastInvoice(null)} className="text-slate-400 hover:text-rose-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
              <ShoppingCart size={150} />
            </div>

            <div className="space-y-6 relative">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <img src={logoImg} alt="logo" className="w-16 h-16 rounded-full object-cover shadow-sm" />
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">WBM PROSHOP</h1>
                    <div className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-[280px] mt-1">
                      <p>2nd Floor, Ole Ole Shopping Centre, 7, Jalan Pinang A 18/A, Seksyen 18, 40200 Shah Alam.</p>
                      <p>Tel: +60 11-6274 7678</p>
                      <p>Reg No: 202603051541</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref No.</p>
                  <p className="font-mono font-bold text-rose-600 text-lg">{lastInvoice.ref}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-2xl">
                <div>
                  <p className="text-slate-400 font-bold text-[10px] uppercase">Date & Time</p>
                  <p className="font-bold text-slate-700">{lastInvoice.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold text-[10px] uppercase">Payment Status</p>
                  <p className="font-bold text-emerald-600 uppercase text-xs">Paid / Success</p>
                </div>
              </div>

              {/* ITEMS TABLE */}
              <div className="space-y-3">
                <div className="flex justify-between px-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  <span>Item Description</span>
                  <div className="flex gap-12">
                    <span>Qty</span>
                    <span className="w-20 text-right">Subtotal</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {lastInvoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white border border-slate-50 rounded-xl shadow-sm">
                      <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                      <div className="flex gap-12 items-center">
                        <span className="text-slate-500 font-medium text-xs">x{item.qty}</span>
                        <span className="font-bold text-slate-900 w-20 text-right text-sm">
                          RM {(item.qty * item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t-2 border-slate-100 border-dashed">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900 tracking-tight">Total Amount</span>
                  <span className="text-3xl font-black text-rose-600">
                    RM {lastInvoice.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-6 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
                  *** Thank you for shopping with WBM ProShop ***
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                <Printer size={18} /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}