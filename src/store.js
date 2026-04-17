import { create } from 'zustand';
import axios from 'axios';

export const useStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user_data')) || null,
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

    fetchLogs: async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/logs', {
                headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
            });
            set({ logs: Array.isArray(res.data) ? res.data : [] });
        } catch (err) {
            console.error("Failed to fetch logs", err);
            set({ logs: [] }); // Set to empty array on error to prevent crashes
        }
    },

    // --- TRANSACTION ACTIONS ---
    // We removed the manual math because Laravel handles it now!
    addTransaction: async (formData) => {
        try {
            const token = localStorage.getItem('auth_token');

            // We send the entire formData object directly
            await axios.post('http://127.0.0.1:8000/api/add-logs', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // This header is crucial for file uploads
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Refresh the inventory so the new (or updated) product appears
            await get().fetchInventory();

            return true;
        } catch (error) {
            console.error("Transaction failed:", error.response?.data || error.message);
            return false;
        }
    },

    // Used for the initial "Add Product" modal
    addProduct: (newProduct) => set((state) => ({
        inventory: [...state.inventory, newProduct]
    })),

    setInventory: (items) => set({ inventory: items }),

    users: [],
    fetchUsers: async () => {
        const res = await axios.get('http://127.0.0.1:8000/api/users', {
            headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
        });
        set({ users: res.data });
    },
    registerUser: async (userData) => {
        try {
            await axios.post('http://127.0.0.1:8000/api/users', userData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` }
            });
            get().fetchUsers();
            return true;
        } catch (error) {
            return false;
        }
    }
}));