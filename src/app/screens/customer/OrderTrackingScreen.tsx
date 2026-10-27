import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Bike, ChevronLeft, MessageCircle, Phone } from 'lucide-react-native';
import { Order, OrderStatus } from '../../../types/models';
import { ordersService } from '../../services/orders.service';
import { realtimeService } from '../../services/realtime.service';
import { useOrderStore } from '../../state/orderStore';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { ORDER_STATUS_LABELS } from '../../utils/orderStatus';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const TRACKING_STEPS: OrderStatus[] = ['confirmed', 'preparing', 'picked_up', 'on_the_way', 'delivered'];

export default function OrderTrackingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const activeOrder = useOrderStore((state) => state.activeOrder);
  const [order, setOrder] = useState<Order | null>(activeOrder);
  const [loading, setLoading] = useState(!activeOrder);
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const orderId = route.params?.orderId as string | undefined;

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!orderId || activeOrder?.id === orderId) return;
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
  }, [activeOrder?.id, orderId]);

  useEffect(() => {
    const currentOrderId = order?.id ?? orderId;
    if (!currentOrderId) return;

    const unsubLocation = realtimeService.subscribeToDriverLocation(
      currentOrderId,
      (loc) => {
        setDriverLocation({ latitude: loc.latitude, longitude: loc.longitude });
      },
    );

    const unsubStatus = realtimeService.subscribeToOrderStatus(
      currentOrderId,
      (_oid, status) => {
        setOrder((prev) => (prev ? { ...prev, status } : prev));
      },
    );

    return () => {
      unsubLocation();
      unsubStatus();
    };
  }, [order?.id, orderId]);

  const routePoints = useMemo(() => {
    const pickup = {
      latitude: order?.restaurant?.latitude ?? 30.0444,
      longitude: order?.restaurant?.longitude ?? 31.2357,
    };
    const dropoff = {
      latitude: order?.delivery_address_snapshot.latitude ?? 29.9602,
      longitude: order?.delivery_address_snapshot.longitude ?? 31.2569,
    };
    const driver = driverLocation ?? {
      latitude: pickup.latitude + (dropoff.latitude - pickup.latitude) * 0.62,
      longitude: pickup.longitude + (dropoff.longitude - pickup.longitude) * 0.62,
    };
    return { pickup, dropoff, driver };
  }, [order, driverLocation]);

  const activeStepIndex = order ? TRACKING_STEPS.indexOf(order.status) : -1;

  if (loading || !order) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator color={Colors.accent.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.textPrimary} size={22} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Order Tracking</Text>
          <Text style={styles.headerSubtitle}>#{order.id.slice(-6).toUpperCase()}</Text>
        </View>
        <OrderStatusBadge status={order.status} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mapWrap}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: (routePoints.pickup.latitude + routePoints.dropoff.latitude) / 2,
              longitude: (routePoints.pickup.longitude + routePoints.dropoff.longitude) / 2,
              latitudeDelta: 0.12,
              longitudeDelta: 0.12,
            }}
          >
            <Marker coordinate={routePoints.pickup} title={order.restaurant?.name ?? 'Restaurant'} />
            <Marker coordinate={routePoints.driver} title="Driver" />
            <Marker coordinate={routePoints.dropoff} title={order.delivery_address_snapshot.label} />
            <Polyline
              coordinates={[routePoints.pickup, routePoints.driver, routePoints.dropoff]}
              strokeColor={Colors.accent.primary}
              strokeWidth={4}
            />
          </MapView>
        </View>

        <View style={styles.etaCard}>
          <View>
            <Text style={styles.eta}>{order.estimated_delivery_minutes ?? 24} min</Text>
            <Text style={styles.etaLabel}>Estimated arrival</Text>
          </View>
          <View style={styles.totalPill}>
            <Text style={styles.totalText}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Order status</Text>
          <View style={styles.steps}>
            {TRACKING_STEPS.map((step, index) => {
              const isDone = activeStepIndex >= index || order.status === 'delivered';
              const isActive = activeStepIndex === index;
              return (
                <View key={step} style={styles.stepRow}>
                  <View style={[styles.stepDot, isDone && styles.stepDotDone, isActive && styles.stepDotActive]} />
                  <View style={styles.stepText}>
                    <Text style={[styles.stepTitle, isDone && styles.stepTitleDone]}>{ORDER_STATUS_LABELS[step]}</Text>
                    <Text style={styles.stepSubtitle}>{stepSubtitle(step)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Driver</Text>
          <View style={styles.driverRow}>
            <View style={styles.driverAvatar}>
              <Bike color={Colors.accent.primary} size={24} />
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>Omar Hassan</Text>
              <Text style={styles.driverMeta}>4.9 rating - 820 deliveries</Text>
            </View>
            <TouchableOpacity style={styles.contactButton}>
              <Phone color={Colors.accent.primary} size={19} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton}>
              <MessageCircle color={Colors.accent.primary} size={19} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Delivering to</Text>
          <Text style={styles.address}>{order.delivery_address_snapshot.line1}, {order.delivery_address_snapshot.city}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function stepSubtitle(step: OrderStatus) {
  switch (step) {
    case 'confirmed':
      return 'Restaurant accepted your order.';
    case 'preparing':
      return 'Kitchen is preparing your food.';
    case 'picked_up':
      return 'Driver picked up the order.';
    case 'on_the_way':
      return 'Driver is heading to you.';
    case 'delivered':
      return 'Order completed.';
    default:
      return '';
  }
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
  headerText: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
  },
  headerSubtitle: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  mapWrap: {
    borderRadius: 22,
    height: 260,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  etaCard: {
    alignItems: 'center',
    backgroundColor: Colors.accent.primary,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 18,
  },
  eta: {
    ...Typography.h1,
    color: '#FFFFFF',
  },
  etaLabel: {
    ...Typography.small,
    color: 'rgba(255,255,255,0.82)',
  },
  totalPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  totalText: {
    ...Typography.smallMedium,
    color: '#FFFFFF',
  },
  panel: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 20,
    marginTop: 16,
    padding: 16,
  },
  panelTitle: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
    marginBottom: 12,
  },
  steps: {
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stepDot: {
    backgroundColor: Colors.light.divider,
    borderRadius: 999,
    height: 14,
    marginTop: 5,
    width: 14,
  },
  stepDotDone: {
    backgroundColor: Colors.accent.primary,
  },
  stepDotActive: {
    borderColor: Colors.accent.primaryLight,
    borderWidth: 4,
    height: 20,
    marginLeft: -3,
    marginTop: 2,
    width: 20,
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    ...Typography.bodySemibold,
    color: Colors.light.textSecondary,
  },
  stepTitleDone: {
    color: Colors.light.textPrimary,
  },
  stepSubtitle: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  driverRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  driverAvatar: {
    alignItems: 'center',
    backgroundColor: Colors.accent.primaryLight,
    borderRadius: 18,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
  },
  driverMeta: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  contactButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  address: {
    ...Typography.body,
    color: Colors.light.textSecondary,
  },
});
