import { useState, useEffect } from 'react';
import { useStore } from '../store';
import logoImg from '../assets/wbm-logo.jpeg';
import {
  ShoppingCart, X, Plus, Trash2, Printer,
  Loader2, ArrowUpRight, Wrench, Package, Info
} from 'lucide-react';

export default function CustomerInvoice() {
  const { inventory, fetchInventory, customerInvoice } = useStore();

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // State for Flow 1: Purchase (Items)
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productQty, setProductQty] = useState("");

  // State for Flow 2: Service Maintenance (Manual Entry)
  const [serviceDesc, setServiceDesc] = useState("");
  const [servicePrice, setServicePrice] = useState("");

  const [success, setSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);

  useEffect(() => {
    fetchInventory().then(() => setLoading(false));
  }, []);

  const addProductToCart = () => {
    const product = inventory.find(p => p.id === Number(selectedProductId));
    if (!product || !productQty || productQty <= 0) return;
    if (product.stock < productQty) return alert("Insufficient stock!");

    setCart([...cart, {
      id: product.id,
      name: product.name,
      qty: Number(productQty),
      price: Number(product.price),
      isService: false
    }]);
    setSelectedProductId("");
    setProductQty("");
  };

  const addServiceToCart = () => {
    if (!serviceDesc || !servicePrice || servicePrice <= 0) return;

    setCart([...cart, {
      id: `svc-${Date.now()}`,
      name: serviceDesc, // The description written by the user
      qty: 1,
      price: Number(servicePrice),
      isService: true
    }]);
    setServiceDesc("");
    setServicePrice("");
  };

  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));

  const productTotal = cart.filter(i => !i.isService).reduce((sum, i) => sum + (i.qty * i.price), 0);
  const serviceTotal = cart.filter(i => i.isService).reduce((sum, i) => sum + (i.qty * i.price), 0);
  const grandTotal = productTotal + serviceTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    const payload = {
      items: cart.filter(i => !i.isService).map(i => ({ product_id: i.id, qty: i.qty })),
      maintenance: cart.filter(i => i.isService).map(i => ({ desc: i.name, price: i.price })),
      type: 'OUT'
    };

    const result = await customerInvoice(payload);

    if (result) {
      setLastInvoice({
        ref: result.ref,
        items: [...cart],
        productTotal,
        serviceTotal,
        grandTotal,
        date: new Date().toLocaleString()
      });
      setSuccess(true);
      setCart([]);
    }
    setIsProcessing(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-rose-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4">

      {/* SELECTION GRID */}
      <div className="print:hidden grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Flow 1: Item Selection */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-widest">
            <Package size={16} className="text-rose-500" /> Product Purchase
          </h3>
          <div className="space-y-4">
            <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all">
              <option value="">Choose Inventory Item...</option>
              {inventory.map(item => <option key={item.id} value={item.id}>{item.name} (Stock: {item.stock})</option>)}
            </select>
            <div className="flex gap-2">
              <input type="number" value={productQty} onChange={(e) => setProductQty(e.target.value)}
                className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" placeholder="Qty" />
              <button onClick={addProductToCart} className="px-8 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 active:scale-95 transition-all">
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Flow 2: Manual Service Maintenance */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-widest">
            <Wrench size={16} className="text-blue-500" /> Service Maintenance
          </h3>
          <div className="space-y-4">
            <input
              value={serviceDesc}
              onChange={(e) => setServiceDesc(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description (e.g. Plugging & Resurfacing)"
            />
            <div className="flex gap-2">
              <input type="number" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)}
                className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" placeholder="Price (RM)" />
              <button onClick={addServiceToCart} className="px-8 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 active:scale-95 transition-all">
                Add Service
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CART SUMMARY */}
      {cart.length > 0 && (
        <div className="print:hidden bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-6 border-b bg-slate-50/50 flex items-center gap-2">
            <Info size={18} className="text-slate-400" />
            <h3 className="font-bold text-slate-700">Transaction Summary</h3>
          </div>
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-50">
              {cart.map((item, index) => (
                <tr key={index} className="group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.isService ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                        {item.isService ? <Wrench size={14} /> : <Package size={14} />}
                      </div>
                      <span className="font-bold text-slate-700">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-slate-500">x{item.qty}</td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">RM{(item.qty * item.price).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => removeFromCart(index)} className="text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Payable</p>
              <p className="text-3xl font-black">RM{grandTotal.toFixed(2)}</p>
            </div>
            <button onClick={handleSubmit} className="px-10 py-4 bg-rose-600 hover:bg-rose-500 rounded-2xl font-black transition-all flex items-center gap-2 shadow-lg shadow-rose-900/20">
              Complete Sale <ArrowUpRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* FINAL RECEIPT SECTION (Mapped for Flow 3: Multiple types) */}
      {lastInvoice && (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden max-w-2xl mx-auto border-t-8 border-t-rose-600">
          <div className="space-y-8">
            {/* Header stays exactly as you had it... */}
            <div className="flex justify-between items-start border-b pb-6 border-slate-100">
              <div className="flex items-center gap-4">
                <img src={logoImg} alt="logo" className="w-20 h-20 rounded-full object-cover shadow-md" />
                <div>
                  <h1 className="text-2xl font-black text-slate-900 italic tracking-tighter">WBM PROSHOP</h1>
                  <div className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                    <p>2nd Floor, Ole Ole Shopping Centre, Shah Alam.</p>
                    <p>Tel: +60 11-6274 7678 | Reg: 202603051541</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase">Ref No.</p>
                <p className="font-mono font-bold text-rose-600 text-xl">{lastInvoice.ref}</p>
              </div>
            </div>

            {/* PRODUCT SECTION */}
            {lastInvoice.items.filter(i => !i.isService).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-3">
                  PURCHASED ITEMS <div className="h-px bg-rose-100 flex-1"></div>
                </h4>
                {lastInvoice.items.filter(i => !i.isService).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-800 font-bold">{item.name} <span className="text-slate-400 font-medium">x{item.qty}</span></span>
                    <span className="font-bold text-slate-900">RM{(item.qty * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* MAINTENANCE SECTION */}
            {lastInvoice.items.filter(i => i.isService).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-3">
                  SERVICE MAINTENANCE <div className="h-px bg-blue-100 flex-1"></div>
                </h4>
                {lastInvoice.items.filter(i => i.isService).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-slate-800 font-bold">{item.name}</span>
                    <span className="font-bold text-slate-900">RM{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* TOTALS */}
            <div className="pt-6 border-t-2 border-slate-900 border-dashed space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-slate-900">GRAND TOTAL</span>
                <span className="text-4xl font-black text-rose-600">RM{lastInvoice.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-8 text-center">
              <p className="text-[10px] text-slate-300 font-black tracking-[0.3em] uppercase italic">*** Thank You For Your Business ***</p>
            </div>

            <button onClick={() => window.print()} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black print:hidden shadow-xl active:scale-95 transition-all">
              PRINT OFFICIAL RECEIPT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}