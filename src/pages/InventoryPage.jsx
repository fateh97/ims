import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Search, FileText, Plus, X, DollarSign, Tag, AlertTriangle, Loader2, Trash2, Edit3, Truck } from 'lucide-react';
import axios from 'axios';

export default function InventoryPage() {
  const { inventory, logs, addProduct, fetchInventory, fetchLogs, setInventory, inventoryTypes } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const API_BASE_URL = "http://127.0.0.1:8000";
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { brands } = useStore();
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedInventoryType, setSelectedInventoryType] = useState("");
  const [itemName, setItemName] = useState("");
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockData, setRestockData] = useState({ qty: "", cost: "", file: null });
  const [selectedProduct, setSelectedProduct] = useState(null);

  //Modals State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: "", brand: "", price: "", stock: "", supplier_price: "" });

  // Form State
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newInventoryType, setNewInventoryType] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newSupplierPrice, setNewSupplierPrice] = useState("");
  const [newStock, setNewStock] = useState("");

  // FETCH PRODUCTS FROM LARAVEL
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch everything in parallel
        await Promise.all([
          fetchInventory(),
          fetchLogs(),
          useStore.getState().fetchBrands(),
          useStore.getState().fetchInventoryTypes()
        ]);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);
  // SAVE PRODUCT TO LARAVEL
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const productData = {
        name: newName,
        brand_id: selectedBrand, // Use the ID from your dropdown
        inventory_type_id: selectedInventoryType, // Use the ID from your dropdown
        price: parseFloat(newPrice),
        stock: parseInt(newStock),
        supplier_price: parseFloat(newSupplierPrice)
      };

      const response = await axios.post('http://127.0.0.1:8000/api/add-products', productData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      addProduct(response.data);
      setIsOpen(false);
      // Reset all fields
      setNewName(""); setSelectedBrand(""); setSelectedInventoryType("");
      setNewPrice(""); setNewStock("");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to add product. Please try again.");
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      inventory_type_id: product.inventory_type_id,
      price: product.price,
      stock: product.stock,
      supplier_price: product.supplier_price
    });
    setIsEditOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.put(`http://127.0.0.1:8000/api/update-product/${editingProduct.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state without refreshing the whole page
      const updated = inventory.map(item => item.id === editingProduct.id ? response.data : item);
      setInventory(updated);
      setIsEditOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update product. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`http://127.0.0.1:8000/api/delete-product/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedInventory = inventory.filter(item => item.id !== id);
      setInventory(updatedInventory); // Refresh inventory after deletion
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('added_stock', restockData.qty);
    formData.append('supplier_price', restockData.cost);
    formData.append('attachment', restockData.file);

    try {
      const token = localStorage.getItem('auth_token');
      const res = await axios.post(`${API_BASE_URL}/api/restock-product/${selectedProduct.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      // Update local inventory state
      const updated = inventory.map(item => item.id === selectedProduct.id ? res.data : item);
      setInventory(updated);

      // Refresh logs to show the new attachment immediately
      fetchLogs();

      setIsRestockOpen(false);
      setRestockData({ qty: "", cost: "", file: null });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to restock product. Please try again.");
    }
  };

  const filteredProducts = inventory.filter(item =>
    item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-slate-400">
      <Loader2 className="animate-spin mr-2" /> Loading...
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">WBM ProShop Inventory</h2>
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
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Brand</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Stock</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Price</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Supplier Price</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => {
                const lastReceipt = (logs || []).find(l =>
                  Number(l.product_id) === Number(item.id) &&
                  l.attachment
                );


                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{item.name} ({item.inventory_types?.name || 'N/A'})</span>
                        {lastReceipt?.attachment ? (
                          /* IF ATTACHMENT EXISTS */
                          <button
                            onClick={() => window.open(`${API_BASE_URL}/uploads/${lastReceipt.attachment}`, '_blank')}
                            className="flex items-center gap-1 text-[10px] text-blue-500 font-bold hover:text-blue-700 mt-1 transition-colors"
                          >
                            <FileText size={12} /> View Attachment
                          </button>
                        ) : (
                          /* IF NO ATTACHMENT */
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-1 italic">
                            No attachment
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{item.brand?.name || 'N/A'}</td>
                    <td className={`px-6 py-4 font-bold ${item.stock < 5 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {item.stock}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      RM {parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      RM {parseFloat(item.supplier_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {/* Action Buttons */}
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Product"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => { setSelectedProduct(item); setIsRestockOpen(true); }}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Quick Restock"
                      >
                        <Truck size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400 italic">
                  No products found in inventory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CODE... (stays exactly as you had it) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-800">Add New Product</h3>
                <p className="text-sm text-slate-500">Enter details to update your inventory</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white shadow-sm border border-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-8 space-y-5">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Product Name</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-3.5 text-slate-300" size={18} />
                  <input required value={newName} onChange={(e) => setNewName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="e.g. The Joker" />
                </div>
              </div>

              {/* Brand & Type Dropdowns */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Brand</label>
                  <select required value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Choose brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
                  <select required value={selectedInventoryType} onChange={(e) => setSelectedInventoryType(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Choose type</option>
                    {inventoryTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock Grid */}
              <div className="grid grid-cols-3 gap-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-blue-400 uppercase">Retail Price</label>
                  <div className="relative">
                    <span className="absolute left-0 top-2 text-xs font-bold text-blue-300">RM</span>
                    <input required type="number" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full pl-7 py-2 bg-transparent border-b-2 border-blue-100 outline-none focus:border-blue-500 font-bold text-slate-700" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-emerald-400 uppercase">Cost Price</label>
                  <div className="relative">
                    <span className="absolute left-0 top-2 text-xs font-bold text-emerald-300">RM</span>
                    <input required type="number" step="0.01" value={newSupplierPrice} onChange={(e) => setNewSupplierPrice(e.target.value)}
                      className="w-full pl-7 py-2 bg-transparent border-b-2 border-emerald-100 outline-none focus:border-emerald-500 font-bold text-slate-700" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Stock</label>
                  <input required type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)}
                    className="w-full py-2 bg-transparent border-b-2 border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700" placeholder="0" />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group">
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                Confirm & Add Product
              </button>
            </form>
          </div>
        </div>
      )}
      {/* EDIT MODAL (stays exactly as you had it) */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-800">Edit Product</h3>
                <p className="text-sm text-slate-500">Update product specifications</p>
              </div>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>

            <form onSubmit={handleUpdateProduct} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Product Name</label>
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Brand</label>
                  <select required value={formData.brand_id} onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none">
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
                  <select required value={formData.inventory_type_id} onChange={(e) => setFormData({ ...formData, inventory_type_id: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none">
                    {inventoryTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Retail Price</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full py-2 bg-transparent border-b-2 border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Cost Price</label>
                  <input required type="number" step="0.01" value={formData.supplier_price} onChange={(e) => setFormData({ ...formData, supplier_price: e.target.value })}
                    className="w-full py-2 bg-transparent border-b-2 border-slate-200 outline-none focus:border-emerald-500 font-bold text-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Stock Level</label>
                  <input required type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full py-2 bg-transparent border-b-2 border-slate-200 outline-none focus:border-blue-500 font-bold text-slate-700" />
                </div>
              </div>

              <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                Update Product
              </button>
            </form>
          </div>
        </div>
      )}

      {isRestockOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 bg-emerald-50/50 border-b border-emerald-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-emerald-800 flex items-center gap-2">
                  <Truck size={24} /> Restock Item
                </h3>
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">{selectedProduct?.name}</p>
              </div>
            </div>

            <form onSubmit={handleRestock} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Quantity</label>
                  <input required type="number" value={restockData.qty}
                    onChange={(e) => setRestockData({ ...restockData, qty: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Supplier Price (RM)</label>
                  <input required type="number" step="0.01" value={restockData.cost}
                    onChange={(e) => setRestockData({ ...restockData, cost: e.target.value })}
                    className="w-full p-3 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0.00" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Upload Receipt</label>
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <input required type="file"
                    onChange={(e) => setRestockData({ ...restockData, file: e.target.files[0] })}
                    className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="text-center">
                    <FileText className="mx-auto text-slate-300 group-hover:text-emerald-500 transition-colors" size={24} />
                    <p className="text-xs text-slate-500 mt-2">
                      {restockData.file ? restockData.file.name : "Click to upload supplier receipt"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsRestockOpen(false)} className="flex-1 py-3 text-slate-500 font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all">
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}