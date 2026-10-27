import AsyncStorage from '@react-native-async-storage/async-storage';
import { demoOrder, demoRestaurants, orderItemsFromCart } from '../data/demoData';
import { supabase, isSupabaseConfigured } from './supabase';
import { Order, OrderItem, OrderStatus, CartItem, Address } from '../../types/models';

const demoOrdersKey = (customerId: string) => `biterunner.demo.orders.${customerId}`;

async function getDemoOrders(customerId: string): Promise<Order[]> {
  const stored = await AsyncStorage.getItem(demoOrdersKey(customerId));
  const saved = stored ? JSON.parse(stored) as Order[] : [];
  return [...saved, demoOrder(customerId)];
}

export const ordersService = {
  async createOrder(params: {
    customerId: string;
    restaurantId: string;
    items: CartItem[];
    address: Address;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    promoCode: string | null;
    paymentIntentId: string | null;
    notes?: string;
  }): Promise<Order> {
    if (!isSupabaseConfigured) {
      const id = `demo-order-${Date.now()}`;
      const restaurant = demoRestaurants.find((item) => item.id === params.restaurantId);
      const items = orderItemsFromCart(id, params.items);
      const order: Order = {
        id,
        customer_id: params.customerId,
        restaurant_id: params.restaurantId,
        driver_id: 'demo-driver',
        status: 'confirmed',
        delivery_address_snapshot: params.address,
        subtotal: params.subtotal,
        delivery_fee: params.deliveryFee,
        discount: params.discount,
        total: params.total,
        promo_code: params.promoCode,
        payment_intent_id: params.paymentIntentId,
        estimated_delivery_minutes: 32,
        notes: params.notes ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        restaurant,
        items,
      };
      const existing = await getDemoOrders(params.customerId);
      await AsyncStorage.setItem(demoOrdersKey(params.customerId), JSON.stringify([order, ...existing.filter((item) => item.id !== 'demo-order-active')]));
      return order;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: params.customerId,
        restaurant_id: params.restaurantId,
        status: 'pending',
        delivery_address_snapshot: params.address,
        subtotal: params.subtotal,
        delivery_fee: params.deliveryFee,
        discount: params.discount,
        total: params.total,
        promo_code: params.promoCode,
        payment_intent_id: params.paymentIntentId,
        notes: params.notes ?? null,
        estimated_delivery_minutes: 35,
      })
      .select()
      .single();
    if (orderError) throw orderError;

    const orderItems = params.items.map((ci) => ({
      order_id: order.id,
      menu_item_id: ci.menuItem.id,
      name: ci.menuItem.name,
      price: ci.menuItem.price,
      quantity: ci.quantity,
      special_instructions: ci.specialInstructions ?? null,
    }));
    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    return order;
  },

  async getById(id: string): Promise<Order> {
    if (!isSupabaseConfigured) {
      const storedKeys = ['demo-customer', 'demo-restaurant_owner', 'demo-driver'];
      for (const key of storedKeys) {
        const order = (await getDemoOrders(key)).find((item) => item.id === id);
        if (order) return order;
      }
      return demoOrder('demo-customer');
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, restaurant:restaurants(*), items:order_items(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getHistory(customerId: string): Promise<Order[]> {
    if (!isSupabaseConfigured) return getDemoOrders(customerId);

    const { data, error } = await supabase
      .from('orders')
      .select('*, restaurant:restaurants(name, image_url), items:order_items(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getActiveForRestaurant(restaurantId: string): Promise<Order[]> {
    if (!isSupabaseConfigured) {
      return [demoOrder('demo-customer')].filter((order) => order.restaurant_id === restaurantId);
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('restaurant_id', restaurantId)
      .not('status', 'in', '("delivered","cancelled")')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async updateStatus(id: string, status: OrderStatus) {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async assignDriver(orderId: string, driverId: string) {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('orders')
      .update({ driver_id: driverId, status: 'picked_up' })
      .eq('id', orderId);
    if (error) throw error;
  },
};
