import { useState, useEffect } from 'react';
import { useStore } from '../store';
import logoImg from '../assets/wbm-logo.jpeg';
import {
  ShoppingCart, X, Plus, Trash2, Printer,
  Loader2, ArrowUpRight, Wrench, Package, Info, Tag, Layers
} from 'lucide-react';

export default function CustomerInvoice() {
  const { inventory, fetchInventory, customerInvoice } = useStore();

  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);

  // Selection States
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productQty, setProductQty] = useState("");

  const [selectedAccessoryId, setSelectedAccessoryId] = useState("");
  const [accessoryQty, setAccessoryQty] = useState("");

  const [serviceDesc, setServiceDesc] = useState("");
  const [servicePrice, setServicePrice] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);

  useEffect(() => {
    fetchInventory().then(() => setLoading(false));
  }, [fetchInventory]);

  const mainProducts = inventory.filter(item => {
    if (!item.inventory_types) return true;
    return Number(item.inventory_types.accessory) === 0;
  });

  const accessories = inventory.filter(item => {
    if (!item.inventory_types) return false;
    return Number(item.inventory_types.accessory) === 1;
  });

  const addItemToCart = (id, qty, mode) => {
    setLastInvoice(null);
    if (mode === 'service') {
      if (!serviceDesc || !servicePrice) return;
      setCart([...cart, {
        id: `svc-${Date.now()}`,
        name: serviceDesc,
        qty: 1,
        price: Number(servicePrice),
        type: 'service',
        isService: true
      }]);
      setServiceDesc(""); setServicePrice("");
    } else {
      const item = inventory.find(p => p.id === Number(id));
      const requestedQty = Number(qty);
      if (!item || requestedQty <= 0) return;
      if (item.stock < requestedQty) return alert(`Cannot exceed more than stock for ${item.name}!`);

      setCart([...cart, {
        id: item.id,
        name: item.name,
        qty: requestedQty,
        price: Number(item.price),
        type: mode, // 'product' or 'accessory'
        isService: false
      }]);

      if (mode === 'product') { setSelectedProductId(""); setProductQty(""); }
      else { setSelectedAccessoryId(""); setAccessoryQty(""); }
    }
  };

  const removeFromCart = (index) => {
    setLastInvoice(null);
    setCart(cart.filter((_, i) => i !== index));
  };

  const grandTotal = cart.reduce((sum, i) => sum + (i.qty * i.price), 0);

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
        grandTotal,
        date: new Date().toLocaleString()
      });
      setCart([]);
    }
    setIsProcessing(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-rose-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 px-4">

      {/* 1. SELECTION GRID */}
      <div className="print:hidden grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Main Product Selection */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-rose-500 uppercase mb-4 flex items-center gap-2 tracking-widest">
            <Package size={16} /> Main Products
          </h3>
          <div className="space-y-4">
            <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500 transition-all">
              <option value="">Select Item...</option>
              {mainProducts.map(item => <option key={item.id} value={item.id}>{item.name} (Stock: {item.stock})</option>)}
            </select>
            <div className="flex gap-2">
              <input type="number" value={productQty} onChange={(e) => setProductQty(e.target.value)}
                className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" placeholder="Qty" />
              <button onClick={() => addItemToCart(selectedProductId, productQty, 'product')} className="px-6 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all">Add</button>
            </div>
          </div>
        </div>

        {/* Accessory Selection */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-amber-500 uppercase mb-4 flex items-center gap-2 tracking-widest">
            <Tag size={16} /> Accessories
          </h3>
          <div className="space-y-4">
            <select value={selectedAccessoryId} onChange={(e) => setSelectedAccessoryId(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all">
              <option value="">Select Accessory...</option>
              {accessories.map(item => <option key={item.id} value={item.id}>{item.name} (Stock: {item.stock})</option>)}
            </select>
            <div className="flex gap-2">
              <input type="number" value={accessoryQty} onChange={(e) => setAccessoryQty(e.target.value)}
                className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" placeholder="Qty" />
              <button onClick={() => addItemToCart(selectedAccessoryId, accessoryQty, 'accessory')} className="px-6 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 transition-all">Add</button>
            </div>
          </div>
        </div>

        {/* Maintenance Service (Manual) */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-blue-500 uppercase mb-4 flex items-center gap-2 tracking-widest">
            <Wrench size={16} /> Maintenance
          </h3>
          <div className="space-y-4">
            <input value={serviceDesc} onChange={(e) => setServiceDesc(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Service Description" />
            <div className="flex gap-2">
              <input type="number" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)}
                className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" placeholder="Price" />
              <button onClick={() => addItemToCart(null, 1, 'service')} className="px-6 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all">Add</button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CART SUMMARY */}
      {cart.length > 0 && (
        <div className="print:hidden bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h3 className="font-black text-white uppercase tracking-widest text-sm">Cart Overview</h3>
            <span className="text-2xl font-black text-rose-400">RM {grandTotal.toFixed(2)}</span>
          </div>
          <div className="p-4 space-y-2">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl group">
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${item.type === 'product' ? 'bg-rose-500/20 text-rose-400' :
                    item.type === 'accessory' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                    {item.type}
                  </span>
                  <p className="font-bold text-slate-200">{item.name} <span className="text-slate-500 text-xs ml-2">x{item.qty}</span></p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-mono font-bold text-white text-lg">RM{(item.qty * item.price).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(idx)} className="text-slate-600 group-hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleSubmit} disabled={isProcessing} className="w-full p-8 bg-rose-600 hover:bg-rose-500 text-white font-black text-xl transition-all active:scale-95 flex items-center justify-center gap-3">
            {isProcessing ? <Loader2 className="animate-spin" /> : <>PROCESS TRANSACTION <ArrowUpRight /></>}
          </button>
        </div>
      )}

      {/* 3. CATEGORIZED RECEIPT */}
      {lastInvoice && (
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-200 max-w-2xl mx-auto relative overflow-hidden">
          <div className="space-y-8 relative">
            {/* Receipt Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-8">
              <div className="flex items-center gap-4">
                <img src={logoImg} className="w-20 h-20 rounded-full shadow-lg border-4 border-slate-50" />
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tighter italic uppercase">WBM PROSHOP</h1>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mt-2">
                    <p>Ole Ole Shopping Centre, Shah Alam</p>
                    <p>Tel: +60 11-6274 7678 | Reg: 202603051541</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Invoice No.</p>
                <p className="font-mono font-bold text-rose-600 text-xl">{lastInvoice.ref}</p>
              </div>
            </div>

            {/* Categorized Rows */}
            {['product', 'accessory', 'service'].map(type => {
              const rows = lastInvoice.items.filter(i => i.type === type);
              if (rows.length === 0) return null;
              return (
                <div key={type} className="space-y-3">
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${type === 'product' ? 'text-rose-500' : type === 'accessory' ? 'text-amber-500' : 'text-blue-500'
                    }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${type === 'product' ? 'bg-rose-500' : type === 'accessory' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    {type}s
                  </h4>
                  <div className="space-y-2">
                    {rows.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-700">{item.name} <span className="text-slate-400 font-medium">x{item.qty}</span></span>
                        <span className="font-mono font-bold text-slate-900">RM{(item.qty * item.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Total Footer */}
            <div className="pt-8 border-t-4 border-double border-slate-100 flex justify-between items-center">
              <span className="text-xl font-black text-slate-900 tracking-tight italic">TOTAL PAYABLE</span>
              <span className="text-4xl font-black text-rose-600 tracking-tighter">RM{lastInvoice.grandTotal.toFixed(2)}</span>
            </div>

            <div className="pt-8 text-center border-t border-slate-50">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.5em]">*** Thank You ***</p>
            </div>

            <button onClick={() => window.print()} className="print:hidden w-full py-5 bg-slate-900 text-white rounded-3xl font-black shadow-xl active:scale-95 transition-all">
              PRINT OFFICIAL RECEIPT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}