import React, { useCallback } from 'react';
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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Clock3, Repeat2 } from 'lucide-react-native';
import { useAppStore } from '../../state/appStore';
import { useCartStore } from '../../state/cartStore';
import { useOrderStore } from '../../state/orderStore';
import { menuService } from '../../services/menu.service';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import PrimaryButton from '../../components/PrimaryButton';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatTime } from '../../utils/formatDate';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function OrderHistoryScreen() {
  const navigation = useNavigation<any>();
  const userId = useAppStore((state) => state.userId);
  const orders = useOrderStore((state) => state.orderHistory);
  const loading = useOrderStore((state) => state.isLoading);
  const loadHistory = useOrderStore((state) => state.loadHistory);
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const refresh = useCallback(() => {
    loadHistory(userId ?? 'demo-customer');
  }, [loadHistory, userId]);

  const handleReorder = useCallback(
    async (order: typeof orders[number]) => {
      const menuItems = await menuService.getItems(order.restaurant_id);
      clearCart();
      for (const orderItem of order.items ?? []) {
        const menuItem = menuItems.find((m) => m.id === orderItem.menu_item_id);
        if (menuItem) {
          for (let i = 0; i < orderItem.quantity; i++) {
            addItem(menuItem, order.restaurant_id);
          }
        }
      }
      navigation.navigate('HomeTab');
      setTimeout(() => {
        navigation.navigate('Cart');
      }, 300);
    },
    [clearCart, addItem, navigation],
  );

  useFocusEffect(refresh);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>Track active deliveries and review past meals.</Text>

        {loading && orders.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.accent.primary} />
          </View>
        ) : (
          <View style={styles.list}>
            {orders.map((order) => {
              const itemsText = order.items?.map((item) => `${item.quantity}x ${item.name}`).join(', ') ?? 'Order items';
              const canTrack = !['delivered', 'cancelled'].includes(order.status);
              return (
                <TouchableOpacity
                  key={order.id}
                  activeOpacity={0.9}
                  style={styles.card}
                  onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.restaurantBlock}>
                      <Text style={styles.restaurantName}>{order.restaurant?.name ?? 'Restaurant order'}</Text>
                      <View style={styles.dateRow}>
                        <Clock3 color={Colors.light.textSecondary} size={14} />
                        <Text style={styles.dateText}>{formatDate(order.created_at)} at {formatTime(order.created_at)}</Text>
                      </View>
                    </View>
                    <OrderStatusBadge status={order.status} />
                  </View>
                  <Text style={styles.itemsText} numberOfLines={2}>{itemsText}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.total}>{formatCurrency(order.total)}</Text>
                    <View style={styles.actions}>
                      <TouchableOpacity style={styles.secondaryAction} onPress={() => handleReorder(order)}>
                        <Repeat2 color={Colors.accent.primary} size={16} />
                        <Text style={styles.secondaryActionText}>Re-order</Text>
                      </TouchableOpacity>
                      {canTrack && (
                        <TouchableOpacity
                          style={styles.trackButton}
                          onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
                        >
                          <Text style={styles.trackButtonText}>Track</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {!loading && orders.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>Your completed and active orders will appear here.</Text>
            <PrimaryButton title="Start Browsing" onPress={() => navigation.getParent()?.navigate('HomeTab')} />
          </View>
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
    paddingTop: 12,
  },
  title: {
    ...Typography.display,
    color: Colors.light.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: 22,
    marginTop: 4,
  },
  loading: {
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'center',
  },
  list: {
    gap: 14,
  },
  card: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 20,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  restaurantBlock: {
    flex: 1,
  },
  restaurantName: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
  },
  dateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: 4,
  },
  dateText: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  itemsText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: 14,
  },
  cardFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  total: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  secondaryActionText: {
    ...Typography.smallMedium,
    color: Colors.accent.primary,
  },
  trackButton: {
    backgroundColor: Colors.accent.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  trackButtonText: {
    ...Typography.smallMedium,
    color: '#FFFFFF',
  },
  empty: {
    alignItems: 'center',
    backgroundColor: Colors.light.elevated,
    borderRadius: 20,
    marginTop: 20,
    padding: 24,
  },
  emptyTitle: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: 16,
    marginTop: 4,
    textAlign: 'center',
  },
});
