import { supabase, isSupabaseConfigured } from './supabase';
import { DriverLocation, OrderStatus } from '../../types/models';

type DriverLocationCallback = (location: DriverLocation) => void;
type OrderStatusCallback = (orderId: string, status: OrderStatus) => void;

let simulationInterval: ReturnType<typeof setInterval> | null = null;
let simulationProgress = 0;

export const realtimeService = {
  subscribeToDriverLocation(orderId: string, callback: DriverLocationCallback) {
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel(`driver-location-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'driver_locations',
            filter: `order_id=eq.${orderId}`,
          },
          (payload) => {
            callback(payload.new as DriverLocation);
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    simulationProgress = 0;
    const pickupLat = 30.0444;
    const pickupLng = 31.2357;
    const dropoffLat = 29.9602;
    const dropoffLng = 31.2569;

    simulationInterval = setInterval(() => {
      simulationProgress = Math.min(simulationProgress + 0.02, 0.98);
      const lat = pickupLat + (dropoffLat - pickupLat) * simulationProgress;
      const lng = pickupLng + (dropoffLng - pickupLng) * simulationProgress;

      callback({
        id: `demo-loc-${Date.now()}`,
        driver_id: 'demo-driver',
        order_id: orderId,
        latitude: lat,
        longitude: lng,
        updated_at: new Date().toISOString(),
      });
    }, 2000);

    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
      }
    };
  },

  subscribeToOrderStatus(orderId: string, callback: OrderStatusCallback) {
    if (isSupabaseConfigured) {
      const channel = supabase
        .channel(`order-status-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${orderId}`,
          },
          (payload) => {
            callback(payload.new.id, payload.new.status as OrderStatus);
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    return () => {};
  },
};
