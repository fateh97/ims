import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Truck, Upload, FileCheck, Loader2, ArrowDownLeft } from 'lucide-react';

export default function SupplierEntry() {
  const { inventory, fetchInventory, addTransaction } = useStore();
  const [loading, setLoading] = useState(true);
  const [productSearch, setProductSearch] = useState(""); 
  const [quantity, setQuantity] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [unitPrice, setUnitPrice] = useState("");
  const { brands, inventoryTypes } = useStore();
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedInventoryType, setSelectedInventoryType] = useState("");
  const [itemName, setItemName] = useState("");

  useEffect(() => {
    const load = async () => {
      if (inventory.length === 0) await fetchInventory();
      setLoading(false);
    };
    load();
  }, [fetchInventory, inventory.length]);

  const totalAmount = (Number(quantity) || 0) * (Number(unitPrice) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const invRef = `SUPP-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the bundle
    const data = new FormData();
    data.append('product_name', productSearch); // Send text name
    data.append('brand_id', selectedBrand); 
    data.append('inventory_type_id', selectedInventoryType);
    data.append('type', 'IN');
    data.append('qty', quantity);
    data.append('unit_price', unitPrice);
    data.append('ref', invRef);
    
    // Only append if a file was actually selected
    if (attachment instanceof File) {
        data.append('attachment', attachment);
    }

    // Call the updated store function
    const result = await addTransaction(data);

    if (result) {
        setSuccess(true);
        setProductSearch("");
        setQuantity("");
        setUnitPrice("");
        setAttachment(null);
        setTimeout(() => setSuccess(false), 5000);
    } else {
        alert("Server error. Please check your Laravel logs.");
    }
    
    setIsProcessing(false);
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-emerald-600 text-white flex items-center gap-3">
          <Truck size={24} />
          <h2 className="text-xl font-bold">Supplier Inventory</h2>
        </div>

        {success && <div className="bg-emerald-50 text-emerald-700 p-4 font-bold text-center">Stock Added Successfully!</div>}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
              <input required type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} 
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Type of Product</label>
              <select 
                value={selectedInventoryType} 
                onChange={(e) => setSelectedInventoryType(e.target.value)}
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a type...</option>
                {inventoryTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Brand</label>
              <select 
                value={selectedBrand} 
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a brand...</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Quantity */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quantity</label>
              <input required type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            {/* Supplier Price */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Unit Cost (RM)</label>
              <input required type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0.00" />
            </div>
          </div>

          {/* Real-time Total Display */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200 flex justify-between items-center">
            <span className="text-slate-500 font-medium">Total Amount:</span>
            <span className="text-xl font-black text-emerald-600">RM{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Upload Supplier Receipt</label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors">
              <input type="file" onChange={(e) => setAttachment(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {attachment ? <div className="flex flex-col items-center"><FileCheck className="text-emerald-500" /> <span>{attachment.name}</span></div> : <div className="flex flex-col items-center"><Upload /> <span>Click to upload receipt</span></div>}
            </div>
          </div>

          <button type="submit" disabled={isProcessing} className="w-full py-4 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg flex items-center justify-center gap-2">
             {isProcessing ? <Loader2 className="animate-spin" /> : <ArrowDownLeft size={18} />} Confirm Reception
          </button>
        </form>
      </div>
    </div>
  );
}