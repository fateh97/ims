import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { UserPlus, Shield, User as UserIcon, Mail, Lock, Loader2 } from 'lucide-react';

export default function UserManagement() {
    const { users, fetchUsers, registerUser } = useStore();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'staff' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await registerUser(formData);
        if (success) {
            setFormData({ name: '', email: '', password: '', role: 'staff' });
            alert("User registered successfully!");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Registration Form */}
            <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-fit">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><UserPlus size={20} /></div>
                    <h2 className="text-xl font-bold text-slate-800">Register Staff</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                        <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Full Name" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                        <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                        <input required type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Min 8 characters" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">System Role</label>
                        <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                            <option value="ceo">CEO</option>
                        </select>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Create Account"}
                    </button>
                </form>
            </div>

            {/* User List */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">User</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <UserIcon size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-400">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}