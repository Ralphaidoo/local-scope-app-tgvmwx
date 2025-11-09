
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal';
  cardBrand?: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiryMonth?: string;
  expiryYear?: string;
  holderName: string;
  isDefault: boolean;
  createdAt: string;
}

export default function PaymentMethodsScreen() {
  const theme = useTheme();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const savedMethods = await AsyncStorage.getItem('payment_methods');
      if (savedMethods) {
        setPaymentMethods(JSON.parse(savedMethods));
      } else {
        // Mock payment methods for demo
        const mockMethods: PaymentMethod[] = [
          {
            id: '1',
            type: 'card',
            cardBrand: 'visa',
            last4: '4242',
            expiryMonth: '12',
            expiryYear: '25',
            holderName: 'John Doe',
            isDefault: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'card',
            cardBrand: 'mastercard',
            last4: '5555',
            expiryMonth: '08',
            expiryYear: '26',
            holderName: 'John Doe',
            isDefault: false,
            createdAt: new Date().toISOString(),
          },
        ];
        setPaymentMethods(mockMethods);
        await AsyncStorage.setItem('payment_methods', JSON.stringify(mockMethods));
      }
    } catch (error) {
      console.log('Error loading payment methods:', error);
    }
  };

  const setDefaultPaymentMethod = async (methodId: string) => {
    try {
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === methodId,
      }));
      setPaymentMethods(updatedMethods);
      await AsyncStorage.setItem('payment_methods', JSON.stringify(updatedMethods));
      Alert.alert('Success', 'Default payment method updated');
    } catch (error) {
      console.log('Error setting default payment method:', error);
      Alert.alert('Error', 'Failed to update default payment method');
    }
  };

  const deletePaymentMethod = async (methodId: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedMethods = paymentMethods.filter(method => method.id !== methodId);
              setPaymentMethods(updatedMethods);
              await AsyncStorage.setItem('payment_methods', JSON.stringify(updatedMethods));
              Alert.alert('Success', 'Payment method removed');
            } catch (error) {
              console.log('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to remove payment method');
            }
          },
        },
      ]
    );
  };

  const handleAddCard = async () => {
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic validation
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('Error', 'Invalid card number');
      return;
    }

    if (expiryDate.length !== 5 || !expiryDate.includes('/')) {
      Alert.alert('Error', 'Invalid expiry date (MM/YY)');
      return;
    }

    if (cvv.length !== 3) {
      Alert.alert('Error', 'Invalid CVV');
      return;
    }

    try {
      const [month, year] = expiryDate.split('/');
      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: 'card',
        cardBrand: 'visa', // In production, detect from card number
        last4: cardNumber.replace(/\s/g, '').slice(-4),
        expiryMonth: month,
        expiryYear: year,
        holderName: cardName,
        isDefault: paymentMethods.length === 0,
        createdAt: new Date().toISOString(),
      };

      const updatedMethods = [...paymentMethods, newMethod];
      setPaymentMethods(updatedMethods);
      await AsyncStorage.setItem('payment_methods', JSON.stringify(updatedMethods));

      // Reset form
      setCardNumber('');
      setCardName('');
      setExpiryDate('');
      setCvv('');
      setShowAddCard(false);

      Alert.alert('Success', 'Payment method added successfully');
    } catch (error) {
      console.log('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add payment method');
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const getCardIcon = (brand?: string) => {
    switch (brand) {
      case 'visa':
        return 'creditcard.fill';
      case 'mastercard':
        return 'creditcard.fill';
      case 'amex':
        return 'creditcard.fill';
      default:
        return 'creditcard';
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Payment Methods</Text>
        <Pressable onPress={() => setShowAddCard(!showAddCard)}>
          <IconSymbol name={showAddCard ? 'xmark' : 'plus'} color="#007AFF" size={24} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {showAddCard && (
          <GlassView
            style={[
              styles.addCardForm,
              Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}
            glassEffectStyle="regular"
          >
            <Text style={[styles.formTitle, { color: theme.colors.text }]}>
              Add New Card
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                Card Number
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: theme.colors.text,
                  }
                ]}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={theme.dark ? '#666' : '#98989D'}
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                Cardholder Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    color: theme.colors.text,
                  }
                ]}
                placeholder="John Doe"
                placeholderTextColor={theme.dark ? '#666' : '#98989D'}
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                  Expiry Date
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      color: theme.colors.text,
                    }
                  ]}
                  placeholder="MM/YY"
                  placeholderTextColor={theme.dark ? '#666' : '#98989D'}
                  value={expiryDate}
                  onChangeText={(text) => {
                    let formatted = text.replace(/\D/g, '');
                    if (formatted.length >= 2) {
                      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
                    }
                    setExpiryDate(formatted);
                  }}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                  CVV
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      color: theme.colors.text,
                    }
                  ]}
                  placeholder="123"
                  placeholderTextColor={theme.dark ? '#666' : '#98989D'}
                  value={cvv}
                  onChangeText={setCvv}
                  keyboardType="number-pad"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            <Pressable
              style={styles.addButton}
              onPress={handleAddCard}
            >
              <Text style={styles.addButtonText}>Add Card</Text>
            </Pressable>
          </GlassView>
        )}

        {paymentMethods.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="creditcard" color={theme.dark ? '#98989D' : '#666'} size={64} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Payment Methods
            </Text>
            <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
              Add a payment method to make purchases easier and faster.
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: theme.dark ? '#98989D' : '#666' }]}>
              SAVED CARDS
            </Text>
            {paymentMethods.map((method) => (
              <GlassView
                key={method.id}
                style={[
                  styles.paymentCard,
                  Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}
                glassEffectStyle="regular"
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <IconSymbol
                      name={getCardIcon(method.cardBrand)}
                      color={theme.colors.text}
                      size={32}
                    />
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardBrand, { color: theme.colors.text }]}>
                        {method.cardBrand?.toUpperCase()} •••• {method.last4}
                      </Text>
                      <Text style={[styles.cardHolder, { color: theme.dark ? '#98989D' : '#666' }]}>
                        {method.holderName}
                      </Text>
                      {method.expiryMonth && method.expiryYear && (
                        <Text style={[styles.cardExpiry, { color: theme.dark ? '#666' : '#999' }]}>
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </Text>
                      )}
                    </View>
                  </View>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardActions}>
                  {!method.isDefault && (
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => setDefaultPaymentMethod(method.id)}
                    >
                      <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>
                        Set as Default
                      </Text>
                    </Pressable>
                  )}
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => deletePaymentMethod(method.id)}
                  >
                    <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>
                      Remove
                    </Text>
                  </Pressable>
                </View>
              </GlassView>
            ))}
          </>
        )}

        <View style={[styles.securityNote, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
          <IconSymbol name="lock.shield.fill" color="#34C759" size={20} />
          <Text style={[styles.securityText, { color: theme.dark ? '#98989D' : '#666' }]}>
            Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
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
    paddingBottom: 32,
  },
  addCardForm: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  paymentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  cardInfo: {
    flex: 1,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardHolder: {
    fontSize: 14,
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 12,
  },
  defaultBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
