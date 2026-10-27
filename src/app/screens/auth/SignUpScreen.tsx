import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/auth.service';
import { useAppStore } from '../../state/appStore';
import { UserRole } from '../../../types/models';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

const ROLES: { label: string; value: UserRole; icon: string }[] = [
  { label: 'Customer', value: 'customer', icon: '🛍️' },
  { label: 'Restaurant', value: 'restaurant_owner', icon: '🍽️' },
  { label: 'Driver', value: 'driver', icon: '🏍️' },
];

export default function SignUpScreen() {
  const nav = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const loadProfile = useAppStore((state) => state.loadProfile);

  const signUp = async () => {
    if (!name || !email || !password) { Alert.alert('Please fill all fields'); return; }
    setLoading(true);
    try {
      const result = await authService.signUp(email.trim(), password, name.trim(), role);
      if (result.user?.id) await loadProfile(result.user.id);
    } catch (e: any) {
      Alert.alert('Sign Up Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join BiteRunner today</Text>

        <Text style={styles.sectionLabel}>I AM A</Text>
        <View style={styles.roles}>
          {ROLES.map((r) => (
            <TouchableOpacity key={r.value} style={[styles.roleCard, role === r.value && styles.roleCardActive]} onPress={() => setRole(r.value)}>
              <Text style={styles.roleIcon}>{r.icon}</Text>
              <Text style={[styles.roleLabel, role === r.value && styles.roleLabelActive]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} placeholder="e.g. Ahmed Mostafa" value={name} onChangeText={setName} />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Min. 6 characters" value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={signUp} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => nav.navigate('SignIn')} style={styles.link}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 32, paddingTop: 60 },
  back: { marginBottom: 24 },
  backText: { ...Typography.body, color: Colors.accent.primary },
  title: { ...Typography.h1, marginBottom: 6 },
  subtitle: { ...Typography.body, color: '#888', marginBottom: 32 },
  sectionLabel: { ...Typography.label, color: '#888', marginBottom: 12 },
  roles: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  roleCard: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E5E5', backgroundColor: '#FAFAFA' },
  roleCardActive: { borderColor: Colors.accent.primary, backgroundColor: Colors.accent.primaryLight },
  roleIcon: { fontSize: 28, marginBottom: 6 },
  roleLabel: { ...Typography.smallMedium, color: '#888' },
  roleLabelActive: { color: Colors.accent.primary, fontWeight: '600' },
  field: { marginBottom: 20 },
  label: { ...Typography.smallMedium, color: '#555', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#FAFAFA' },
  button: { backgroundColor: Colors.accent.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 20, marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...Typography.bodySemibold, color: '#fff', fontSize: 17 },
  link: { alignItems: 'center', paddingBottom: 32 },
  linkText: { ...Typography.body, color: '#888' },
  linkBold: { color: Colors.accent.primary, fontWeight: '600' },
});
