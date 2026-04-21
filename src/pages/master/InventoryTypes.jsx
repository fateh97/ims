import { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Layers, Plus, Loader2, Package, Edit3, X } from 'lucide-react';

export default function InventoryTypesPage() {

  const { types, fetchInventoryTypes, addInventoryType } = useStore();
  const [typeName, setTypeName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAccessory, setIsAccessory] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [editData, setEditData] = useState({ name: "", prefix: "", accessory: false });
  const { updateInventoryType } = useStore();

  useEffect(() => { fetchInventoryTypes(); }, []);

  const openEditModal = (type) => {
    setEditingType(type);
    setEditData({
      name: type.name,
      prefix: type.prefix || "",
      accessory: Boolean(type.accessory) // Ensure it's a boolean
    });
    setIsEditOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!typeName.trim()) return;
    //console.log("Sending to backend:", { name: typeName, accessory: isAccessory });
    setIsSaving(true);
    const success = await addInventoryType(typeName, prefix, isAccessory);
    if (success) {
      setTypeName("");
      setPrefix("");
      setIsAccessory(false);
    }
    setIsSaving(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const success = await updateInventoryType(editingType.id, editData);
    if (success) {
      setIsEditOpen(false);
      setEditingType(null);
    } else {
      alert("Update failed!");
    }
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

            <input
              required
              maxLength="5"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())} // Auto-uppercase
              className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center"
              placeholder="Prefix (BALL)"
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
          {types.length > 0 ? (
            types.map(type => (
              <div key={type.id} className="group p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 rounded-lg transition-colors">
                  <Package size={18} />
                </div>
                <span className="font-bold text-slate-700">{type.name}</span>
                <button
                  onClick={() => openEditModal(type)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit3 size={18} />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-slate-400 italic">
              No inventory types set yet.
            </div>
          )}
        </div>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Edit Category</h3>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Update Master Data</p>
                </div>
                <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-8 space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Category Name</label>
                  <input required value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Prefix (Short Code)</label>
                  <input required maxLength="5" value={editData.prefix}
                    onChange={(e) => setEditData({ ...editData, prefix: e.target.value.toUpperCase() })}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase">Classification</span>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setEditData({ ...editData, accessory: false })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!editData.accessory ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400'}`}>
                      Main Item
                    </button>
                    <button type="button" onClick={() => setEditData({ ...editData, accessory: true })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${editData.accessory ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400'}`}>
                      Accessory
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-4 text-slate-400 font-bold">Cancel</button>
                  <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-lg">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>


  );
}