-- BiteRunner Supabase Schema
-- Run this migration in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'restaurant_owner', 'driver')),
  push_token text,
  is_available boolean default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Profiles are publicly readable" on profiles for select using (true);

-- Restaurants
create table restaurants (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  cuisine_tags text[] not null default '{}',
  image_url text,
  rating numeric(3,2) not null default 0,
  review_count integer not null default 0,
  delivery_time integer not null default 30,
  delivery_fee integer not null default 0,
  min_order integer not null default 0,
  is_open boolean not null default true,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

alter table restaurants enable row level security;
create policy "Restaurants are publicly readable" on restaurants for select using (true);
create policy "Owners can manage their restaurant" on restaurants for all using (auth.uid() = owner_id);

-- Menu Categories
create table menu_categories (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0
);

alter table menu_categories enable row level security;
create policy "Categories are publicly readable" on menu_categories for select using (true);
create policy "Owners can manage categories" on menu_categories for all using (
  exists (select 1 from restaurants where id = menu_categories.restaurant_id and owner_id = auth.uid())
);

-- Menu Items
create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id uuid references menu_categories(id) on delete set null,
  name text not null,
  description text,
  price integer not null default 0,
  image_url text,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table menu_items enable row level security;
create policy "Menu items are publicly readable" on menu_items for select using (true);
create policy "Owners can manage menu items" on menu_items for all using (
  exists (select 1 from restaurants where id = menu_items.restaurant_id and owner_id = auth.uid())
);

-- Addresses
create table addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  label text not null,
  line1 text not null,
  city text not null,
  latitude double precision,
  longitude double precision,
  is_default boolean not null default false
);

alter table addresses enable row level security;
create policy "Users can manage own addresses" on addresses for all using (auth.uid() = user_id);

-- Orders
create table orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id),
  restaurant_id uuid not null references restaurants(id),
  driver_id uuid references profiles(id),
  status text not null default 'pending' check (status in ('pending','confirmed','preparing','ready','picked_up','on_the_way','delivered','cancelled')),
  delivery_address_snapshot jsonb not null,
  subtotal integer not null default 0,
  delivery_fee integer not null default 0,
  discount integer not null default 0,
  total integer not null default 0,
  promo_code text,
  payment_intent_id text,
  estimated_delivery_minutes integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table orders enable row level security;
create policy "Customers see own orders" on orders for select using (auth.uid() = customer_id);
create policy "Restaurants see own orders" on orders for select using (
  exists (select 1 from restaurants where id = orders.restaurant_id and owner_id = auth.uid())
);
create policy "Drivers see assigned orders" on orders for select using (auth.uid() = driver_id);
create policy "Customers can create orders" on orders for insert with check (auth.uid() = customer_id);
create policy "Restaurants can update order status" on orders for update using (
  exists (select 1 from restaurants where id = orders.restaurant_id and owner_id = auth.uid())
);

-- Order Items
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  name text not null,
  price integer not null default 0,
  quantity integer not null default 1,
  special_instructions text
);

alter table order_items enable row level security;
create policy "Order items readable via order" on order_items for select using (
  exists (select 1 from orders where id = order_items.order_id and (auth.uid() = customer_id or auth.uid() = driver_id or exists (select 1 from restaurants where id = orders.restaurant_id and owner_id = auth.uid())))
);

-- Driver Locations (Realtime tracked)
create table driver_locations (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid not null references profiles(id),
  order_id uuid not null references orders(id),
  latitude double precision not null,
  longitude double precision not null,
  updated_at timestamptz not null default now(),
  unique(driver_id, order_id)
);

alter table driver_locations enable row level security;
create policy "Driver can update own location" on driver_locations for all using (auth.uid() = driver_id);
create policy "Customer can track assigned driver" on driver_locations for select using (
  exists (select 1 from orders where id = driver_locations.order_id and auth.uid() = customer_id)
);

-- Enable Realtime for driver_locations and orders
alter publication supabase_realtime add table driver_locations;
alter publication supabase_realtime add table orders;

-- Reviews
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id),
  customer_id uuid not null references profiles(id),
  restaurant_id uuid not null references restaurants(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(order_id)
);

alter table reviews enable row level security;
create policy "Reviews are publicly readable" on reviews for select using (true);
create policy "Customers can review own orders" on reviews for insert with check (auth.uid() = customer_id);

-- Promo Codes
create table promo_codes (
  code text primary key,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value integer not null default 0,
  min_order integer not null default 0,
  expires_at timestamptz,
  max_uses integer,
  current_uses integer not null default 0,
  is_active boolean not null default true
);

alter table promo_codes enable row level security;
create policy "Active promo codes are publicly readable" on promo_codes for select using (is_active = true);
