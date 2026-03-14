import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Search, Package, Plus, X, DollarSign, Tag, AlertTriangle, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function InventoryPage() {
  const { inventory, addProduct, fetchInventory } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newName, setNewName] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newStock, setNewStock] = useState("");

  // FETCH PRODUCTS FROM LARAVEL
  useEffect(() => {
    // 1. Define the logic INSIDE the function
    const loadData = async () => {
      try {
        await fetchInventory();
      } catch (error) {
        console.error("Failed to load inventory:", error);
      } finally {
        setLoading(false); 
      }
    };

    loadData();

  }, []);

  console.log("Current Inventory in State:", inventory);
  // SAVE PRODUCT TO LARAVEL
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const productData = {
        name: newName,
        sku: newSku,
        price: parseFloat(newPrice),
        stock: parseInt(newStock)
      };

      const response = await axios.post('http://127.0.0.1:8000/api/add-products', productData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      addProduct(response.data); // Update Zustand state with the saved product
      setIsOpen(false);
      setNewName(""); setNewSku(""); setNewPrice(""); setNewStock("");
    } catch (error) {
      alert("Error saving product. Check if SKU is unique.");
    }
  };

  const filteredProducts = inventory.filter(item =>
    item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mr-2" /> Loading Data...
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Warehouse Inventory</h2>
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
                  <td className="px-6 py-4 font-semibold text-slate-800">{item.name}</td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{item.sku}</td>
                  <td className="px-6 py-4 font-bold">{item.stock}</td>
                  <td className="px-6 py-4 text-right text-slate-600">${parseFloat(item.price).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CODE... (stays exactly as you had it) */}
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
                <input required type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Price" />
                <input required type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} className="w-full px-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Initial Stock" />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">Save to Database</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}