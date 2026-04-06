import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { FileText, ArrowUpRight, ArrowDownLeft, CheckCircle2, Printer, Loader2, Upload, FileCheck, Search } from 'lucide-react';

export default function InvoicePage() {
  const { inventory, fetchInventory, addTransaction } = useStore();
  const [loading, setLoading] = useState(true);
  
  // We use product name for the input text, then find the ID before submitting
  const [productSearch, setProductSearch] = useState(""); 
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("OUT"); 
  const [attachment, setAttachment] = useState(null);
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

    // Find the product ID based on the name typed or selected
    const product = inventory.find(p => 
      p.name.toLowerCase() === productSearch.toLowerCase()
    );

    if (!product) {
      alert("Product not found. Please select a valid product from the list.");
      return;
    }

    const qtyNum = Number(quantity);
    if (type === "OUT" && product.stock < qtyNum) {
      alert(`Insufficient stock! Available: ${product.stock}`);
      return;
    }

    setIsProcessing(true);
    const invRef = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    const formData = new FormData();
    formData.append('product_id', product.id); // Send the ID found by name
    formData.append('type', type);
    formData.append('qty', qtyNum);
    formData.append('ref', invRef);
    if (attachment) formData.append('attachment', attachment);

    const result = await addTransaction(formData);

    if (result) {
      setLastInvoice({
        ref: invRef,
        productName: product.name,
        qty: qtyNum,
        price: product.price,
        total: product.price * qtyNum,
        date: new Date().toLocaleString(),
        type: type
      });
      setSuccess(true);
      setQuantity("");
      setProductSearch("");
      setAttachment(null);
      setTimeout(() => setSuccess(false), 5000);
    }
    setIsProcessing(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="print:hidden space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-600 text-white rounded-lg"><FileText size={24} /></div>
          <h2 className="text-2xl font-bold text-slate-800">Create New Invoice</h2>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Toggle Buttons */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border-b">
            <button type="button" onClick={() => { setType("OUT"); setProductSearch(""); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${type === "OUT" ? "bg-white text-rose-600 shadow-md" : "text-slate-500"}`}>
              <ArrowUpRight size={18} /> Customer (Out)
            </button>
            <button type="button" onClick={() => { setType("IN"); setProductSearch(""); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${type === "IN" ? "bg-white text-emerald-600 shadow-md" : "text-slate-500"}`}>
              <ArrowDownLeft size={18} /> Supplier (In)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PRODUCT INPUT SECTION */}
              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {type === "IN" ? "Supplier Item Name" : "Select Product"}
                </label>
                
                {type === "IN" ? (
                  <>
                    <input
                      required
                      list="inventory-list"
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Type item name..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <datalist id="inventory-list">
                      {inventory.map((item) => (
                        <option key={item.id} value={item.name} />
                      ))}
                    </datalist>
                  </>
                ) : (
                  <select
                    required
                    value={productSearch} // using productSearch as the value for name here too
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose item...</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.name}>{item.name} (Stock: {item.stock})</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* UPLOAD SECTION (Supplier Only) */}
            {type === "IN" && (
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Upload Supplier Receipt</label>
                <div className="relative group border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-emerald-500 transition-colors text-center cursor-pointer">
                  <input type="file" onChange={(e) => setAttachment(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    {attachment ? (
                      <><FileCheck className="text-emerald-500" size={32} /> <span className="text-emerald-600 font-medium">{attachment.name}</span></>
                    ) : (
                      <><Upload size={32} /> <span>Click to upload document</span></>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={isProcessing}
              className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                type === "OUT" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}>
              {isProcessing && <Loader2 className="animate-spin" size={20} />}
              {isProcessing ? "Processing..." : `Confirm ${type === "OUT" ? "Sale" : "Stock Entry"}`}
            </button>
          </form>
        </div>
      </div>
      {/* Receipt Section stays same */}
    </div>
  );
}