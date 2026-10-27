import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OrderStatus } from '../../types/models';
import { getStatusColor, ORDER_STATUS_LABELS } from '../utils/orderStatus';
import { Typography } from '../theme/typography';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const color = getStatusColor(status);
  return (
    <View style={[styles.badge, { backgroundColor: `${color}1A` }]}>
      <Text style={[styles.text, { color }]}>{ORDER_STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    ...Typography.caption,
    fontWeight: '700',
  },
});
