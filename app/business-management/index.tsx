
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { BusinessCategory, LondonBorough } from '@/types';
import { categories, boroughs } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

export default function BusinessManagementScreen() {
  const theme = useTheme();
  const { user, canAddBusiness, getBusinessLimit } = useAuth();
  const [step, setStep] = useState(1);
  
  // Form state
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BusinessCategory | null>(null);
  const [borough, setBorough] = useState<LondonBorough | null>(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  const businessLimit = getBusinessLimit();
  const currentBusinessCount = user?.businessListingCount || 0;
  const subscriptionPlan = user?.subscriptionPlan || 'free';

  const handleSubmit = () => {
    if (!canAddBusiness()) {
      Alert.alert(
        'Business Limit Reached',
        `You have reached the maximum number of businesses (${businessLimit}) for your ${subscriptionPlan} plan. ${subscriptionPlan === 'free' ? 'Upgrade to Pro to list up to 5 businesses.' : 'Please remove an existing business to add a new one.'}`,
        [
          { text: 'OK', style: 'cancel' },
          ...(subscriptionPlan === 'free' ? [{
            text: 'Upgrade to Pro',
            onPress: () => router.push('/subscription')
          }] : [])
        ]
      );
      return;
    }

    if (!businessName || !description || !category || !borough || !address || !phone || !email) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    Alert.alert(
      'Success',
      'Your business has been submitted for review. You will be notified once it is approved.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const renderStep1 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Basic Information
      </Text>
      
      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
        Business Name *
      </Text>
      <GlassView
        style={[
          styles.input,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}
        glassEffectStyle="regular"
      >
        <TextInput
          style={[styles.textInput, { color: theme.colors.text }]}
          placeholder="Enter business name"
          placeholderTextColor={theme.dark ? '#98989D' : '#666'}
          value={businessName}
          onChangeText={setBusinessName}
        />
      </GlassView>

      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
        Description *
      </Text>
      <GlassView
        style={[
          styles.input,
          styles.textArea,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}
        glassEffectStyle="regular"
      >
        <TextInput
          style={[styles.textInput, { color: theme.colors.text }]}
          placeholder="Describe your business"
          placeholderTextColor={theme.dark ? '#98989D' : '#666'}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </GlassView>

      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
        Category *
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map(cat => (
          <Pressable
            key={cat}
            style={[
              styles.categoryChip,
              category === cat && styles.categoryChipActive,
              { borderColor: theme.dark ? '#333' : '#ddd' }
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[
              styles.categoryChipText,
              { color: category === cat ? '#fff' : theme.colors.text }
            ]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable
        style={[styles.nextButton, { backgroundColor: '#007AFF' }]}
        onPress={() => setStep(2)}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </Pressable>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Location Details
      </Text>

      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
        Borough *
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {boroughs.slice(0, 15).map(bor => (
          <Pressable
            key={bor}
            style={[
              styles.categoryChip,
              borough === bor && styles.categoryChipActive,
              { borderColor: theme.dark ? '#333' : '#ddd' }
            ]}
            onPress={() => setBorough(bor)}
          >
            <Text style={[
              styles.categoryChipText,
              { color: borough === bor ? '#fff' : theme.colors.text }
            ]}>
              {bor}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
        Address *
      </Text>
      <GlassView
        style={[
          styles.input,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}
        glassEffectStyle="regular"
      >
        <TextInput
          style={[styles.textInput, { color: theme.colors.text }]}
          placeholder="Enter full address"
          placeholderTextColor={theme.dark ? '#98989D' : '#666'}
          value={address}
          onChangeText={setAddress}
        />
      </GlassView>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.backButton, { borderColor: theme.dark ? '#333' : '#ddd' }]}
          onPress={() => setStep(1)}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>Back</Text>
        </Pressable>
        <Pressable
          style={[styles.nextButton, { backgroundColor: '#007AFF', flex: 1 }]}
          onPress={() => setStep(3)}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Contact Information
      </Text>

      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
        Phone Number *
      </Text>
      <GlassView
        style={[
          styles.input,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}
        glassEffectStyle="regular"
      >
        <TextInput
          style={[styles.textInput, { color: theme.colors.text }]}
          placeholder="+44 20 1234 5678"
          placeholderTextColor={theme.dark ? '#98989D' : '#666'}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </GlassView>

      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
        Email Address *
      </Text>
      <GlassView
        style={[
          styles.input,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}
        glassEffectStyle="regular"
      >
        <TextInput
          style={[styles.textInput, { color: theme.colors.text }]}
          placeholder="business@example.com"
          placeholderTextColor={theme.dark ? '#98989D' : '#666'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </GlassView>

      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
        Website (Optional)
      </Text>
      <GlassView
        style={[
          styles.input,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}
        glassEffectStyle="regular"
      >
        <TextInput
          style={[styles.textInput, { color: theme.colors.text }]}
          placeholder="https://www.example.com"
          placeholderTextColor={theme.dark ? '#98989D' : '#666'}
          value={website}
          onChangeText={setWebsite}
          keyboardType="url"
          autoCapitalize="none"
        />
      </GlassView>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.backButton, { borderColor: theme.dark ? '#333' : '#ddd' }]}
          onPress={() => setStep(2)}
        >
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>Back</Text>
        </Pressable>
        <Pressable
          style={[styles.submitButton, { backgroundColor: '#34C759', flex: 1 }]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Submit Business</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButtonHeader}>
          <IconSymbol name="chevron.left" color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Add Business</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Subscription Warning */}
        {!canAddBusiness() && (
          <GlassView
            style={[
              styles.warningCard,
              Platform.OS !== 'ios' && { backgroundColor: 'rgba(255, 59, 48, 0.1)' }
            ]}
            glassEffectStyle="regular"
          >
            <IconSymbol name="exclamationmark.triangle.fill" color="#FF3B30" size={24} />
            <View style={styles.warningContent}>
              <Text style={[styles.warningTitle, { color: '#FF3B30' }]}>
                Business Limit Reached
              </Text>
              <Text style={[styles.warningText, { color: theme.colors.text }]}>
                You have reached the maximum of {businessLimit} businesses for your {subscriptionPlan} plan.
                {subscriptionPlan === 'free' && ' Upgrade to Pro to list up to 5 businesses.'}
              </Text>
              {subscriptionPlan === 'free' && (
                <Pressable
                  style={styles.upgradeButtonSmall}
                  onPress={() => router.push('/subscription')}
                >
                  <Text style={styles.upgradeButtonSmallText}>Upgrade to Pro</Text>
                </Pressable>
              )}
            </View>
          </GlassView>
        )}

        {/* Business Limit Info */}
        <GlassView
          style={[
            styles.infoCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
              Current Plan:
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {subscriptionPlan === 'free' ? 'Free' : 'Pro'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
              Businesses:
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {currentBusinessCount} / {businessLimit}
            </Text>
          </View>
        </GlassView>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map(s => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s === step && styles.progressDotActive,
                s < step && styles.progressDotComplete,
                { backgroundColor: s <= step ? '#007AFF' : theme.dark ? '#333' : '#ddd' }
              ]}
            />
          ))}
        </View>

        {/* Form Steps */}
        <GlassView
          style={[
            styles.formCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonHeader: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContent: {
    paddingVertical: 8,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  warningCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  upgradeButtonSmall: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  upgradeButtonSmallText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  progressDot: {
    width: 40,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    width: 60,
  },
  progressDotComplete: {
    opacity: 1,
  },
  formCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 100,
  },
  textInput: {
    fontSize: 16,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
