import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from './supabase';
import { Review } from '../../types/models';

const reviewsKey = 'biterunner.demo.reviews';

const demoReviews: Review[] = [
  {
    id: 'review-1',
    order_id: 'demo-order-active',
    customer_id: 'demo-customer',
    restaurant_id: 'rest-flame-house',
    rating: 5,
    comment: 'Amazing burgers and super fast delivery!',
    created_at: '2026-04-28T18:30:00.000Z',
  },
  {
    id: 'review-2',
    order_id: 'demo-order-2',
    customer_id: 'demo-customer',
    restaurant_id: 'rest-mamma-lina',
    rating: 4,
    comment: 'Great pizza, will order again.',
    created_at: '2026-04-27T12:00:00.000Z',
  },
];

export const reviewsService = {
  async submitReview(params: {
    orderId: string;
    customerId: string;
    restaurantId: string;
    rating: number;
    comment: string | null;
  }): Promise<Review> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          order_id: params.orderId,
          customer_id: params.customerId,
          restaurant_id: params.restaurantId,
          rating: params.rating,
          comment: params.comment,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    }

    const review: Review = {
      id: `review-${Date.now()}`,
      order_id: params.orderId,
      customer_id: params.customerId,
      restaurant_id: params.restaurantId,
      rating: params.rating,
      comment: params.comment,
      created_at: new Date().toISOString(),
    };

    const stored = await AsyncStorage.getItem(reviewsKey);
    const existing: Review[] = stored ? JSON.parse(stored) : [...demoReviews];
    existing.push(review);
    await AsyncStorage.setItem(reviewsKey, JSON.stringify(existing));

    return review;
  },

  async getReviewsForRestaurant(restaurantId: string): Promise<Review[]> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    }

    const stored = await AsyncStorage.getItem(reviewsKey);
    const all: Review[] = stored ? JSON.parse(stored) : [...demoReviews];
    return all.filter((r) => r.restaurant_id === restaurantId);
  },

  async getReviewForOrder(orderId: string): Promise<Review | null> {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();
      if (error) throw error;
      return data;
    }

    const stored = await AsyncStorage.getItem(reviewsKey);
    const all: Review[] = stored ? JSON.parse(stored) : [...demoReviews];
    return all.find((r) => r.order_id === orderId) ?? null;
  },
};
