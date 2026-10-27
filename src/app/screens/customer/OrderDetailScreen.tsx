import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, MapPin, Repeat2 } from 'lucide-react-native';
import { Order } from '../../../types/models';
import { ordersService } from '../../services/orders.service';
import { menuService } from '../../services/menu.service';
import { useCartStore } from '../../state/cartStore';
import { useOrderStore } from '../../state/orderStore';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import PrimaryButton from '../../components/PrimaryButton';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatTime } from '../../utils/formatDate';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function OrderDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const orderId = route.params?.orderId as string | undefined;
  const activeOrder = useOrderStore((state) => state.activeOrder);
  const history = useOrderStore((state) => state.orderHistory);
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const cachedOrder = useMemo(
    () => activeOrder?.id === orderId ? activeOrder : history.find((order) => order.id === orderId),
    [activeOrder, history, orderId],
  );
  const [order, setOrder] = useState<Order | null>(cachedOrder ?? null);
  const [loading, setLoading] = useState(!cachedOrder);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!orderId || cachedOrder) return;
      setLoading(true);
      try {
        const data = await ordersService.getById(orderId);
        if (mounted) setOrder(data);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [cachedOrder, orderId]);

  if (loading || !order) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator color={Colors.accent.primary} />
      </SafeAreaView>
    );
  }

  const canTrack = !['delivered', 'cancelled'].includes(order.status);

  const handleReorder = useCallback(async () => {
    if (!order) return;
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
  }, [order, clearCart, addItem, navigation]);

  const isDelivered = order.status === 'delivered';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <OrderStatusBadge status={order.status} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.restaurantName}>{order.restaurant?.name ?? 'Restaurant order'}</Text>
          <Text style={styles.orderMeta}>#{order.id.slice(-6).toUpperCase()} - {formatDate(order.created_at)} at {formatTime(order.created_at)}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Items</Text>
          {(order.items ?? []).map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemQty}>
                <Text style={styles.itemQtyText}>{item.quantity}</Text>
              </View>
              <View style={styles.itemText}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.special_instructions && <Text style={styles.itemNote}>{item.special_instructions}</Text>}
              </View>
              <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Summary</Text>
          <SummaryRow label="Subtotal" value={formatCurrency(order.subtotal)} />
          <SummaryRow label="Delivery fee" value={formatCurrency(order.delivery_fee)} />
          <SummaryRow label="Discount" value={`-${formatCurrency(order.discount)}`} muted={order.discount === 0} />
          <View style={styles.divider} />
          <SummaryRow label="Total" value={formatCurrency(order.total)} strong />
        </View>

        <View style={styles.panel}>
          <View style={styles.addressHeader}>
            <MapPin color={Colors.accent.primary} size={18} />
            <Text style={styles.panelTitleInline}>Delivery address</Text>
          </View>
          <Text style={styles.address}>{order.delivery_address_snapshot.line1}, {order.delivery_address_snapshot.city}</Text>
        </View>
      </ScrollView>

      {canTrack ? (
        <View style={styles.footer}>
          <PrimaryButton title="Track Order" onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })} />
        </View>
      ) : isDelivered ? (
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.reorderButton} onPress={handleReorder} activeOpacity={0.85}>
              <Repeat2 color={Colors.accent.primary} size={18} />
              <Text style={styles.reorderText}>Re-order</Text>
            </TouchableOpacity>
            <View style={styles.footerFlex}>
              <PrimaryButton title="Leave Review" onPress={() => navigation.navigate('Review', { orderId: order.id, restaurantId: order.restaurant_id })} />
            </View>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, strong && styles.summaryStrong, muted && styles.muted]}>{label}</Text>
      <Text style={[styles.summaryValue, strong && styles.summaryStrong, muted && styles.muted]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  loadingScreen: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: Colors.light.elevated,
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
  },
  content: {
    gap: 16,
    paddingBottom: 112,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  heroCard: {
    backgroundColor: Colors.accent.primary,
    borderRadius: 20,
    padding: 18,
  },
  restaurantName: {
    ...Typography.h2,
    color: '#FFFFFF',
  },
  orderMeta: {
    ...Typography.small,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 4,
  },
  panel: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 20,
    padding: 16,
  },
  panelTitle: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
    marginBottom: 12,
  },
  itemRow: {
    alignItems: 'center',
    borderBottomColor: Colors.light.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  itemQty: {
    alignItems: 'center',
    backgroundColor: Colors.accent.primaryLight,
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  itemQtyText: {
    ...Typography.smallMedium,
    color: Colors.accent.primary,
  },
  itemText: {
    flex: 1,
  },
  itemName: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
  },
  itemNote: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  summaryValue: {
    ...Typography.bodyMedium,
    color: Colors.light.textPrimary,
  },
  summaryStrong: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
  },
  muted: {
    opacity: 0.45,
  },
  divider: {
    backgroundColor: Colors.light.divider,
    height: 1,
    marginBottom: 12,
  },
  addressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  panelTitleInline: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
  },
  address: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
  footer: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopColor: Colors.light.divider,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  reorderButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent.primaryLight,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  reorderText: {
    ...Typography.bodySemibold,
    color: Colors.accent.primary,
  },
  footerFlex: {
    flex: 1,
  },
});
