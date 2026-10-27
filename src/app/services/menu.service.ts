import { demoCategories, demoMenuItems } from '../data/demoData';
import { supabase, isSupabaseConfigured } from './supabase';
import { MenuCategory, MenuItem } from '../../types/models';

export const menuService = {
  async getCategories(restaurantId: string): Promise<MenuCategory[]> {
    if (!isSupabaseConfigured) {
      return demoCategories
        .filter((category) => category.restaurant_id === restaurantId)
        .sort((a, b) => a.sort_order - b.sort_order);
    }

    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order');
    if (error) throw error;
    return data ?? [];
  },

  async getItems(restaurantId: string): Promise<MenuItem[]> {
    if (!isSupabaseConfigured) {
      return demoMenuItems
        .filter((item) => item.restaurant_id === restaurantId)
        .sort((a, b) => a.sort_order - b.sort_order);
    }

    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order');
    if (error) throw error;
    return data ?? [];
  },

  async addItem(item: Omit<MenuItem, 'id' | 'created_at'>): Promise<MenuItem> {
    if (!isSupabaseConfigured) {
      return {
        ...item,
        id: `demo-menu-item-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('menu_items')
      .insert(item)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateItem(id: string, updates: Partial<MenuItem>) {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.from('menu_items').update(updates).eq('id', id);
    if (error) throw error;
  },

  async deleteItem(id: string) {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
  },

  async toggleAvailability(id: string, isAvailable: boolean) {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: isAvailable })
      .eq('id', id);
    if (error) throw error;
  },
};
