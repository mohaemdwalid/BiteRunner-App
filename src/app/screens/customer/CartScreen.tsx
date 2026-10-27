import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, MapPin, Minus, Plus, ShoppingBag, Ticket, Trash2 } from 'lucide-react-native';
import { Address, Restaurant } from '../../../types/models';
import { addressesService } from '../../services/addresses.service';
import { restaurantsService } from '../../services/restaurants.service';
import { useAppStore } from '../../state/appStore';
import { useCartStore } from '../../state/cartStore';
import PrimaryButton from '../../components/PrimaryButton';
import { formatCurrency } from '../../utils/formatCurrency';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const userId = useAppStore((state) => state.userId);
  const restaurantId = useCartStore((state) => state.restaurantId);
  const items = useCartStore((state) => state.items);
  const promoCode = useCartStore((state) => state.promoCode);
  const discount = useCartStore((state) => state.discount);
  const subtotal = useCartStore((state) => state.subtotal());
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const setPromo = useCartStore((state) => state.setPromo);
  const clearCart = useCartStore((state) => state.clearCart);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');

  const deliveryFee = restaurant?.delivery_fee ?? 0;
  const total = Math.max(subtotal + deliveryFee - discount, 0);
  const selectedAddress = useMemo(
    () => addresses.find((address) => address.id === selectedAddressId) ?? addresses[0],
    [addresses, selectedAddressId],
  );

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
      setSelectedAddressId(addressData.find((address) => address.is_default)?.id ?? addressData[0]?.id ?? null);
      setRestaurant(restaurantData);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [restaurantId, userId]);

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'RUNNER10') {
      setPromo(code, Math.round(subtotal * 0.1));
      return;
    }

    if (code === 'FAST35') {
      setPromo(code, Math.min(deliveryFee, 35));
      return;
    }

    Alert.alert('Promo not found', 'Try RUNNER10 or FAST35 in demo mode.');
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyScreen}>
        <ShoppingBag color={Colors.accent.primary} size={44} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Add items from a restaurant to start an order.</Text>
        <PrimaryButton title="Browse Restaurants" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <ChevronLeft color={Colors.light.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity style={styles.iconButton} onPress={clearCart}>
          <Trash2 color={Colors.semantic.error} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{restaurant?.name ?? 'Your order'}</Text>
        <View style={styles.items}>
          {items.map((cartItem) => (
            <View key={cartItem.menuItem.id} style={styles.cartRow}>
              {cartItem.menuItem.image_url ? (
                <Image source={{ uri: cartItem.menuItem.image_url }} style={styles.itemImage} />
              ) : (
                <View style={styles.itemImageFallback} />
              )}
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{cartItem.menuItem.name}</Text>
                <Text style={styles.itemPrice}>{formatCurrency(cartItem.menuItem.price)}</Text>
              </View>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                >
                  <Minus color={Colors.accent.primary} size={15} />
                </TouchableOpacity>
                <Text style={styles.quantity}>{cartItem.quantity}</Text>
                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)}
                >
                  <Plus color={Colors.accent.primary} size={15} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <MapPin color={Colors.accent.primary} size={18} />
            <Text style={styles.panelTitle}>Delivery address</Text>
          </View>
          {addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              activeOpacity={0.85}
              style={[styles.addressRow, selectedAddressId === address.id && styles.addressRowActive]}
              onPress={() => setSelectedAddressId(address.id)}
            >
              <View style={styles.radioOuter}>
                {selectedAddressId === address.id && <View style={styles.radioInner} />}
              </View>
              <View style={styles.addressText}>
                <Text style={styles.addressLabel}>{address.label}</Text>
                <Text style={styles.addressLine}>{address.line1}, {address.city}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}>
            <Ticket color={Colors.accent.primary} size={18} />
            <Text style={styles.panelTitle}>Promo code</Text>
          </View>
          <View style={styles.promoRow}>
            <TextInput
              value={promoInput}
              onChangeText={setPromoInput}
              placeholder="RUNNER10"
              autoCapitalize="characters"
              placeholderTextColor={Colors.light.textSecondary}
              style={styles.promoInput}
            />
            <TouchableOpacity style={styles.applyButton} onPress={applyPromo}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {promoCode && <Text style={styles.appliedText}>{promoCode} applied</Text>}
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
          title="Continue to Checkout"
          disabled={!selectedAddress}
          onPress={() => navigation.navigate('Checkout', { selectedAddressId })}
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
  headerTitle: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.light.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  items: {
    borderTopColor: Colors.light.divider,
    borderTopWidth: 1,
  },
  cartRow: {
    alignItems: 'center',
    borderBottomColor: Colors.light.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
  },
  itemImage: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 14,
    height: 64,
    width: 64,
  },
  itemImageFallback: {
    backgroundColor: Colors.accent.primaryLight,
    borderRadius: 14,
    height: 64,
    width: 64,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
  },
  itemPrice: {
    ...Typography.smallMedium,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  stepper: {
    alignItems: 'center',
    backgroundColor: Colors.accent.primaryLight,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    padding: 4,
  },
  stepperButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  quantity: {
    ...Typography.smallMedium,
    color: Colors.light.textPrimary,
    minWidth: 18,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 18,
    marginTop: 20,
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
  addressRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: Colors.light.divider,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    padding: 12,
  },
  addressRowActive: {
    borderColor: Colors.accent.primary,
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
  addressText: {
    flex: 1,
  },
  addressLabel: {
    ...Typography.smallMedium,
    color: Colors.light.textPrimary,
  },
  addressLine: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  promoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    ...Typography.body,
    backgroundColor: '#FFFFFF',
    borderColor: Colors.light.divider,
    borderRadius: 14,
    borderWidth: 1,
    color: Colors.light.textPrimary,
    flex: 1,
    height: 48,
    paddingHorizontal: 14,
  },
  applyButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent.primary,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  applyText: {
    ...Typography.smallMedium,
    color: '#FFFFFF',
  },
  appliedText: {
    ...Typography.small,
    color: Colors.semantic.success,
    marginTop: 8,
  },
  summary: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 18,
    gap: 10,
    marginTop: 20,
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
  emptyScreen: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 28,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.light.textPrimary,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
});
