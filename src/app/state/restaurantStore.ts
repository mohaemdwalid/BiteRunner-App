import { create } from 'zustand';
import { Restaurant, MenuCategory, MenuItem, Order, OrderStatus } from '../../types/models';
import { restaurantsService } from '../services/restaurants.service';
import { menuService } from '../services/menu.service';
import { ordersService } from '../services/orders.service';

interface RestaurantState {
  restaurant: Restaurant | null;
  categories: MenuCategory[];
  menuItems: MenuItem[];
  activeOrders: Order[];
  isLoading: boolean;
  loadAll: (ownerId: string) => Promise<void>;
  setIsOpen: (isOpen: boolean) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  addOrder: (order: Order) => void;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  restaurant: null,
  categories: [],
  menuItems: [],
  activeOrders: [],
  isLoading: false,

  loadAll: async (ownerId) => {
    set({ isLoading: true });
    try {
      const restaurant = await restaurantsService.getByOwner(ownerId);
      if (!restaurant) return;
      const [categories, menuItems, activeOrders] = await Promise.all([
        menuService.getCategories(restaurant.id),
        menuService.getItems(restaurant.id),
        ordersService.getActiveForRestaurant(restaurant.id),
      ]);
      set({ restaurant, categories, menuItems, activeOrders });
    } finally {
      set({ isLoading: false });
    }
  },

  setIsOpen: (isOpen) => {
    const { restaurant } = get();
    if (!restaurant) return;
    set({ restaurant: { ...restaurant, is_open: isOpen } });
    restaurantsService.updateIsOpen(restaurant.id, isOpen).catch(() => {
      set({ restaurant: { ...restaurant, is_open: !isOpen } });
    });
  },

  updateOrderStatus: async (orderId, status) => {
    set((s) => ({
      activeOrders: s.activeOrders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));
    await ordersService.updateStatus(orderId, status);
  },

  addOrder: (order) => set((s) => ({ activeOrders: [order, ...s.activeOrders] })),
}));
