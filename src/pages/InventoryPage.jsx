import { useState } from 'react';
import { useStore } from '../store';
import { Search, Package, Plus, X, DollarSign, Tag, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const { inventory, addProduct } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");

  const handleAddProduct = (e) => {
    e.preventDefault();
    const newProduct = {
      id: Date.now(),
      name: newName,
      sku: newSku,
      price: parseFloat(newPrice),
      stock: parseInt(newStock)
    };
    addProduct(newProduct);
    setIsOpen(false);
    setNewName(""); setNewSku(""); setNewPrice(""); setNewStock("");
  };

  const filteredProducts = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Warehouse Inventory</h2>
          <p className="text-slate-500 text-sm">Real-time stock monitoring.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search inventory..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Product</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">SKU</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Stock</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package size={16} /></div>
                      <span className="font-semibold text-slate-800">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{item.sku}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{item.stock}</span>
                      {item.stock < 10 && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">LOW</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-600">${item.price.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-slate-400">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">Add New Product</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <input required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Product Name" />
              <input required value={newSku} onChange={(e) => setNewSku(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="SKU (e.g. ITEM-001)" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Price" />
                <input required type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Initial Stock" />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">Save Product</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}