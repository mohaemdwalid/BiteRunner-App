import {
  Address,
  CartItem,
  MenuCategory,
  MenuItem,
  Order,
  OrderItem,
  Profile,
  Restaurant,
  UserRole,
} from '../../types/models';

const now = '2026-04-29T00:00:00.000Z';

export const demoProfiles = {
  customer: {
    id: 'demo-customer',
    display_name: 'Demo Customer',
    avatar_url: null,
    phone: '+20 100 000 0000',
    role: 'customer',
    push_token: null,
    created_at: now,
  },
  restaurant_owner: {
    id: 'demo-restaurant-owner',
    display_name: 'Demo Restaurant Owner',
    avatar_url: null,
    phone: '+20 101 000 0000',
    role: 'restaurant_owner',
    push_token: null,
    created_at: now,
  },
  driver: {
    id: 'demo-driver',
    display_name: 'Demo Driver',
    avatar_url: null,
    phone: '+20 102 000 0000',
    role: 'driver',
    push_token: null,
    created_at: now,
  },
} satisfies Record<UserRole, Profile>;

export const demoRestaurants: Restaurant[] = [
  {
    id: 'rest-flame-house',
    owner_id: demoProfiles.restaurant_owner.id,
    name: 'Flame House Grill',
    description: 'Charcoal burgers, wraps, and loaded fries from a fast neighborhood grill.',
    cuisine_tags: ['Burgers', 'Grill', 'Fast Food'],
    image_url:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80',
    rating: 4.8,
    review_count: 1240,
    delivery_time: 24,
    delivery_fee: 35,
    min_order: 120,
    is_open: true,
    latitude: 30.0444,
    longitude: 31.2357,
    created_at: now,
  },
  {
    id: 'rest-mamma-lina',
    owner_id: 'demo-owner-2',
    name: 'Mamma Lina Pizza',
    description: 'Wood-fired pizzas, fresh pasta bowls, and warm desserts.',
    cuisine_tags: ['Pizza', 'Italian'],
    image_url:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80',
    rating: 4.7,
    review_count: 980,
    delivery_time: 32,
    delivery_fee: 30,
    min_order: 100,
    is_open: true,
    latitude: 30.0561,
    longitude: 31.2394,
    created_at: now,
  },
  {
    id: 'rest-sushi-lane',
    owner_id: 'demo-owner-3',
    name: 'Sushi Lane',
    description: 'Sushi rolls, rice bowls, and Japanese sides packed for delivery.',
    cuisine_tags: ['Sushi', 'Japanese'],
    image_url:
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1000&q=80',
    rating: 4.6,
    review_count: 742,
    delivery_time: 38,
    delivery_fee: 45,
    min_order: 180,
    is_open: true,
    latitude: 30.0626,
    longitude: 31.2497,
    created_at: now,
  },
  {
    id: 'rest-green-bowl',
    owner_id: 'demo-owner-4',
    name: 'Green Bowl',
    description: 'Fresh salads, protein bowls, smoothies, and balanced plates.',
    cuisine_tags: ['Healthy', 'Bowls', 'Salads'],
    image_url:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
    rating: 4.9,
    review_count: 518,
    delivery_time: 22,
    delivery_fee: 25,
    min_order: 90,
    is_open: true,
    latitude: 30.0502,
    longitude: 31.2333,
    created_at: now,
  },
];

export const demoCategories: MenuCategory[] = [
  { id: 'cat-starters', restaurant_id: 'rest-flame-house', name: 'Starters', sort_order: 1 },
  { id: 'cat-mains', restaurant_id: 'rest-flame-house', name: 'Mains', sort_order: 2 },
  { id: 'cat-drinks', restaurant_id: 'rest-flame-house', name: 'Drinks', sort_order: 3 },
  { id: 'cat-desserts', restaurant_id: 'rest-flame-house', name: 'Desserts', sort_order: 4 },
  { id: 'cat-pizza', restaurant_id: 'rest-mamma-lina', name: 'Pizza', sort_order: 1 },
  { id: 'cat-pasta', restaurant_id: 'rest-mamma-lina', name: 'Pasta', sort_order: 2 },
  { id: 'cat-rolls', restaurant_id: 'rest-sushi-lane', name: 'Rolls', sort_order: 1 },
  { id: 'cat-bowls', restaurant_id: 'rest-green-bowl', name: 'Bowls', sort_order: 1 },
];

export const demoMenuItems: MenuItem[] = [
  {
    id: 'item-smoky-slider',
    restaurant_id: 'rest-flame-house',
    category_id: 'cat-starters',
    name: 'Smoky Beef Sliders',
    description: 'Two mini burgers with cheddar, pickles, and house sauce.',
    price: 95,
    image_url:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    sort_order: 1,
    created_at: now,
  },
  {
    id: 'item-loaded-fries',
    restaurant_id: 'rest-flame-house',
    category_id: 'cat-starters',
    name: 'Loaded Fries',
    description: 'Crispy fries topped with cheese sauce, jalapenos, and grilled onions.',
    price: 75,
    image_url:
      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    sort_order: 2,
    created_at: now,
  },
  {
    id: 'item-signature-burger',
    restaurant_id: 'rest-flame-house',
    category_id: 'cat-mains',
    name: 'Signature Flame Burger',
    description: 'Double beef patty, smoked cheese, lettuce, tomato, and flame sauce.',
    price: 165,
    image_url:
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    sort_order: 3,
    created_at: now,
  },
  {
    id: 'item-grilled-chicken-wrap',
    restaurant_id: 'rest-flame-house',
    category_id: 'cat-mains',
    name: 'Grilled Chicken Wrap',
    description: 'Charred chicken, garlic mayo, greens, and pickles in toasted flatbread.',
    price: 135,
    image_url:
      'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    sort_order: 4,
    created_at: now,
  },
  {
    id: 'item-lemon-mint',
    restaurant_id: 'rest-flame-house',
    category_id: 'cat-drinks',
    name: 'Lemon Mint Cooler',
    description: 'Fresh lemon, mint, crushed ice, and a light sparkle.',
    price: 45,
    image_url:
      'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    sort_order: 5,
    created_at: now,
  },
  {
    id: 'item-chocolate-skillet',
    restaurant_id: 'rest-flame-house',
    category_id: 'cat-desserts',
    name: 'Chocolate Cookie Skillet',
    description: 'Warm cookie dough with chocolate chunks and vanilla cream.',
    price: 85,
    image_url:
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    sort_order: 6,
    created_at: now,
  },
  {
    id: 'item-margherita',
    restaurant_id: 'rest-mamma-lina',
    category_id: 'cat-pizza',
    name: 'Classic Margherita',
    description: 'Tomato sauce, mozzarella, basil, and olive oil.',
    price: 145,
    image_url:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    sort_order: 1,
    created_at: now,
  },
  {
    id: 'item-salmon-roll',
    restaurant_id: 'rest-sushi-lane',
    category_id: 'cat-rolls',
    name: 'Salmon Crunch Roll',
    description: 'Salmon, cucumber, spicy mayo, and crispy tempura flakes.',
    price: 210,
    image_url:
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    sort_order: 1,
    created_at: now,
  },
  {
    id: 'item-protein-bowl',
    restaurant_id: 'rest-green-bowl',
    category_id: 'cat-bowls',
    name: 'Chicken Protein Bowl',
    description: 'Grilled chicken, quinoa, avocado, greens, and lemon tahini.',
    price: 155,
    image_url:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    is_available: true,
    sort_order: 1,
    created_at: now,
  },
];

export function demoAddresses(userId: string): Address[] {
  return [
    {
      id: 'addr-home',
      user_id: userId,
      label: 'Home',
      line1: '12 Nile Street, Maadi',
      city: 'Cairo',
      latitude: 29.9602,
      longitude: 31.2569,
      is_default: true,
    },
    {
      id: 'addr-work',
      user_id: userId,
      label: 'Work',
      line1: 'Tahrir Square, Downtown',
      city: 'Cairo',
      latitude: 30.0444,
      longitude: 31.2357,
      is_default: false,
    },
  ];
}

export function makeDemoProfile(
  id: string,
  displayName: string,
  email: string,
  role: UserRole,
): Profile {
  return {
    ...demoProfiles[role],
    id,
    display_name: displayName || email.split('@')[0] || demoProfiles[role].display_name,
    role,
  };
}

export function orderItemsFromCart(orderId: string, items: CartItem[]): OrderItem[] {
  return items.map((item) => ({
    id: `${orderId}-${item.menuItem.id}`,
    order_id: orderId,
    menu_item_id: item.menuItem.id,
    name: item.menuItem.name,
    price: item.menuItem.price,
    quantity: item.quantity,
    special_instructions: item.specialInstructions ?? null,
  }));
}

export function demoOrder(customerId: string): Order {
  const restaurant = demoRestaurants[0];
  return {
    id: 'demo-order-active',
    customer_id: customerId,
    restaurant_id: restaurant.id,
    driver_id: demoProfiles.driver.id,
    status: 'on_the_way',
    delivery_address_snapshot: demoAddresses(customerId)[0],
    subtotal: 260,
    delivery_fee: restaurant.delivery_fee,
    discount: 25,
    total: 270,
    promo_code: 'RUNNER10',
    payment_intent_id: null,
    estimated_delivery_minutes: 14,
    notes: null,
    created_at: now,
    updated_at: now,
    restaurant,
    items: [
      {
        id: 'demo-order-item-1',
        order_id: 'demo-order-active',
        menu_item_id: 'item-signature-burger',
        name: 'Signature Flame Burger',
        price: 165,
        quantity: 1,
        special_instructions: null,
      },
      {
        id: 'demo-order-item-2',
        order_id: 'demo-order-active',
        menu_item_id: 'item-loaded-fries',
        name: 'Loaded Fries',
        price: 75,
        quantity: 1,
        special_instructions: null,
      },
    ],
  };
}
