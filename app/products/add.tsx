
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { router } from 'expo-router';

export default function AddProductScreen() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inStock: true,
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    console.log('Product added:', formData);
    Alert.alert(
      'Success',
      'Product added successfully',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="xmark" color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Add Product</Text>
        <View style={{ width: 24 }} />
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
          <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>Product Name *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.colors.text,
              }
            ]}
            placeholder="Enter product name"
            placeholderTextColor={theme.dark ? '#666' : '#98989D'}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>Description</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.colors.text,
              }
            ]}
            placeholder="Describe your product"
            placeholderTextColor={theme.dark ? '#666' : '#98989D'}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />

          <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>Price (£) *</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.colors.text,
              }
            ]}
            placeholder="0.00"
            placeholderTextColor={theme.dark ? '#666' : '#98989D'}
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text })}
            keyboardType="decimal-pad"
          />

          <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>Category</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.colors.text,
              }
            ]}
            placeholder="e.g., Beverages, Pastries"
            placeholderTextColor={theme.dark ? '#666' : '#98989D'}
            value={formData.category}
            onChangeText={(text) => setFormData({ ...formData, category: text })}
          />

          <Pressable
            style={styles.stockToggle}
            onPress={() => setFormData({ ...formData, inStock: !formData.inStock })}
          >
            <Text style={[styles.stockToggleLabel, { color: theme.colors.text }]}>
              Available in stock
            </Text>
            <View style={[
              styles.toggle,
              { backgroundColor: formData.inStock ? '#34C759' : theme.dark ? '#333' : '#E5E5EA' }
            ]}>
              <View style={[
                styles.toggleThumb,
                formData.inStock && styles.toggleThumbActive
              ]} />
            </View>
          </Pressable>
        </GlassView>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <Pressable
          style={[styles.button, { backgroundColor: '#007AFF' }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Add Product</Text>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  formCard: {
    padding: 20,
    borderRadius: 12,
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
  stockToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
  },
  stockToggleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggle: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    padding: 2,
  },
  toggleThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
