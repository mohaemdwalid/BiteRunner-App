import { Colors } from '../theme/colors';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready for Pickup',
  picked_up: 'Picked Up',
  on_the_way: 'On the Way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function getStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'delivered': return Colors.semantic.success;
    case 'cancelled': return Colors.semantic.error;
    case 'on_the_way':
    case 'picked_up': return Colors.accent.primary;
    default: return Colors.semantic.warning;
  }
}

export const TRACKING_STEPS: OrderStatus[] = [
  'confirmed',
  'preparing',
  'picked_up',
  'on_the_way',
  'delivered',
];
