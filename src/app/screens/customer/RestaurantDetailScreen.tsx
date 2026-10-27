import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Bike, ChevronLeft, Clock3, Heart } from 'lucide-react-native';
import { MenuCategory, MenuItem, Restaurant } from '../../../types/models';
import { menuService } from '../../services/menu.service';
import { restaurantsService } from '../../services/restaurants.service';
import { useCartStore } from '../../state/cartStore';
import CartButton from '../../components/CartButton';
import MenuItemRow from '../../components/MenuItemRow';
import RatingStars from '../../components/RatingStars';
import { formatCurrency } from '../../utils/formatCurrency';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function RestaurantDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const restaurantId = route.params?.restaurantId as string | undefined;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const cartRestaurantId = useCartStore((state) => state.restaurantId);
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) => state.subtotal());
  const itemCount = useCartStore((state) => state.itemCount());

  const groupedItems = useMemo(() => {
    return categories.map((category) => ({
      category,
      items: menuItems.filter((item) => item.category_id === category.id),
    })).filter((group) => group.items.length > 0);
  }, [categories, menuItems]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!restaurantId) return;
      setLoading(true);
      try {
        const [restaurantData, categoryData, itemData] = await Promise.all([
          restaurantsService.getById(restaurantId),
          menuService.getCategories(restaurantId),
          menuService.getItems(restaurantId),
        ]);
        if (!mounted) return;
        setRestaurant(restaurantData);
        setCategories(categoryData);
        setMenuItems(itemData);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [restaurantId]);

  function quantityFor(itemId: string) {
    if (cartRestaurantId !== restaurant?.id) return 0;
    return cartItems.find((item) => item.menuItem.id === itemId)?.quantity ?? 0;
  }

  if (loading || !restaurant) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator color={Colors.accent.primary} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {restaurant.image_url ? <Image source={{ uri: restaurant.image_url }} style={styles.heroImage} /> : <View style={styles.heroFallback} />}
          <SafeAreaView edges={['top']} style={styles.heroActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
              <ChevronLeft color={Colors.light.textPrimary} size={22} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Heart color={Colors.light.textPrimary} size={21} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.name}>{restaurant.name}</Text>
              <Text style={styles.cuisine}>{restaurant.cuisine_tags.join(' / ')}</Text>
            </View>
            <RatingStars rating={restaurant.rating} reviewCount={restaurant.review_count} />
          </View>

          <Text style={styles.description}>{restaurant.description}</Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Clock3 color={Colors.accent.primary} size={18} />
              <Text style={styles.metaValue}>{restaurant.delivery_time} min</Text>
              <Text style={styles.metaLabel}>Delivery</Text>
            </View>
            <View style={styles.metaItem}>
              <Bike color={Colors.accent.primary} size={18} />
              <Text style={styles.metaValue}>{formatCurrency(restaurant.delivery_fee)}</Text>
              <Text style={styles.metaLabel}>Fee</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaIconText}>EGP</Text>
              <Text style={styles.metaValue}>{formatCurrency(restaurant.min_order)}</Text>
              <Text style={styles.metaLabel}>Minimum</Text>
            </View>
          </View>

          {groupedItems.length > 0 ? (
            groupedItems.map(({ category, items }) => (
              <View key={category.id} style={styles.menuSection}>
                <Text style={styles.sectionTitle}>{category.name}</Text>
                {items.map((item) => {
                  const quantity = quantityFor(item.id);
                  return (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      quantity={quantity}
                      onAdd={() => addItem(item, restaurant.id)}
                      onIncrement={() => addItem(item, restaurant.id)}
                      onDecrement={() => updateQuantity(item.id, quantity - 1)}
                    />
                  );
                })}
              </View>
            ))
          ) : (
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Menu</Text>
              {menuItems.map((item) => {
                const quantity = quantityFor(item.id);
                return (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    quantity={quantity}
                    onAdd={() => addItem(item, restaurant.id)}
                    onIncrement={() => addItem(item, restaurant.id)}
                    onDecrement={() => updateQuantity(item.id, quantity - 1)}
                  />
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <CartButton count={itemCount} total={subtotal} onPress={() => navigation.navigate('Cart')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingBottom: 120,
  },
  hero: {
    backgroundColor: Colors.light.elevated,
    height: 270,
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  heroFallback: {
    backgroundColor: Colors.accent.primaryLight,
    height: '100%',
    width: '100%',
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: 18,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  body: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -22,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    ...Typography.h1,
    color: Colors.light.textPrimary,
  },
  cuisine: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  description: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: 14,
  },
  metaGrid: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingVertical: 16,
  },
  metaItem: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
  },
  metaIconText: {
    ...Typography.caption,
    color: Colors.accent.primary,
    fontWeight: '700',
    lineHeight: 18,
  },
  metaValue: {
    ...Typography.smallMedium,
    color: Colors.light.textPrimary,
  },
  metaLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  menuSection: {
    marginTop: 26,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
});
