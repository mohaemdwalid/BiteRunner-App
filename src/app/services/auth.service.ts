import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeDemoProfile } from '../data/demoData';
import { supabase, isSupabaseConfigured } from './supabase';
import { UserRole } from '../../types/models';

const DEMO_PROFILE_KEY = 'biterunner.demo.profile';

export const authService = {
  async signUp(email: string, password: string, displayName: string, role: UserRole) {
    if (!isSupabaseConfigured) {
      const profile = makeDemoProfile(`demo-${role}`, displayName, email, role);
      await AsyncStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));
      return { user: { id: profile.id, email }, session: { user: { id: profile.id, email } } } as any;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName, role } },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured) {
      const stored = await AsyncStorage.getItem(DEMO_PROFILE_KEY);
      const profile = stored ? JSON.parse(stored) : makeDemoProfile('demo-customer', '', email, 'customer');
      await AsyncStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));
      return { user: { id: profile.id, email }, session: { user: { id: profile.id, email } } } as any;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async resetPassword(email: string) {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      await AsyncStorage.removeItem(DEMO_PROFILE_KEY);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    if (!isSupabaseConfigured) {
      const stored = await AsyncStorage.getItem(DEMO_PROFILE_KEY);
      if (!stored) return null;
      const profile = JSON.parse(stored);
      return { user: { id: profile.id } } as any;
    }

    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    if (!isSupabaseConfigured) {
      return { data: { subscription: { unsubscribe: () => undefined } } } as any;
    }

    return supabase.auth.onAuthStateChange(callback);
  },
};
