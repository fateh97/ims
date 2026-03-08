import {create} from 'zustand';

export const useStore = create((set) => ({
    user: null,
    inventory: [
    { id: 1, name: "Dell G15 Laptop", sku: "LP-001", stock: 10, price: 1200 },
    { id: 2, name: "Logitech MX Mouse", sku: "MS-992", stock: 45, price: 99 },
    ],
    logs: [],
    login: (userData)=> set({ user: userData }),
    logout: () => set({ user: null }),

    addProduct: (newProduct) => set((state) => ({
        inventory: [...state.inventory, newProduct]
    })),

    // This function handles the IN and OUT logic
    addTransaction: (productId, qty, type, ref) => set((state) => {
        const updatedInventory = state.inventory.map(item => {
        if (item.id === productId) {
            // If 'OUT', we subtract. If 'IN', we add.
            const newStock = type === 'OUT' ? item.stock - qty : item.stock + qty;
            return { ...item, stock: newStock };
        }
        return item;
        });

    const product = state.inventory.find(p => p.id === productId);
    const newLog = {
      id: Date.now(),
      productName: product.name,
      type, // 'IN' or 'OUT'
      qty,
      ref,
      date: new Date().toLocaleString()
    };

    return { 
      inventory: updatedInventory, 
      logs: [newLog, ...state.logs] 
    };
  }),
}));