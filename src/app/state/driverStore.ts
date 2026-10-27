import { create } from 'zustand';
import { Order } from '../../types/models';
import { driverService } from '../services/driver.service';

interface EarningEntry {
  id: string;
  total: number;
  delivery_fee: number;
  created_at: string;
}

interface DriverState {
  isAvailable: boolean;
  assignedOrder: Order | null;
  earnings: EarningEntry[];
  isLoading: boolean;
  setAvailable: (userId: string, v: boolean) => Promise<void>;
  setAssignedOrder: (order: Order | null) => void;
  loadEarnings: (driverId: string) => Promise<void>;
}

export const useDriverStore = create<DriverState>((set) => ({
  isAvailable: false,
  assignedOrder: null,
  earnings: [],
  isLoading: false,

  setAvailable: async (userId, isAvailable) => {
    set({ isAvailable });
    await driverService.setAvailability(userId, isAvailable).catch(() => {
      set({ isAvailable: !isAvailable });
    });
  },

  setAssignedOrder: (assignedOrder) => set({ assignedOrder }),

  loadEarnings: async (driverId) => {
    set({ isLoading: true });
    try {
      const earnings = await driverService.getEarnings(driverId) as EarningEntry[];
      set({ earnings });
    } finally {
      set({ isLoading: false });
    }
  },
}));
