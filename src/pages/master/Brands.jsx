import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Tag, Plus, Loader2 } from 'lucide-react';

export default function BrandsPage() {
  const { brands, fetchBrands, addBrand } = useStore();
  const [newBrand, setNewBrand] = useState("");

  useEffect(() => { fetchBrands(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newBrand) return;
    await addBrand(newBrand);
    setNewBrand("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Tag className="text-blue-500" /> Brand List
        </h2>
        
        <form onSubmit={handleAdd} className="flex gap-4 mb-8">
          <input 
            value={newBrand} 
            onChange={(e) => setNewBrand(e.target.value)}
            className="flex-1 p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter brand name (e.g. Hero)..."
          />
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
            <Plus size={20} /> Add Brand
          </button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {brands.map(brand => (
            <div key={brand.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center font-bold text-slate-700">
              {brand.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}