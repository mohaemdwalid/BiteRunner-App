import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../../state/appStore';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const SLIDES = [
  { icon: '🍔', title: 'Order in Minutes', subtitle: 'Browse hundreds of restaurants and get food delivered fast.' },
  { icon: '📍', title: 'Track in Real Time', subtitle: 'Watch your driver on the map as they bring your order.' },
  { icon: '⚡', title: 'Fast & Fresh', subtitle: 'Hot meals from the best local spots, delivered to your door.' },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const { setOnboarded } = useAppStore();

  const next = async () => {
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      setIndex(next);
    } else {
      await AsyncStorage.setItem('onboarded', 'true');
      setOnboarded(true);
    }
  };

  const slide = SLIDES[index];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skip} onPress={async () => { await AsyncStorage.setItem('onboarded', 'true'); setOnboarded(true); }}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.icon}>{slide.icon}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={next}>
        <Text style={styles.buttonText}>{index === SLIDES.length - 1 ? 'Get Started' : 'Next'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 60, paddingHorizontal: 32 },
  skip: { alignSelf: 'flex-end' },
  skipText: { ...Typography.body, color: Colors.light.textSecondary },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 80, marginBottom: 32 },
  title: { ...Typography.h1, textAlign: 'center', marginBottom: 16 },
  subtitle: { ...Typography.body, textAlign: 'center', color: '#888', lineHeight: 24 },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DDD' },
  dotActive: { width: 24, backgroundColor: Colors.accent.primary },
  button: { width: '100%', backgroundColor: Colors.accent.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  buttonText: { ...Typography.bodySemibold, color: '#fff', fontSize: 17 },
});
