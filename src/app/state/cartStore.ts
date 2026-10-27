import { create } from 'zustand';
import { CartItem, MenuItem } from '../../types/models';

interface CartState {
  restaurantId: string | null;
  items: CartItem[];
  promoCode: string | null;
  discount: number;

  addItem: (menuItem: MenuItem, restaurantId: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  setPromo: (code: string | null, discount: number) => void;
  clearCart: () => void;

  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  restaurantId: null,
  items: [],
  promoCode: null,
  discount: 0,

  addItem: (menuItem, restaurantId) => {
    const state = get();
    const currentItems = state.restaurantId && state.restaurantId !== restaurantId ? [] : state.items;
    const existing = currentItems.find((i) => i.menuItem.id === menuItem.id);
    if (existing) {
      set({
        restaurantId,
        promoCode: state.restaurantId === restaurantId ? state.promoCode : null,
        discount: state.restaurantId === restaurantId ? state.discount : 0,
        items: currentItems.map((i) =>
          i.menuItem.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({
        restaurantId,
        promoCode: state.restaurantId === restaurantId ? state.promoCode : null,
        discount: state.restaurantId === restaurantId ? state.discount : 0,
        items: [...currentItems, { menuItem, quantity: 1 }],
      });
    }
  },

  removeItem: (menuItemId) => {
    set((s) => ({ items: s.items.filter((i) => i.menuItem.id !== menuItemId) }));
  },

  updateQuantity: (menuItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(menuItemId);
      return;
    }
    set((s) => ({
      items: s.items.map((i) => (i.menuItem.id === menuItemId ? { ...i, quantity } : i)),
    }));
  },

  setPromo: (promoCode, discount) => set({ promoCode, discount }),

  clearCart: () => set({ restaurantId: null, items: [], promoCode: null, discount: 0 }),

  subtotal: () => get().items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0),
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
