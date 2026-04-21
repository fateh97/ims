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

    addTransaction: async (data) => {
        try {
            const token = localStorage.getItem('auth_token');

            const isFormData = data instanceof FormData;

            const response = await axios.post('http://127.0.0.1:8000/api/add-logs', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': isFormData ? 'multipart/form-data' : 'application/json'
                }
            });

            await get().fetchInventory();

            return response.data;
        } catch (error) {
            console.error("Transaction failed:", error.response?.data || error.message);
            return null;
        }
    },

    // Used for the initial "Add Product" modal
    addProduct: (newProduct) => set((state) => ({
        inventory: [...state.inventory, newProduct]
    })),

    restockProduct: async (id, restockData) => {
        try {
            const token = localStorage.getItem('auth_token');

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('added_stock', restockData.qty);
            formData.append('supplier_price', restockData.cost);
            formData.append('attachment', restockData.file);

            const res = await axios.post(`http://127.0.0.1:8000/api/restock-product/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            // Update the local inventory state immediately
            set((state) => ({
                inventory: state.inventory.map(item => item.id === id ? res.data : item)
            }));

            return { success: true };
        } catch (error) {
            console.error("Restock failed:", error);
            return { success: false, error: error.response?.data?.message };
        }
    },

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
    },

    brands: [],
    fetchBrands: async () => {
        const res = await axios.get('http://127.0.0.1:8000/api/brands');
        set({ brands: res.data });
    },
    addBrand: async (name) => {
        const res = await axios.post('http://127.0.0.1:8000/api/brands', { name });
        set((state) => ({ brands: [...state.brands, res.data] }));
    },

    inventoryTypes: [],
    fetchInventoryTypes: async () => {
        const res = await axios.get('http://127.0.0.1:8000/api/inventory-types');
        set({ inventoryTypes: res.data });
    },
    addInventoryType: async (name, accessory) => {
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/inventory-types', { name, accessory });
            set((state) => ({ inventoryTypes: [...state.inventoryTypes, res.data] }));
            return true;
        } catch (err) { return false; }
    }
}));