export type UserRole = 'customer' | 'restaurant_owner' | 'driver';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  phone: string | null;
  role: UserRole;
  push_token: string | null;
  created_at: string;
}

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  cuisine_tags: string[];
  image_url: string | null;
  rating: number;
  review_count: number;
  delivery_time: number;
  delivery_fee: number;
  min_order: number;
  is_open: boolean;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  restaurant_id: string;
  name: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
  created_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  line1: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string;
  driver_id: string | null;
  status: OrderStatus;
  delivery_address_snapshot: Address;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  promo_code: string | null;
  payment_intent_id: string | null;
  estimated_delivery_minutes: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  restaurant?: Restaurant;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  price: number;
  quantity: number;
  special_instructions: string | null;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface DriverLocation {
  id: string;
  driver_id: string;
  order_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  customer_id: string;
  restaurant_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface PromoCode {
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order: number;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
}
