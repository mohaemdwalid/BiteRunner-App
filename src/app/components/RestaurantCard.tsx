import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Bike, Clock3 } from 'lucide-react-native';
import { Restaurant } from '../../types/models';
import { formatCurrency } from '../utils/formatCurrency';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import RatingStars from './RatingStars';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  compact?: boolean;
}

export default function RestaurantCard({ restaurant, onPress, compact }: RestaurantCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={[styles.card, compact && styles.compactCard]} onPress={onPress}>
      {restaurant.image_url ? <Image source={{ uri: restaurant.image_url }} style={styles.image} /> : <View style={styles.imageFallback} />}
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.name} numberOfLines={1}>{restaurant.name}</Text>
            <Text style={styles.cuisine} numberOfLines={1}>{restaurant.cuisine_tags.join(' / ')}</Text>
          </View>
          <RatingStars rating={restaurant.rating} compact />
        </View>
        <Text style={styles.description} numberOfLines={compact ? 1 : 2}>{restaurant.description}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock3 color={Colors.light.textSecondary} size={15} />
            <Text style={styles.metaText}>{restaurant.delivery_time} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Bike color={Colors.light.textSecondary} size={15} />
            <Text style={styles.metaText}>{formatCurrency(restaurant.delivery_fee)} fee</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderColor: Colors.light.divider,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  compactCard: {
    width: 280,
  },
  image: {
    backgroundColor: Colors.light.elevated,
    height: 148,
    width: '100%',
  },
  imageFallback: {
    backgroundColor: Colors.accent.primaryLight,
    height: 148,
    width: '100%',
  },
  body: {
    padding: 14,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
  },
  cuisine: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  description: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  metaText: {
    ...Typography.smallMedium,
    color: Colors.light.textSecondary,
  },
});
