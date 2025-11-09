
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { GlassView } from 'expo-glass-effect';
import { IconSymbol } from '@/components/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { UserType } from '@/types';

export default function OnboardingScreen() {
  const theme = useTheme();
  const { signup } = useAuth();
  const params = useLocalSearchParams();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const email = params.email as string;
  const password = params.password as string;
  const fullName = params.fullName as string;

  const handleContinue = async () => {
    if (!selectedType) {
      setError('Please select an account type');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signup(email, password, fullName, selectedType);
      // After successful signup, redirect to auth screen to sign in
      // The signup function will show an alert about email verification
      router.replace('/auth');
    } catch (err: any) {
      console.log('Signup error:', err);
      // Error is already shown in Alert by the auth context
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Choose Your Account Type
          </Text>
          <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
            Select how you&apos;ll be using Local Scope
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          <Pressable
            style={[
              styles.optionCard,
              selectedType === 'customer' && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedType('customer')}
            disabled={loading}
          >
            <GlassView
              style={[
                styles.optionContent,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}
              glassEffectStyle="regular"
            >
              <View style={[styles.iconContainer, { backgroundColor: '#007AFF' }]}>
                <IconSymbol name="person.fill" size={32} color="#fff" />
              </View>
              <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
                Customer
              </Text>
              <Text style={[styles.optionDescription, { color: theme.dark ? '#98989D' : '#666' }]}>
                Discover and connect with local businesses
              </Text>
              {selectedType === 'customer' && (
                <View style={styles.checkmark}>
                  <IconSymbol name="checkmark.circle.fill" size={24} color="#007AFF" />
                </View>
              )}
            </GlassView>
          </Pressable>

          <Pressable
            style={[
              styles.optionCard,
              selectedType === 'business_user' && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedType('business_user')}
            disabled={loading}
          >
            <GlassView
              style={[
                styles.optionContent,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}
              glassEffectStyle="regular"
            >
              <View style={[styles.iconContainer, { backgroundColor: '#34C759' }]}>
                <IconSymbol name="briefcase.fill" size={32} color="#fff" />
              </View>
              <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
                Business Owner
              </Text>
              <Text style={[styles.optionDescription, { color: theme.dark ? '#98989D' : '#666' }]}>
                List and manage your business
              </Text>
              {selectedType === 'business_user' && (
                <View style={styles.checkmark}>
                  <IconSymbol name="checkmark.circle.fill" size={24} color="#34C759" />
                </View>
              )}
            </GlassView>
          </Pressable>
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <Pressable
          style={[styles.continueButton, (!selectedType || loading) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedType || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>Create Account</Text>
          )}
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
            Go Back
          </Text>
        </Pressable>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  optionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionCardSelected: {
    transform: [{ scale: 0.98 }],
  },
  optionContent: {
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
