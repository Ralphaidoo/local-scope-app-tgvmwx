
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { GlassView } from 'expo-glass-effect';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthScreen() {
  const theme = useTheme();
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        router.replace('/(tabs)/(home)/');
      } else {
        // For signup, we'll redirect to onboarding to select user type
        router.push({
          pathname: '/onboarding',
          params: { email, password, fullName }
        });
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
      console.log('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
            {isLogin ? 'Sign in to continue' : 'Join Local Scope today'}
          </Text>
        </View>

        <GlassView
          style={[
            styles.formContainer,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text, borderColor: theme.dark ? '#333' : '#ddd' }]}
                placeholder="John Doe"
                placeholderTextColor={theme.dark ? '#98989D' : '#666'}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.dark ? '#333' : '#ddd' }]}
              placeholder="you@example.com"
              placeholderTextColor={theme.dark ? '#98989D' : '#666'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.dark ? '#333' : '#ddd' }]}
              placeholder="••••••••"
              placeholderTextColor={theme.dark ? '#98989D' : '#666'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Pressable
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Continue'}
            </Text>
          </Pressable>

          <Pressable
            style={styles.switchButton}
            onPress={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            <Text style={[styles.switchButtonText, { color: theme.colors.primary }]}>
              {isLogin ? 'Don\'t have an account? Sign up' : 'Already have an account? Sign in'}
            </Text>
          </Pressable>
        </GlassView>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.dark ? '#98989D' : '#666' }]}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
