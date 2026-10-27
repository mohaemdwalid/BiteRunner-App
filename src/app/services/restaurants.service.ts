import { demoRestaurants } from '../data/demoData';
import { supabase, isSupabaseConfigured } from './supabase';
import { Restaurant } from '../../types/models';

export const restaurantsService = {
  async list(cuisineTag?: string): Promise<Restaurant[]> {
    if (!isSupabaseConfigured) {
      return demoRestaurants
        .filter((restaurant) => restaurant.is_open)
        .filter((restaurant) => !cuisineTag || restaurant.cuisine_tags.includes(cuisineTag))
        .sort((a, b) => b.rating - a.rating);
    }

    let query = supabase.from('restaurants').select('*').eq('is_open', true).order('rating', { ascending: false });
    if (cuisineTag) query = query.contains('cuisine_tags', [cuisineTag]);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async search(term: string): Promise<Restaurant[]> {
    if (!isSupabaseConfigured) {
      const normalized = term.trim().toLowerCase();
      if (!normalized) return this.list();
      return demoRestaurants.filter((restaurant) => {
        const haystack = `${restaurant.name} ${restaurant.description ?? ''} ${restaurant.cuisine_tags.join(' ')}`.toLowerCase();
        return restaurant.is_open && haystack.includes(normalized);
      });
    }

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .ilike('name', `%${term}%`)
      .eq('is_open', true);
    if (error) throw error;
    return data ?? [];
  },

  async getById(id: string): Promise<Restaurant> {
    if (!isSupabaseConfigured) {
      const restaurant = demoRestaurants.find((item) => item.id === id) ?? demoRestaurants[0];
      return restaurant;
    }

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByOwner(ownerId: string): Promise<Restaurant | null> {
    if (!isSupabaseConfigured) {
      const restaurant = demoRestaurants.find((item) => item.owner_id === ownerId) ?? demoRestaurants[0];
      return { ...restaurant, owner_id: ownerId };
    }

    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', ownerId)
      .single();
    return data;
  },

  async updateIsOpen(id: string, isOpen: boolean) {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('restaurants')
      .update({ is_open: isOpen })
      .eq('id', id);
    if (error) throw error;
  },
};
