import AsyncStorage from '@react-native-async-storage/async-storage';
import { demoProfiles } from '../data/demoData';
import { supabase, isSupabaseConfigured } from './supabase';
import { Profile } from '../../types/models';

const DEMO_PROFILE_KEY = 'biterunner.demo.profile';

export const profileService = {
  async get(userId: string): Promise<Profile> {
    if (!isSupabaseConfigured) {
      const stored = await AsyncStorage.getItem(DEMO_PROFILE_KEY);
      if (stored) return JSON.parse(stored);
      return userId === demoProfiles.driver.id ? demoProfiles.driver : demoProfiles.customer;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async update(userId: string, updates: Partial<Profile>) {
    if (!isSupabaseConfigured) {
      const profile = await this.get(userId);
      await AsyncStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify({ ...profile, ...updates }));
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (error) throw error;
  },

  async updatePushToken(userId: string, token: string) {
    if (!isSupabaseConfigured) {
      await this.update(userId, { push_token: token });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId);
    if (error) throw error;
  },
};
