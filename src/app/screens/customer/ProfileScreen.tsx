import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, ChevronRight, CreditCard, HelpCircle, LogOut, MapPin, User } from 'lucide-react-native';
import { Address } from '../../../types/models';
import { addressesService } from '../../services/addresses.service';
import { useAppStore } from '../../state/appStore';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function ProfileScreen() {
  const userId = useAppStore((state) => state.userId);
  const profile = useAppStore((state) => state.profile);
  const signOut = useAppStore((state) => state.signOut);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const data = await addressesService.list(userId ?? 'demo-customer');
      if (mounted) setAddresses(data);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  function confirmSignOut() {
    Alert.alert('Sign out', 'Do you want to sign out of BiteRunner?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User color={Colors.accent.primary} size={30} />
          </View>
          <View style={styles.profileText}>
            <Text style={styles.name}>{profile?.display_name ?? 'BiteRunner Guest'}</Text>
            <Text style={styles.meta}>{profile?.phone ?? '+20 100 000 0000'}</Text>
            <Text style={styles.meta}>{profile?.role ?? 'customer'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="Saved addresses" />
          {addresses.map((address) => (
            <ProfileRow
              key={address.id}
              icon={<MapPin color={Colors.accent.primary} size={20} />}
              title={address.label}
              subtitle={`${address.line1}, ${address.city}`}
            />
          ))}
        </View>

        <View style={styles.section}>
          <SectionTitle title="Payment methods" />
          <ProfileRow
            icon={<CreditCard color={Colors.accent.primary} size={20} />}
            title="Visa ending in 4242"
            subtitle="Default card"
          />
          <ProfileRow
            icon={<CreditCard color={Colors.accent.primary} size={20} />}
            title="Cash on delivery"
            subtitle="Available for eligible orders"
          />
        </View>

        <View style={styles.section}>
          <SectionTitle title="Preferences" />
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Bell color={Colors.accent.primary} size={20} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Notifications</Text>
              <Text style={styles.rowSubtitle}>Order updates and offers</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: Colors.light.divider, true: Colors.accent.primaryLight }}
              thumbColor={notificationsEnabled ? Colors.accent.primary : '#FFFFFF'}
            />
          </View>
          <ProfileRow
            icon={<HelpCircle color={Colors.accent.primary} size={20} />}
            title="Help and Support"
            subtitle="FAQs, chat, and order support"
          />
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={confirmSignOut} activeOpacity={0.85}>
          <LogOut color={Colors.semantic.error} size={20} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function ProfileRow({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.85}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight color={Colors.light.textSecondary} size={18} />
    </TouchableOpacity>
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
    marginBottom: 20,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: Colors.accent.primary,
    borderRadius: 22,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  profileText: {
    flex: 1,
  },
  name: {
    ...Typography.h2,
    color: '#FFFFFF',
  },
  meta: {
    ...Typography.small,
    color: 'rgba(255,255,255,0.82)',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.light.textPrimary,
    marginBottom: 10,
  },
  row: {
    alignItems: 'center',
    backgroundColor: Colors.light.elevated,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
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
  signOutButton: {
    alignItems: 'center',
    backgroundColor: Colors.semantic.errorLight,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    marginTop: 16,
    padding: 16,
  },
  signOutText: {
    ...Typography.bodySemibold,
    color: Colors.semantic.error,
  },
});
