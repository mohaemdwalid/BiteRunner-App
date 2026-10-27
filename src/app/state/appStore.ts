import { create } from 'zustand';
import { Profile, UserRole } from '../../types/models';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';

interface AppState {
  userId: string | null;
  role: UserRole | null;
  isOnboarded: boolean;
  isLoading: boolean;
  profile: Profile | null;
  setUserId: (id: string | null) => void;
  setRole: (role: UserRole | null) => void;
  setOnboarded: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  loadProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  userId: null,
  role: null,
  isOnboarded: false,
  isLoading: true,
  profile: null,

  setUserId: (userId) => set({ userId }),
  setRole: (role) => set({ role }),
  setOnboarded: (isOnboarded) => set({ isOnboarded }),
  setLoading: (isLoading) => set({ isLoading }),

  loadProfile: async (userId) => {
    try {
      const profile = await profileService.get(userId);
      set({ profile, role: profile.role, userId });
    } catch {
      set({ userId: null, profile: null, role: null });
    }
  },

  signOut: async () => {
    await authService.signOut();
    set({ userId: null, role: null, profile: null });
  },

  reset: () => set({ userId: null, role: null, profile: null, isLoading: false }),
}));
