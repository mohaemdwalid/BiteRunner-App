import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Bike, MapPin } from 'lucide-react-native';
import { Order } from '../../../types/models';
import { ordersService } from '../../services/orders.service';
import { useAppStore } from '../../state/appStore';
import { useDriverStore } from '../../state/driverStore';
import PrimaryButton from '../../components/PrimaryButton';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function DriverHomeScreen() {
  const userId = useAppStore((state) => state.userId);
  const isAvailable = useDriverStore((state) => state.isAvailable);
  const setAvailable = useDriverStore((state) => state.setAvailable);
  const [assignedOrder, setAssignedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const refresh = useCallback(() => {
    let mounted = true;
    setLoading(true);
    ordersService.getHistory('demo-customer')
      .then((orders) => {
        if (!mounted) return;
        setAssignedOrder(orders.find((order) => !['delivered', 'cancelled'].includes(order.status)) ?? null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useFocusEffect(refresh);

  const routePoints = useMemo(() => {
    const pickup = {
      latitude: assignedOrder?.restaurant?.latitude ?? 30.0444,
      longitude: assignedOrder?.restaurant?.longitude ?? 31.2357,
    };
    const dropoff = {
      latitude: assignedOrder?.delivery_address_snapshot.latitude ?? 29.9602,
      longitude: assignedOrder?.delivery_address_snapshot.longitude ?? 31.2569,
    };
    return { pickup, dropoff };
  }, [assignedOrder]);

  async function updateStatus(status: 'picked_up' | 'delivered') {
    if (!assignedOrder) return;
    setActionLoading(true);
    try {
      await ordersService.updateStatus(assignedOrder.id, status);
      setAssignedOrder(status === 'delivered' ? null : { ...assignedOrder, status });
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.caption}>Driver mode</Text>
            <Text style={styles.title}>{isAvailable ? 'Available' : 'Offline'}</Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={(value) => setAvailable(userId ?? 'demo-driver', value)}
            trackColor={{ false: Colors.light.divider, true: Colors.accent.primaryLight }}
            thumbColor={isAvailable ? Colors.accent.primary : '#FFFFFF'}
          />
        </View>

        {loading && !assignedOrder ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.accent.primary} />
          </View>
        ) : assignedOrder ? (
          <>
            <View style={styles.assignmentCard}>
              <View style={styles.assignmentHeader}>
                <View>
                  <Text style={styles.cardCaption}>Assigned delivery</Text>
                  <Text style={styles.orderTitle}>#{assignedOrder.id.slice(-6).toUpperCase()}</Text>
                </View>
                <OrderStatusBadge status={assignedOrder.status} />
              </View>
              <Text style={styles.restaurant}>{assignedOrder.restaurant?.name ?? 'Restaurant pickup'}</Text>
              <Text style={styles.total}>{formatCurrency(assignedOrder.delivery_fee)} delivery fee</Text>
            </View>

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
                <Marker coordinate={routePoints.pickup} title="Pickup" />
                <Marker coordinate={routePoints.dropoff} title="Drop-off" />
                <Polyline coordinates={[routePoints.pickup, routePoints.dropoff]} strokeColor={Colors.accent.primary} strokeWidth={4} />
              </MapView>
            </View>

            <View style={styles.routePanel}>
              <RouteRow label="Pickup" value={assignedOrder.restaurant?.name ?? 'Restaurant'} />
              <RouteRow label="Drop-off" value={`${assignedOrder.delivery_address_snapshot.line1}, ${assignedOrder.delivery_address_snapshot.city}`} />
            </View>

            <View style={styles.actions}>
              <PrimaryButton
                title="Picked Up"
                loading={actionLoading}
                disabled={assignedOrder.status === 'picked_up' || assignedOrder.status === 'on_the_way'}
                onPress={() => updateStatus('picked_up')}
              />
              <PrimaryButton
                title="Delivered"
                variant="secondary"
                loading={actionLoading}
                onPress={() => updateStatus('delivered')}
              />
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Bike color={Colors.accent.primary} size={34} />
            </View>
            <Text style={styles.emptyTitle}>No assigned delivery</Text>
            <Text style={styles.emptyText}>
              Toggle available and pull to refresh when you are ready for a delivery.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RouteRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.routeRow}>
      <View style={styles.routeIcon}>
        <MapPin color={Colors.accent.primary} size={18} />
      </View>
      <View style={styles.routeText}>
        <Text style={styles.routeLabel}>{label}</Text>
        <Text style={styles.routeValue}>{value}</Text>
      </View>
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
  loading: {
    alignItems: 'center',
    minHeight: 240,
    justifyContent: 'center',
  },
  assignmentCard: {
    backgroundColor: Colors.accent.primary,
    borderRadius: 22,
    marginTop: 24,
    padding: 18,
  },
  assignmentHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardCaption: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.78)',
    textTransform: 'uppercase',
  },
  orderTitle: {
    ...Typography.h2,
    color: '#FFFFFF',
    marginTop: 2,
  },
  restaurant: {
    ...Typography.bodySemibold,
    color: '#FFFFFF',
    marginTop: 14,
  },
  total: {
    ...Typography.small,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 3,
  },
  mapWrap: {
    borderRadius: 22,
    height: 250,
    marginTop: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  routePanel: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 20,
    gap: 12,
    marginTop: 16,
    padding: 16,
  },
  routeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  routeIcon: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  routeText: {
    flex: 1,
  },
  routeLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
  },
  routeValue: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
    marginTop: 2,
  },
  actions: {
    gap: 10,
    marginTop: 16,
  },
  empty: {
    alignItems: 'center',
    backgroundColor: Colors.light.elevated,
    borderRadius: 22,
    marginTop: 24,
    padding: 26,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.light.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
});
