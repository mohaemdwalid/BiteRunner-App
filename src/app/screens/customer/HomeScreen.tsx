import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Restaurant } from '../../../types/models';
import { restaurantsService } from '../../services/restaurants.service';
import CategoryChip from '../../components/CategoryChip';
import PromoCard from '../../components/PromoCard';
import RestaurantCard from '../../components/RestaurantCard';
import SearchBar from '../../components/SearchBar';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const CATEGORIES = ['All', 'Pizza', 'Burgers', 'Sushi', 'Healthy', 'Desserts', 'Grill'];

const PROMOS = [
  { title: 'Save 10% on your next run', subtitle: 'Use the code at checkout today.', code: 'RUNNER10' },
  { title: 'Low delivery fee picks', subtitle: 'Fast meals with fees under 35 EGP.', code: 'FAST35' },
];

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const popular = useMemo(
    () => restaurants.filter((restaurant) => restaurant.rating >= 4.7).slice(0, 3),
    [restaurants],
  );

  async function loadRestaurants(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const trimmed = search.trim();
      const data = trimmed
        ? await restaurantsService.search(trimmed)
        : await restaurantsService.list(selectedCategory === 'All' ? undefined : selectedCategory);
      setRestaurants(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRestaurants();
    }, 180);
    return () => clearTimeout(timer);
  }, [selectedCategory, search]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRestaurants(true)} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.caption}>Delivering to</Text>
            <View style={styles.locationRow}>
              <MapPin color={Colors.accent.primary} size={18} />
              <Text style={styles.location}>Maadi, Cairo</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.85} style={styles.avatar}>
            <Text style={styles.avatarText}>BR</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>What would you like to eat?</Text>
        <SearchBar value={search} onChangeText={setSearch} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promos}>
          {PROMOS.map((promo) => (
            <PromoCard key={promo.code} {...promo} />
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {CATEGORIES.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              active={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Near You</Text>
          <Text style={styles.sectionMeta}>{restaurants.length} open</Text>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.accent.primary} />
          </View>
        ) : (
          <View style={styles.restaurantList}>
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id })}
              />
            ))}
          </View>
        )}

        {!loading && restaurants.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No restaurants found</Text>
            <Text style={styles.emptyText}>Try another search or category.</Text>
          </View>
        )}

        {popular.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Right Now</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularList}>
              {popular.map((restaurant) => (
                <RestaurantCard
                  key={`popular-${restaurant.id}`}
                  compact
                  restaurant={restaurant}
                  onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id })}
                />
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  caption: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: 2,
  },
  location: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: Colors.accent.primaryLight,
    borderRadius: 18,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: {
    ...Typography.smallMedium,
    color: Colors.accent.primary,
    fontWeight: '700',
  },
  title: {
    ...Typography.display,
    color: Colors.light.textPrimary,
    marginBottom: 18,
    marginTop: 24,
    maxWidth: 300,
  },
  promos: {
    gap: 12,
    paddingVertical: 18,
  },
  categories: {
    gap: 10,
    paddingBottom: 22,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.light.textPrimary,
  },
  sectionMeta: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  loading: {
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
  },
  restaurantList: {
    gap: 14,
  },
  popularList: {
    gap: 12,
    paddingBottom: 8,
  },
  empty: {
    alignItems: 'center',
    backgroundColor: Colors.light.elevated,
    borderRadius: 18,
    padding: 24,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
});
