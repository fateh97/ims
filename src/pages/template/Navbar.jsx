import { useStore } from '../store';
import { User, Bell, Search } from 'lucide-react';

export default function Navbar() {
    const { user } = useStore();

    return (
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
            {/* Left Side: Welcome Message */}
            <div>
                <h1 className="text-slate-400 text-sm font-medium">
                    Welcome to <span className="text-blue-600 font-bold">WBM ProShop</span>
                </h1>
                <p className="text-slate-800 font-black text-lg">
                    Hello, {user?.name || 'Manager'}! 👋
                </p>
            </div>

            {/* Right Side: Search & Profile */}
            <div className="flex items-center gap-6">
                {/* Quick Search */}
                <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-64">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="bg-transparent border-none outline-none text-sm px-2 w-full"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                </button>

                {/* User Profile Info */}
                <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-800 leading-none">{user?.name || 'Admin'}</p>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tight mt-1">
                            {user?.role || 'Staff'}
                        </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
}