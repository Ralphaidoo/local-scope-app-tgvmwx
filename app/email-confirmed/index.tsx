
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { GlassView } from 'expo-glass-effect';
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';

export default function EmailConfirmedScreen() {
  const theme = useTheme();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    handleEmailConfirmation();
  }, []);

  const handleEmailConfirmation = async () => {
    try {
      // Get the current session to check if email is verified
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.log('Email confirmation error:', error);
        setStatus('error');
        setMessage('Failed to verify email. Please try again.');
        return;
      }

      if (session) {
        console.log('Email confirmed successfully');
        setStatus('success');
        setMessage('Email verified successfully!');
        
        // Wait a moment before redirecting
        setTimeout(() => {
          router.replace('/(tabs)/(home)/');
        }, 2000);
      } else {
        // No session yet, might need to wait for the auth state change
        setStatus('success');
        setMessage('Email verified! Please sign in to continue.');
        
        setTimeout(() => {
          router.replace('/auth');
        }, 2000);
      }
    } catch (err) {
      console.log('Email confirmation error:', err);
      setStatus('error');
      setMessage('An error occurred. Please try signing in.');
    }
  };

  const handleContinue = () => {
    if (status === 'success') {
      router.replace('/(tabs)/(home)/');
    } else {
      router.replace('/auth');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.container}>
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          {status === 'loading' && (
            <>
              <ActivityIndicator size="large" color="#007AFF" style={styles.icon} />
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Verifying Email
              </Text>
              <Text style={[styles.message, { color: theme.dark ? '#98989D' : '#666' }]}>
                {message}
              </Text>
            </>
          )}

          {status === 'success' && (
            <>
              <View style={[styles.iconContainer, { backgroundColor: '#34C759' }]}>
                <IconSymbol name="checkmark.circle.fill" size={64} color="#fff" />
              </View>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Email Verified!
              </Text>
              <Text style={[styles.message, { color: theme.dark ? '#98989D' : '#666' }]}>
                {message}
              </Text>
              <Pressable
                style={styles.button}
                onPress={handleContinue}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </Pressable>
            </>
          )}

          {status === 'error' && (
            <>
              <View style={[styles.iconContainer, { backgroundColor: '#FF3B30' }]}>
                <IconSymbol name="xmark.circle.fill" size={64} color="#fff" />
              </View>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Verification Failed
              </Text>
              <Text style={[styles.message, { color: theme.dark ? '#98989D' : '#666' }]}>
                {message}
              </Text>
              <Pressable
                style={styles.button}
                onPress={handleContinue}
              >
                <Text style={styles.buttonText}>Go to Sign In</Text>
              </Pressable>
            </>
          )}
        </GlassView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
