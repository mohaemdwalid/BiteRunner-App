import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  compact?: boolean;
  interactive?: boolean;
  size?: number;
  onRatingChange?: (rating: number) => void;
}

export default function RatingStars({ rating, reviewCount, compact, interactive, size, onRatingChange }: RatingStarsProps) {
  const starSize = size ?? (compact ? 14 : 16);
  const totalStars = interactive ? 5 : 1;

  return (
    <View style={styles.container}>
      {interactive ? (
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= rating;
            return (
              <TouchableOpacity key={star} onPress={() => onRatingChange?.(star)} activeOpacity={0.7}>
                <Star
                  size={starSize + 6}
                  color={filled ? Colors.accent.secondary : Colors.light.divider}
                  fill={filled ? Colors.accent.secondary : 'transparent'}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <>
          <Star color={Colors.accent.secondary} fill={Colors.accent.secondary} size={starSize} />
          <Text style={[styles.rating, compact && styles.compact]}>{rating.toFixed(1)}</Text>
          {reviewCount !== undefined && (
            <Text style={[styles.count, compact && styles.compact]}>({reviewCount})</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  starRow: {
    flexDirection: 'row',
    gap: 4,
  },
  rating: {
    ...Typography.smallMedium,
    color: Colors.light.textPrimary,
  },
  count: {
    ...Typography.small,
    color: Colors.light.textSecondary,
  },
  compact: {
    fontSize: 12,
  },
});
