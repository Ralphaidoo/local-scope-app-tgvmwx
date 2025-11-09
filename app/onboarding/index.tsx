
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useAuth } from '@/contexts/AuthContext';
import { UserType } from '@/types';

export default function OnboardingScreen() {
  const theme = useTheme();
  const { signup, updateProfile, user } = useAuth();
  const params = useLocalSearchParams();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const email = params.email as string;
  const password = params.password as string;
  const fullName = params.fullName as string;

  const handleContinue = async () => {
    if (!selectedType) {
      Alert.alert('Selection Required', 'Please select your account type to continue.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('=== ONBOARDING START ===');
      console.log('Selected type:', selectedType);
      
      if (!user) {
        console.log('No user yet, signing up...');
        await signup(email, password, fullName, selectedType);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log('User exists, updating profile...');
        await updateProfile({
          userType: selectedType,
        });
      }

      console.log('Onboarding complete, navigating...');
      
      if (selectedType === 'admin') {
        router.replace('/(tabs)/admin');
      } else if (selectedType === 'business_user') {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/(tabs)/(home)/');
      }
      
      console.log('=== ONBOARDING END ===');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const userTypes: Array<{
    type: UserType;
    title: string;
    description: string;
    icon: string;
    color: string;
  }> = [
    {
      type: 'customer',
      title: 'Customer',
      description: 'Discover and connect with local businesses, book services, and shop products.',
      icon: 'person.fill',
      color: '#007AFF',
    },
    {
      type: 'business_user',
      title: 'Business Owner',
      description: 'List your business, manage bookings, sell products, and grow your local presence.',
      icon: 'building.2.fill',
      color: '#34C759',
    },
    {
      type: 'admin',
      title: 'Administrator',
      description: 'Manage the platform, moderate content, and oversee all users and businesses.',
      icon: 'shield.fill',
      color: '#FF3B30',
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Welcome to Local Scope
          </Text>
          <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
            Choose your account type to get started
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {userTypes.map((userType) => (
            <Pressable
              key={userType.type}
              onPress={() => setSelectedType(userType.type)}
              style={({ pressed }) => [
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <GlassView
                style={[
                  styles.optionCard,
                  selectedType === userType.type && styles.optionCardSelected,
                  Platform.OS !== 'ios' && {
                    backgroundColor: selectedType === userType.type
                      ? theme.dark ? 'rgba(0,122,255,0.2)' : 'rgba(0,122,255,0.1)'
                      : theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                  }
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
                  <View style={styles.checkmark}>
                    <IconSymbol name="checkmark.circle.fill" color="#007AFF" size={28} />
                  </View>
                )}
              </GlassView>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              {
                backgroundColor: selectedType ? '#007AFF' : theme.dark ? '#333' : '#ddd',
                opacity: pressed ? 0.7 : 1,
              }
            ]}
            onPress={handleContinue}
            disabled={!selectedType || isLoading}
          >
            <Text style={[
              styles.continueButtonText,
              { color: selectedType ? '#fff' : theme.dark ? '#666' : '#999' }
            ]}>
              {isLoading ? 'Setting up...' : 'Continue'}
            </Text>
            {!isLoading && selectedType && (
              <IconSymbol name="arrow.right" color="#fff" size={20} />
            )}
          </Pressable>

          <Text style={[styles.footerNote, { color: theme.dark ? '#666' : '#999' }]}>
            You can change your account type later in settings
          </Text>
        </View>
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
    padding: 24,
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
    lineHeight: 24,
  },
  optionsContainer: {
    flex: 1,
    gap: 16,
  },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
  checkmark: {
    marginLeft: 8,
  },
  footer: {
    gap: 16,
    paddingTop: 24,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 14,
    textAlign: 'center',
  },
});
