import { create } from 'zustand';
import { Order, OrderStatus } from '../../types/models';
import { ordersService } from '../services/orders.service';

interface OrderState {
  activeOrder: Order | null;
  orderHistory: Order[];
  isLoading: boolean;
  setActiveOrder: (order: Order | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  loadHistory: (customerId: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  activeOrder: null,
  orderHistory: [],
  isLoading: false,

  setActiveOrder: (activeOrder) => set({ activeOrder }),

  updateOrderStatus: (orderId, status) => {
    const { activeOrder } = get();
    if (activeOrder?.id === orderId) {
      set({ activeOrder: { ...activeOrder, status } });
    }
    set((s) => ({
      orderHistory: s.orderHistory.map((o) => (o.id === orderId ? { ...o, status } : o)),
    }));
  },

  loadHistory: async (customerId) => {
    set({ isLoading: true });
    try {
      const orders = await ordersService.getHistory(customerId);
      set({ orderHistory: orders });
    } finally {
      set({ isLoading: false });
    }
  },
}));
