import { demoAddresses } from '../data/demoData';
import { supabase, isSupabaseConfigured } from './supabase';
import { Address } from '../../types/models';

export const addressesService = {
  async list(userId: string): Promise<Address[]> {
    if (!isSupabaseConfigured) return demoAddresses(userId);

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async add(address: Omit<Address, 'id'>): Promise<Address> {
    if (!isSupabaseConfigured) return { ...address, id: `demo-address-${Date.now()}` };

    const { data, error } = await supabase
      .from('addresses')
      .insert(address)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async setDefault(id: string, userId: string) {
    if (!isSupabaseConfigured) return;

    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId);
    const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) throw error;
  },
};
