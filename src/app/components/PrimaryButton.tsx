import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  icon,
  variant = 'primary',
}: PrimaryButtonProps) {
  const isGhost = variant === 'ghost';
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isSecondary && styles.secondary,
        isGhost && styles.ghost,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? Colors.accent.primary : '#FFFFFF'} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, isGhost && styles.ghostText]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: Colors.accent.primary,
    paddingHorizontal: 18,
  },
  secondary: {
    backgroundColor: Colors.accent.primaryLight,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.55,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  text: {
    ...Typography.bodySemibold,
    color: '#FFFFFF',
    fontSize: 16,
  },
  ghostText: {
    color: Colors.accent.primary,
  },
});
