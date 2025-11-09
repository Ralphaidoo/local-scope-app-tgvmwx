
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
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

  const userTypes = [
    {
      type: 'customer' as UserType,
      title: 'Customer',
      description: 'Discover and shop from local businesses',
      icon: 'person.fill',
      color: '#007AFF',
    },
    {
      type: 'business' as UserType,
      title: 'Business Owner',
      description: 'List your business and reach local customers',
      icon: 'building.2.fill',
      color: '#34C759',
    },
  ];

  const handleContinue = async () => {
    if (!selectedType) return;

    setLoading(true);
    try {
      await signup(
        params.email as string,
        params.password as string,
        params.fullName as string,
        selectedType
      );
      router.replace('/(tabs)/(home)/');
    } catch (error) {
      console.log('Signup error:', error);
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
            Select how you want to use Local Scope
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {userTypes.map(userType => (
            <Pressable
              key={userType.type}
              onPress={() => setSelectedType(userType.type)}
            >
              <GlassView
                style={[
                  styles.optionCard,
                  selectedType === userType.type && styles.optionCardSelected,
                  Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}
                glassEffectStyle="regular"
              >
                <View style={[styles.iconContainer, { backgroundColor: userType.color }]}>
                  <IconSymbol name={userType.icon} color="#fff" size={32} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
                    {userType.title}
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.dark ? '#98989D' : '#666' }]}>
                    {userType.description}
                  </Text>
                </View>
                {selectedType === userType.type && (
                  <IconSymbol name="checkmark.circle.fill" color={userType.color} size={24} />
                )}
              </GlassView>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.continueButton, !selectedType && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedType || loading}
        >
          <Text style={styles.continueButtonText}>
            {loading ? 'Creating Account...' : 'Continue'}
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#007AFF',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
  },
  continueButtonDisabled: {
    opacity: 0.4,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
