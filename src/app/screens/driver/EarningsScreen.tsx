import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CalendarDays, Wallet } from 'lucide-react-native';
import { useAppStore } from '../../state/appStore';
import { useDriverStore } from '../../state/driverStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function EarningsScreen() {
  const userId = useAppStore((state) => state.userId);
  const earnings = useDriverStore((state) => state.earnings);
  const isLoading = useDriverStore((state) => state.isLoading);
  const loadEarnings = useDriverStore((state) => state.loadEarnings);

  const refresh = useCallback(() => {
    loadEarnings(userId ?? 'demo-driver');
  }, [loadEarnings, userId]);

  useFocusEffect(refresh);

  const today = totalSince(earnings, 1);
  const week = totalSince(earnings, 7);
  const month = totalSince(earnings, 30);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
      >
        <Text style={styles.title}>Earnings</Text>
        <Text style={styles.subtitle}>Track delivery fees across your recent trips.</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Wallet color={Colors.accent.primary} size={30} />
          </View>
          <Text style={styles.summaryLabel}>This month</Text>
          <Text style={styles.summaryValue}>{formatCurrency(month)}</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatCard label="Today" value={formatCurrency(today)} />
          <StatCard label="Week" value={formatCurrency(week)} />
          <StatCard label="Month" value={formatCurrency(month)} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Delivery history</Text>
          <Text style={styles.sectionMeta}>{earnings.length}</Text>
        </View>

        {isLoading && earnings.length === 0 ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.accent.primary} />
          </View>
        ) : (
          <View style={styles.list}>
            {earnings.map((entry) => (
              <View key={entry.id} style={styles.row}>
                <View style={styles.rowIcon}>
                  <CalendarDays color={Colors.accent.primary} size={20} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>Delivery #{entry.id.slice(-4).toUpperCase()}</Text>
                  <Text style={styles.rowSubtitle}>{formatDate(entry.created_at)}</Text>
                </View>
                <Text style={styles.rowAmount}>{formatCurrency(entry.delivery_fee)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function totalSince(entries: { delivery_fee: number; created_at: string }[], days: number) {
  const cutoff = Date.now() - days * 86400000;
  return entries
    .filter((entry) => new Date(entry.created_at).getTime() >= cutoff)
    .reduce((sum, entry) => sum + entry.delivery_fee, 0);
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  content: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    ...Typography.display,
    color: Colors.light.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    marginBottom: 22,
    marginTop: 4,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: Colors.accent.primary,
    borderRadius: 24,
    padding: 24,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  summaryLabel: {
    ...Typography.small,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 14,
  },
  summaryValue: {
    ...Typography.display,
    color: '#FFFFFF',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statCard: {
    backgroundColor: Colors.light.elevated,
    borderRadius: 18,
    flex: 1,
    padding: 14,
  },
  statValue: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 26,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.light.textPrimary,
  },
  sectionMeta: {
    ...Typography.smallMedium,
    color: Colors.light.textSecondary,
  },
  loading: {
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
  },
  list: {
    gap: 10,
  },
  row: {
    alignItems: 'center',
    backgroundColor: Colors.light.elevated,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  rowIcon: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
  },
  rowSubtitle: {
    ...Typography.small,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  rowAmount: {
    ...Typography.bodySemibold,
    color: Colors.light.textPrimary,
  },
});
