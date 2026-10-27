import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/auth.service';
import { useAppStore } from '../../state/appStore';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function SignInScreen() {
  const nav = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const loadProfile = useAppStore((state) => state.loadProfile);

  const signIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const result = await authService.signIn(email.trim(), password);
      if (result.user?.id) await loadProfile(result.user.id);
    } catch (e: any) {
      Alert.alert('Sign In Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.logo}>🍔</Text>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} placeholder="Enter your password" value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <TouchableOpacity onPress={() => nav.navigate('ForgotPassword')} style={styles.forgot}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={signIn} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => nav.navigate('SignUp')} style={styles.link}>
          <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Sign Up</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, padding: 32, justifyContent: 'center' },
  logo: { fontSize: 52, textAlign: 'center', marginBottom: 16 },
  title: { ...Typography.h1, textAlign: 'center', marginBottom: 6 },
  subtitle: { ...Typography.body, color: '#888', textAlign: 'center', marginBottom: 40 },
  field: { marginBottom: 20 },
  label: { ...Typography.smallMedium, color: '#555', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#E5E5E5', borderRadius: 12, padding: 14, fontSize: 15, backgroundColor: '#FAFAFA' },
  forgot: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { ...Typography.small, color: Colors.accent.primary },
  button: { backgroundColor: Colors.accent.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 20 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { ...Typography.bodySemibold, color: '#fff', fontSize: 17 },
  link: { alignItems: 'center' },
  linkText: { ...Typography.body, color: '#888' },
  linkBold: { color: Colors.accent.primary, fontWeight: '600' },
});
