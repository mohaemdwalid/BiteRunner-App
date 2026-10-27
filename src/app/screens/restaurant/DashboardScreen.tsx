import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Clock3, DollarSign, ReceiptText } from 'lucide-react-native';
import { OrderStatus } from '../../../types/models';
import { useAppStore } from '../../state/appStore';
import { useRestaurantStore } from '../../state/restaurantStore';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function DashboardScreen() {
  const userId = useAppStore((state) => state.userId);
  const restaurant = useRestaurantStore((state) => state.restaurant);
  const activeOrders = useRestaurantStore((state) => state.activeOrders);
  const isLoading = useRestaurantStore((state) => state.isLoading);
  const loadAll = useRestaurantStore((state) => state.loadAll);
  const setIsOpen = useRestaurantStore((state) => state.setIsOpen);
  const updateOrderStatus = useRestaurantStore((state) => state.updateOrderStatus);

  const refresh = useCallback(() => {
    loadAll(userId ?? 'demo-restaurant-owner');
  }, [loadAll, userId]);

  useFocusEffect(refresh);

  const revenue = activeOrders.reduce((sum, order) => sum + order.total, 0);
  const avgPrepTime = activeOrders.length > 0 ? 24 : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.caption}>Restaurant dashboard</Text>
            <Text style={styles.title}>{restaurant?.name ?? 'Your restaurant'}</Text>
          </View>
          <View style={styles.openToggle}>
            <Text style={styles.openText}>{restaurant?.is_open ? 'Open' : 'Closed'}</Text>
            <Switch
              value={restaurant?.is_open ?? false}
              onValueChange={setIsOpen}
              trackColor={{ false: Colors.light.divider, true: Colors.accent.primaryLight }}
              thumbColor={restaurant?.is_open ? Colors.accent.primary : '#FFFFFF'}
            />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard icon={<ReceiptText color={Colors.accent.primary} size={22} />} label="Orders" value={`${activeOrders.length}`} />
          <StatCard icon={<DollarSign color={Colors.accent.primary} size={22} />} label="Revenue" value={formatCurrency(revenue)} />
          <StatCard icon={<Clock3 color={Colors.accent.primary} size={22} />} label="Avg prep" value={avgPrepTime ? `${avgPrepTime} min` : '--'} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active orders</Text>
          <Text style={styles.sectionMeta}>{activeOrders.length} live</Text>
        </View>

        {isLoading && activeOrders.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.accent.primary} />
          </View>
        ) : (
          <View style={styles.orderList}>
            {activeOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderTitle}>Order #{order.id.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.orderMeta}>{order.items?.length ?? 0} items - {formatCurrency(order.total)}</Text>
                  </View>
                  <OrderStatusBadge status={order.status} />
                </View>
                <Text style={styles.orderAddress}>{order.delivery_address_snapshot.line1}</Text>
                <View style={styles.actions}>
                  {nextActions(order.status).map((action) => (
                    <TouchableOpacity
                      key={action.status}
                      style={[styles.actionButton, action.status === 'cancelled' && styles.rejectButton]}
                      onPress={() => updateOrderStatus(order.id, action.status)}
                    >
                      <Text style={[styles.actionText, action.status === 'cancelled' && styles.rejectText]}>{action.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {!isLoading && activeOrders.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No active orders</Text>
            <Text style={styles.emptyText}>Incoming and in-progress orders will appear here.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function nextActions(status: OrderStatus): { label: string; status: OrderStatus }[] {
  switch (status) {
    case 'pending':
      return [
        { label: 'Accept', status: 'confirmed' },
        { label: 'Reject', status: 'cancelled' },
      ];
    case 'confirmed':
      return [{ label: 'Start Preparing', status: 'preparing' }];
    case 'preparing':
      return [{ label: 'Ready for Pickup', status: 'ready' }];
    default:
      return [];
  }
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  caption: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
  },
  title: {
    ...Typography.h1,
    color: Colors.light.textPrimary,
    marginTop: 2,
  },
  openToggle: {
    alignItems: 'center',
  },
  openText: {
    ...Typography.smallMedium,
    color: Colors.light.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  statCard: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 18,
    flex: 1,
    padding: 14,
  },
  statIcon: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 40,
    justifyContent: 'center',
    marginBottom: 12,
    width: 40,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 28,
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
  orderList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 18,
    padding: 16,
  },
  orderHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderTitle: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
  },
  orderMeta: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 3,
  },
  orderAddress: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  actionButton: {
    backgroundColor: Colors.accent.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  rejectButton: {
    backgroundColor: Colors.semantic.errorLight,
  },
  actionText: {
    ...Typography.smallMedium,
    color: '#FFFFFF',
  },
  rejectText: {
    color: Colors.semantic.error,
  },
  empty: {
    alignItems: 'center',
    backgroundColor: Colors.light.elevated,
    borderRadius: 20,
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
    textAlign: 'center',
  },
});
