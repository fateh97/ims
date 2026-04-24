import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { UserPlus, Shield, User as UserIcon, Mail, Lock, Loader2, Edit3, X } from 'lucide-react';

export default function UserManagement() {
    const { users, fetchUsers, registerUser, updateUser } = useStore();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'staff' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null); // Track if we are editing

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleEditClick = (user) => {
        setEditingId(user.id);
        setFormData({ 
            name: user.name, 
            email: user.email, 
            password: '', // Keep password blank unless changing
            role: user.role 
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', email: '', password: '', role: 'staff' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        let success;
        if (editingId) {
            // Update existing user
            success = await updateUser(editingId, formData);
        } else {
            // Register new user
            success = await registerUser(formData);
        }

        if (success) {
            cancelEdit();
            alert(editingId ? "User updated successfully!" : "User registered successfully!");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className={`lg:col-span-1 bg-white p-8 rounded-3xl border shadow-sm h-fit transition-all ${editingId ? 'border-amber-200 ring-2 ring-amber-50' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${editingId ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                            {editingId ? <Edit3 size={20} /> : <UserPlus size={20} />}
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {editingId ? "Edit Employee" : "Register Staff"}
                        </h2>
                    </div>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-slate-400 hover:text-rose-500">
                            <X size={20} />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                        <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Password {editingId && <span className="text-[10px] lowercase font-normal">(leave blank to keep current)</span>}
                        </label>
                        <input required={!editingId} type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="********" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">System Role</label>
                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                            <option value="ceo">CEO</option>
                            <option value="superadmin">Superadmin</option>
                        </select>
                    </div>
                    <button type="submit" disabled={isSubmitting} className={`w-full py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-900 hover:bg-slate-800'}`}>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : (editingId ? "Save Changes" : "Create Account")}
                    </button>
                </form>
            </div>

            {/* User List Section */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Employee</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(u => (
                            <tr key={u.id} className={editingId === u.id ? 'bg-amber-50/30' : ''}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <UserIcon size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{u.name}</p>
                                            <p className="text-xs text-slate-500">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${u.role === 'admin' ? 'bg-amber-50 text-amber-600' : u.role === 'superadmin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleEditClick(u)}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        <Edit3 size={14} />
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}