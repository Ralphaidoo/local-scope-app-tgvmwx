
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { router } from 'expo-router';
import { BusinessCategory, LondonBorough } from '@/types';
import { categories, boroughs } from '@/data/mockData';

export default function BusinessManagementScreen() {
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '' as BusinessCategory | '',
    borough: '' as LondonBorough | '',
    neighborhood: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });

  const handleSubmit = () => {
    console.log('Business submitted:', formData);
    Alert.alert(
      'Success',
      'Your business has been submitted for review. We will notify you once it is approved.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const renderStep1 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Basic Information</Text>
      
      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>Business Name *</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            color: theme.colors.text,
          }
        ]}
        placeholder="Enter business name"
        placeholderTextColor={theme.dark ? '#666' : '#98989D'}
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />

      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>Description *</Text>
      <TextInput
        style={[
          styles.input,
          styles.textArea,
          {
            backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            color: theme.colors.text,
          }
        ]}
        placeholder="Describe your business"
        placeholderTextColor={theme.dark ? '#666' : '#98989D'}
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        multiline
        numberOfLines={4}
      />

      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>Category *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map(cat => (
          <Pressable
            key={cat.name}
            style={[
              styles.categoryChip,
              formData.category === cat.name && styles.categoryChipSelected,
              {
                backgroundColor: formData.category === cat.name
                  ? '#007AFF'
                  : theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              }
            ]}
            onPress={() => setFormData({ ...formData, category: cat.name })}
          >
            <Text style={[
              styles.categoryChipText,
              { color: formData.category === cat.name ? '#fff' : theme.colors.text }
            ]}>
              {cat.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Location Details</Text>
      
      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>Borough *</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {boroughs.slice(0, 10).map(borough => (
          <Pressable
            key={borough}
            style={[
              styles.categoryChip,
              formData.borough === borough && styles.categoryChipSelected,
              {
                backgroundColor: formData.borough === borough
                  ? '#007AFF'
                  : theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              }
            ]}
            onPress={() => setFormData({ ...formData, borough })}
          >
            <Text style={[
              styles.categoryChipText,
              { color: formData.borough === borough ? '#fff' : theme.colors.text }
            ]}>
              {borough}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>Neighborhood *</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            color: theme.colors.text,
          }
        ]}
        placeholder="e.g., Camden Town"
        placeholderTextColor={theme.dark ? '#666' : '#98989D'}
        value={formData.neighborhood}
        onChangeText={(text) => setFormData({ ...formData, neighborhood: text })}
      />

      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>Full Address *</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            color: theme.colors.text,
          }
        ]}
        placeholder="Street address, postcode"
        placeholderTextColor={theme.dark ? '#666' : '#98989D'}
        value={formData.address}
        onChangeText={(text) => setFormData({ ...formData, address: text })}
      />
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Contact Information</Text>
      
      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>Phone Number *</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            color: theme.colors.text,
          }
        ]}
        placeholder="+44 20 1234 5678"
        placeholderTextColor={theme.dark ? '#666' : '#98989D'}
        value={formData.phone}
        onChangeText={(text) => setFormData({ ...formData, phone: text })}
        keyboardType="phone-pad"
      />

      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>Email *</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            color: theme.colors.text,
          }
        ]}
        placeholder="business@example.com"
        placeholderTextColor={theme.dark ? '#666' : '#98989D'}
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>Website (Optional)</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            color: theme.colors.text,
          }
        ]}
        placeholder="https://www.example.com"
        placeholderTextColor={theme.dark ? '#666' : '#98989D'}
        value={formData.website}
        onChangeText={(text) => setFormData({ ...formData, website: text })}
        keyboardType="url"
        autoCapitalize="none"
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="xmark" color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Add Business</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map(num => (
          <View
            key={num}
            style={[
              styles.progressDot,
              {
                backgroundColor: num <= step
                  ? '#007AFF'
                  : theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }
            ]}
          />
        ))}
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
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </GlassView>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        {step > 1 && (
          <Pressable
            style={[styles.button, styles.buttonSecondary, { borderColor: '#007AFF' }]}
            onPress={() => setStep(step - 1)}
          >
            <Text style={[styles.buttonText, { color: '#007AFF' }]}>Back</Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.button, styles.buttonPrimary, { backgroundColor: '#007AFF' }]}
          onPress={() => {
            if (step < 3) {
              setStep(step + 1);
            } else {
              handleSubmit();
            }
          }}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>
            {step === 3 ? 'Submit' : 'Next'}
          </Text>
        </Pressable>
      </View>
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
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  formCard: {
    padding: 20,
    borderRadius: 12,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
