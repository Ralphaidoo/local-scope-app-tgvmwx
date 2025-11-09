
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';

export default function EditProfileScreen() {
  const theme = useTheme();
  const { user, updateProfile } = useAuth();
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      // Check if email has changed
      const emailChanged = email.trim() !== user?.email;
      
      if (emailChanged) {
        // Update email through Supabase Auth
        const { error: emailError } = await supabase.auth.updateUser({
          email: email.trim(),
        });

        if (emailError) {
          console.log('Error updating email:', emailError);
          Alert.alert('Error', emailError.message || 'Failed to update email. Please try again.');
          setIsLoading(false);
          return;
        }

        // Show confirmation message about email verification
        Alert.alert(
          'Email Update Initiated',
          'A confirmation email has been sent to your new email address. Please check your inbox and click the confirmation link to complete the email change. Your old email will remain active until you confirm the new one.',
          [{ text: 'OK' }]
        );
      }

      // Update profile information
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      
      if (!emailChanged) {
        Alert.alert(
          'Success',
          'Your profile has been updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        // If email changed, don't navigate back immediately so user can see the message
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    } catch (error: any) {
      console.log('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GlassView
          style={[
            styles.formCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: theme.dark ? '#333' : '#ddd' }]}>
              <IconSymbol name="person.fill" color={theme.colors.text} size={40} />
            </View>
            <Text style={[styles.avatarHint, { color: theme.dark ? '#98989D' : '#666' }]}>
              Profile picture coming soon
            </Text>
          </View>

          {/* Full Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }
              ]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor={theme.dark ? '#666' : '#999'}
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={theme.dark ? '#666' : '#999'}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <Text style={[styles.hint, { color: theme.dark ? '#666' : '#999' }]}>
              Changing your email will require verification. You&apos;ll receive a confirmation link at your new email address.
            </Text>
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Phone Number (Optional)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }
              ]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              placeholderTextColor={theme.dark ? '#666' : '#999'}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>

          {/* User Type Badge (Read-only) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Account Type</Text>
            <View style={[
              styles.input,
              styles.readOnlyInput,
              {
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              }
            ]}>
              <Text style={[styles.readOnlyText, { color: theme.dark ? '#666' : '#999' }]}>
                {user?.userType === 'customer' ? 'Customer' : user?.userType === 'business_user' ? 'Business Owner' : 'Admin'}
              </Text>
            </View>
          </View>
        </GlassView>

        {/* Save Button */}
        <Pressable
          style={[
            styles.saveButton,
            { backgroundColor: '#007AFF' },
            isLoading && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Text>
        </Pressable>

        {/* Info Card */}
        <GlassView
          style={[
            styles.infoCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <IconSymbol name="info.circle" color="#007AFF" size={24} />
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            Your profile information is used to personalize your experience and communicate with businesses. Email changes require verification for security.
          </Text>
        </GlassView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarHint: {
    fontSize: 12,
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
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  readOnlyInput: {
    justifyContent: 'center',
  },
  readOnlyText: {
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  saveButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
