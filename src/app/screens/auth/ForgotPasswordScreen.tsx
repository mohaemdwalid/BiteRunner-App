import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/auth.service';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function ForgotPasswordScreen() {
  const nav = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const send = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await authService.resetPassword(email.trim());
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => nav.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.icon}>🔑</Text>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your email and we'll send a reset link.</Text>

      {sent ? (
        <View style={styles.success}>
          <Text style={styles.successText}>✅ Check your inbox for a reset link.</Text>
        </View>
      ) : (
        <>
          <TextInput style={styles.input} placeholder="Your email address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={send} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 32, paddingTop: 60 },
  back: { marginBottom: 40 },
  backText: { ...Typography.body, color: Colors.accent.primary },
  icon: { fontSize: 52, textAlign: 'center', marginBottom: 20 },
  title: { ...Typography.h1, textAlign: 'center', marginBottom: 8 },
  subtitle: { ...Typography.body, color: '#888', textAlign: 'center', marginBottom: 40 },
  input: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#FAFAFA', marginBottom: 20 },
  button: { backgroundColor: Colors.accent.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...Typography.bodySemibold, color: '#fff', fontSize: 17 },
  success: { backgroundColor: '#F0FFF4', padding: 20, borderRadius: 12 },
  successText: { ...Typography.body, color: '#22C55E', textAlign: 'center' },
});
