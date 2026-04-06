import { create } from 'zustand';
import axios from 'axios';

export const useStore = create((set, get) => ({
    user: null,
    inventory: [],
    logs: [],

    // --- AUTH ACTIONS ---
    login: (userData) => set({ user: userData }),
    logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null });
    },

    // --- FETCH ACTIONS ---
    // This is the line you needed! It fetches the latest data from MySQL
    fetchInventory: async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await axios.get('http://127.0.0.1:8000/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = Array.isArray(response.data[0]) ? response.data[0] : response.data;
            set({ inventory: data });
        } catch (error) {
            console.error("Fetch Inventory Error:", error);
        }
    },

    // --- TRANSACTION ACTIONS ---
    // We removed the manual math because Laravel handles it now!
    addTransaction: async (productId, type, qty, ref) => {
        try {
            const token = localStorage.getItem('auth_token');
            
            // 1. Tell Laravel to record the log and update stock
            await axios.post('http://127.0.0.1:8000/api/add-logs', {
                product_id: productId,
                type: type,
                qty: qty,
                ref: ref
            }, {
                headers: { Authorization: `Bearer ${token}` },
                'Content-Type': 'multipart/form-data'
            });

            // 2. Refresh the inventory in React so the user sees the new stock numbers
            await get().fetchInventory();

            return true;
        } catch (error) {
            console.error("Transaction failed:", error);
            return false;
        }
    },

    // Used for the initial "Add Product" modal
    addProduct: (newProduct) => set((state) => ({
        inventory: [...state.inventory, newProduct]
    })),

    setInventory: (items) => set({ inventory: items }),
}));