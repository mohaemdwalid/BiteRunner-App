import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { formatCurrency } from '../utils/formatCurrency';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface CartButtonProps {
  count: number;
  total: number;
  onPress: () => void;
}

export default function CartButton({ count, total, onPress }: CartButtonProps) {
  if (count <= 0) return null;

  return (
    <View style={styles.wrap}>
      <TouchableOpacity activeOpacity={0.9} style={styles.button} onPress={onPress}>
        <View style={styles.left}>
          <ShoppingBag color="#FFFFFF" size={20} />
          <Text style={styles.text}>View Cart</Text>
        </View>
        <Text style={styles.text}>{count} item{count === 1 ? '' : 's'} - {formatCurrency(total)}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopColor: Colors.light.divider,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
  },
  button: {
    alignItems: 'center',
    backgroundColor: Colors.accent.primary,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 18,
  },
  left: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  text: {
    ...Typography.bodySemibold,
    color: '#FFFFFF',
  },
});
