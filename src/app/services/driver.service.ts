import { supabase, isSupabaseConfigured } from './supabase';

export const driverService = {
  async upsertLocation(driverId: string, orderId: string, lat: number, lng: number) {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.from('driver_locations').upsert(
      { driver_id: driverId, order_id: orderId, latitude: lat, longitude: lng, updated_at: new Date().toISOString() },
      { onConflict: 'driver_id,order_id' }
    );
    if (error) throw error;
  },

  async setAvailability(userId: string, isAvailable: boolean) {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('profiles')
      .update({ is_available: isAvailable } as any)
      .eq('id', userId);
    if (error) throw error;
  },

  async getEarnings(driverId: string) {
    if (!isSupabaseConfigured) {
      return [
        { id: 'earning-1', total: 285, delivery_fee: 35, created_at: new Date().toISOString() },
        { id: 'earning-2', total: 190, delivery_fee: 30, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 'earning-3', total: 340, delivery_fee: 45, created_at: new Date(Date.now() - 172800000).toISOString() },
      ];
    }

    const { data, error } = await supabase
      .from('orders')
      .select('id, total, delivery_fee, created_at')
      .eq('driver_id', driverId)
      .eq('status', 'delivered')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};
