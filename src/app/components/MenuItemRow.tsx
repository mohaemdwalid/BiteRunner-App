import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { MenuItem } from '../../types/models';
import { formatCurrency } from '../utils/formatCurrency';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface MenuItemRowProps {
  item: MenuItem;
  quantity?: number;
  onAdd: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

export default function MenuItemRow({ item, quantity = 0, onAdd, onIncrement, onDecrement }: MenuItemRowProps) {
  return (
    <View style={styles.row}>
      {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.image} /> : <View style={styles.imageFallback} />}
      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.price}>{formatCurrency(item.price)}</Text>
      </View>
      {quantity > 0 ? (
        <View style={styles.stepper}>
          <TouchableOpacity style={styles.stepperButton} onPress={onDecrement} activeOpacity={0.8}>
            <Minus color={Colors.accent.primary} size={16} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity style={styles.stepperButton} onPress={onIncrement ?? onAdd} activeOpacity={0.8}>
            <Plus color={Colors.accent.primary} size={16} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={onAdd} disabled={!item.is_available} activeOpacity={0.85}>
          <Plus color="#FFFFFF" size={18} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderBottomColor: Colors.light.divider,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
  },
  image: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 14,
    height: 74,
    width: 74,
  },
  imageFallback: {
    backgroundColor: Colors.accent.primaryLight,
    borderRadius: 14,
    height: 74,
    width: 74,
  },
  content: {
    flex: 1,
  },
  name: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
  },
  description: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 3,
  },
  price: {
    ...Typography.bodySemibold,
    color: Colors.accent.primary,
    marginTop: 6,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: Colors.accent.primary,
    borderRadius: 14,
    height: 38,
    justifyContent: 'center',
    width: 38,
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
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  quantity: {
    ...Typography.smallMedium,
    color: Colors.light.textPrimary,
    minWidth: 18,
    textAlign: 'center',
  },
});
