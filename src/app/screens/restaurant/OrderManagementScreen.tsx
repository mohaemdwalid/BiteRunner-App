import React, { useCallback } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Order, OrderStatus } from '../../../types/models';
import { useAppStore } from '../../state/appStore';
import { useRestaurantStore } from '../../state/restaurantStore';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatTime } from '../../utils/formatDate';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function OrderManagementScreen() {
  const userId = useAppStore((state) => state.userId);
  const activeOrders = useRestaurantStore((state) => state.activeOrders);
  const isLoading = useRestaurantStore((state) => state.isLoading);
  const loadAll = useRestaurantStore((state) => state.loadAll);
  const updateOrderStatus = useRestaurantStore((state) => state.updateOrderStatus);

  const refresh = useCallback(() => {
    loadAll(userId ?? 'demo-restaurant-owner');
  }, [loadAll, userId]);

  useFocusEffect(refresh);

  const incoming = activeOrders.filter((order) => order.status === 'pending');
  const inProgress = activeOrders.filter((order) => order.status !== 'pending');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
      >
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>Accept incoming orders and move active orders through pickup.</Text>

        <OrderSection
          title="Incoming"
          emptyText="No new orders right now."
          orders={incoming}
          onUpdateStatus={updateOrderStatus}
        />
        <OrderSection
          title="Active"
          emptyText="Accepted orders will appear here."
          orders={inProgress}
          onUpdateStatus={updateOrderStatus}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function OrderSection({
  title,
  emptyText,
  orders,
  onUpdateStatus,
}: {
  title: string;
  emptyText: string;
  orders: Order[];
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<void>;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionMeta}>{orders.length}</Text>
      </View>
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {orders.map((order) => (
            <View key={order.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderTitle}>#{order.id.slice(-6).toUpperCase()}</Text>
                  <Text style={styles.orderMeta}>{formatTime(order.created_at)} - {formatCurrency(order.total)}</Text>
                </View>
                <OrderStatusBadge status={order.status} />
              </View>

              <View style={styles.itemList}>
                {(order.items ?? []).map((item) => (
                  <Text key={item.id} style={styles.itemText}>{item.quantity}x {item.name}</Text>
                ))}
              </View>

              <Text style={styles.address}>{order.delivery_address_snapshot.line1}</Text>
              <View style={styles.actions}>
                {nextActions(order.status).map((action) => (
                  <TouchableOpacity
                    key={action.status}
                    style={[styles.actionButton, action.status === 'cancelled' && styles.rejectButton]}
                    onPress={() => onUpdateStatus(order.id, action.status)}
                  >
                    <Text style={[styles.actionText, action.status === 'cancelled' && styles.rejectText]}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
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
      return [{ label: 'Preparing', status: 'preparing' }];
    case 'preparing':
      return [{ label: 'Ready for Pickup', status: 'ready' }];
    default:
      return [];
  }
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
  section: {
    marginTop: 6,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.light.textPrimary,
  },
  sectionMeta: {
    ...Typography.smallMedium,
    color: Colors.light.textSecondary,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 18,
    padding: 16,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
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
  itemList: {
    gap: 4,
    marginTop: 12,
  },
  itemText: {
    ...Typography.smallMedium,
    color: Colors.light.textPrimary,
  },
  address: {
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
    backgroundColor: Colors.light.elevated,
    borderRadius: 18,
    padding: 18,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
