import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface CategoryChipProps {
  label: string;
  active?: boolean;
  onPress: () => void;
}

export default function CategoryChip({ label, active, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.chip, active && styles.activeChip]}
    >
      <Text style={[styles.label, active && styles.activeLabel]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    backgroundColor: Colors.light.elevated,
    borderColor: Colors.light.divider,
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  activeChip: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  label: {
    ...Typography.smallMedium,
    color: Colors.light.textSecondary,
  },
  activeLabel: {
    color: '#FFFFFF',
  },
});
