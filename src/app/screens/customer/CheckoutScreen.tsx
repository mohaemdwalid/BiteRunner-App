import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Banknote, ChevronLeft, Clock3, CreditCard, MapPin, Smartphone } from 'lucide-react-native';
import { Address, Restaurant } from '../../../types/models';
import { addressesService } from '../../services/addresses.service';
import { ordersService } from '../../services/orders.service';
import { paymentService } from '../../services/payment.service';
import { restaurantsService } from '../../services/restaurants.service';
import { useAppStore } from '../../state/appStore';
import { useCartStore } from '../../state/cartStore';
import { useOrderStore } from '../../state/orderStore';
import PrimaryButton from '../../components/PrimaryButton';
import { formatCurrency } from '../../utils/formatCurrency';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

type PaymentMethod = 'card' | 'cash' | 'apple_pay';

const PAYMENT_METHODS: { id: PaymentMethod; title: string; subtitle: string; icon: React.ReactNode }[] = [
  { id: 'card', title: 'Card', subtitle: 'Visa ending in 4242', icon: <CreditCard color={Colors.accent.primary} size={20} /> },
  { id: 'cash', title: 'Cash', subtitle: 'Pay when your order arrives', icon: <Banknote color={Colors.accent.primary} size={20} /> },
  { id: 'apple_pay', title: 'Apple Pay', subtitle: 'Fast checkout on supported devices', icon: <Smartphone color={Colors.accent.primary} size={20} /> },
];

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const userId = useAppStore((state) => state.userId);
  const restaurantId = useCartStore((state) => state.restaurantId);
  const items = useCartStore((state) => state.items);
  const promoCode = useCartStore((state) => state.promoCode);
  const discount = useCartStore((state) => state.discount);
  const subtotal = useCartStore((state) => state.subtotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const setActiveOrder = useOrderStore((state) => state.setActiveOrder);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [loading, setLoading] = useState(false);

  const selectedAddress = useMemo(() => {
    const selectedId = route.params?.selectedAddressId;
    return addresses.find((address) => address.id === selectedId) ?? addresses.find((address) => address.is_default) ?? addresses[0];
  }, [addresses, route.params?.selectedAddressId]);

  const deliveryFee = restaurant?.delivery_fee ?? 0;
  const total = Math.max(subtotal + deliveryFee - discount, 0);
  const eta = restaurant?.delivery_time ? restaurant.delivery_time + 8 : 35;

  useEffect(() => {
    let mounted = true;
    async function load() {
      const customerId = userId ?? 'demo-customer';
      const [addressData, restaurantData] = await Promise.all([
        addressesService.list(customerId),
        restaurantId ? restaurantsService.getById(restaurantId) : Promise.resolve(null),
      ]);
      if (!mounted) return;
      setAddresses(addressData);
      setRestaurant(restaurantData);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [restaurantId, userId]);

  async function confirmOrder() {
    if (!restaurantId || !selectedAddress || items.length === 0) return;

    setLoading(true);
    try {
      const paymentResult = await paymentService.createPaymentIntent({
        amount: total,
        paymentMethod,
        customerId: userId ?? 'demo-customer',
        restaurantId,
      });

      if (paymentResult.status !== 'succeeded') {
        Alert.alert('Payment Failed', 'Your payment could not be processed. Please try again.');
        return;
      }

      const order = await ordersService.createOrder({
        customerId: userId ?? 'demo-customer',
        restaurantId,
        items,
        address: selectedAddress,
        subtotal,
        deliveryFee,
        discount,
        total,
        promoCode,
        paymentIntentId: paymentResult.paymentIntentId,
      });
      setActiveOrder(order);
      clearCart();
      navigation.replace('OrderTracking', { orderId: order.id });
    } catch (error: any) {
      Alert.alert('Order failed', error.message ?? 'Could not place the order.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.iconButtonPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <MapPin color={Colors.accent.primary} size={20} />
            <Text style={styles.panelTitle}>Confirm address</Text>
          </View>
          <Text style={styles.addressLabel}>{selectedAddress?.label ?? 'Delivery address'}</Text>
          <Text style={styles.addressLine}>{selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.city}` : 'No address selected'}</Text>
          <View style={styles.mapPreview}>
            <MapPin color={Colors.accent.primary} size={30} />
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <CreditCard color={Colors.accent.primary} size={20} />
            <Text style={styles.panelTitle}>Payment method</Text>
          </View>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              activeOpacity={0.85}
              style={[styles.paymentRow, paymentMethod === method.id && styles.paymentRowActive]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <View style={styles.paymentIcon}>{method.icon}</View>
              <View style={styles.paymentText}>
                <Text style={styles.paymentTitle}>{method.title}</Text>
                <Text style={styles.paymentSubtitle}>{method.subtitle}</Text>
              </View>
              <View style={styles.radioOuter}>
                {paymentMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Clock3 color={Colors.accent.primary} size={20} />
            <Text style={styles.panelTitle}>Estimated delivery</Text>
          </View>
          <Text style={styles.eta}>{eta}-{eta + 8} min</Text>
          <Text style={styles.etaText}>Includes restaurant prep and driver pickup.</Text>
        </View>

        <View style={styles.summary}>
          <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
          <SummaryRow label="Delivery fee" value={formatCurrency(deliveryFee)} />
          <SummaryRow label="Discount" value={`-${formatCurrency(discount)}`} muted={discount === 0} />
          <View style={styles.divider} />
          <SummaryRow label="Total" value={formatCurrency(total)} strong />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          title={paymentMethod === 'cash' ? 'Confirm Order' : 'Confirm and Pay'}
          loading={loading}
          disabled={!selectedAddress || items.length === 0}
          onPress={confirmOrder}
        />
      </View>
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
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
  iconButtonPlaceholder: {
    height: 42,
    width: 42,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
  },
  content: {
    gap: 16,
    paddingBottom: 120,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  panel: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 18,
    padding: 16,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  panelTitle: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
  },
  addressLabel: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
  },
  addressLine: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: 3,
  },
  mapPreview: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: Colors.light.divider,
    borderRadius: 16,
    borderWidth: 1,
    height: 126,
    justifyContent: 'center',
    marginTop: 14,
  },
  paymentRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: Colors.light.divider,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    padding: 12,
  },
  paymentRowActive: {
    borderColor: Colors.accent.primary,
  },
  paymentIcon: {
    alignItems: 'center',
    backgroundColor: Colors.accent.primaryLight,
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  paymentText: {
    flex: 1,
  },
  paymentTitle: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
  },
  paymentSubtitle: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  radioOuter: {
    alignItems: 'center',
    borderColor: Colors.accent.primary,
    borderRadius: 999,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioInner: {
    backgroundColor: Colors.accent.primary,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  eta: {
    ...Typography.h2,
    color: Colors.light.textPrimary,
  },
  etaText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  summary: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 18,
    gap: 10,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginVertical: 2,
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
});
