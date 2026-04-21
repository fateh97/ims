import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Layers, Plus, Loader2, Package } from 'lucide-react';

export default function InventoryTypesPage() {
  const { inventoryTypes, fetchInventoryTypes, addInventoryType } = useStore();
  const [typeName, setTypeName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAccessory, setIsAccessory] = useState(false);

  useEffect(() => { fetchInventoryTypes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!typeName.trim()) return;
    console.log("Sending to backend:", { name: typeName, accessory: isAccessory });
    setIsSaving(true);
    const success = await addInventoryType(typeName, isAccessory);
    if (success) {
      setTypeName("");
      setIsAccessory(false);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Layers size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Inventory Types</h2>
            <p className="text-sm text-slate-500">Manage categories like Bowling Ball, Glove, or Shoes</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-10">
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              required
              value={typeName} 
              onChange={(e) => setTypeName(e.target.value)}
              className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="New Category Name (e.g. Grip)..."
            />

            <button 
              disabled={isSaving}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
              Add Type
            </button>
          </div>

          {/* ACCESSORY RADIO TOGGLE */}
          <div className="flex items-center gap-6 px-2">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Type Classification:</span>
            
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="classification"
                checked={!isAccessory}
                onChange={() => setIsAccessory(false)}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!isAccessory ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                {!isAccessory && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className={`text-sm font-bold ${!isAccessory ? 'text-slate-800' : 'text-slate-400'}`}>Main Item</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                name="classification"
                checked={isAccessory}
                onChange={() => setIsAccessory(true)}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isAccessory ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                {isAccessory && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className={`text-sm font-bold ${isAccessory ? 'text-slate-800' : 'text-slate-400'}`}>Accessory</span>
            </label>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {inventoryTypes.length > 0 ? (
            inventoryTypes.map(type => (
              <div key={type.id} className="group p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 rounded-lg transition-colors">
                  <Package size={18} />
                </div>
                <span className="font-bold text-slate-700">{type.name}</span>
              </div>
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-slate-400 italic">
              No inventory types defined yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}