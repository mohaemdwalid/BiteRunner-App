import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';

interface PromoCardProps {
  title: string;
  subtitle: string;
  code: string;
}

export default function PromoCard({ title, subtitle, code }: PromoCardProps) {
  return (
    <LinearGradient
      colors={[Colors.accent.gradientStart, Colors.accent.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.codePill}>
        <Text style={styles.code}>{code}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 124,
    overflow: 'hidden',
    padding: 18,
    width: 286,
  },
  title: {
    ...Typography.h3,
    color: '#FFFFFF',
    maxWidth: 168,
  },
  subtitle: {
    ...Typography.small,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 6,
    maxWidth: 168,
  },
  codePill: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: 'rgba(255,255,255,0.38)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  code: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
