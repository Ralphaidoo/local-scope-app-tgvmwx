
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { router } from 'expo-router';
import { useCart } from '@/contexts/CartContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal';
  cardBrand?: 'visa' | 'mastercard' | 'amex';
  last4: string;
  holderName: string;
  isDefault: boolean;
}

export default function CheckoutScreen() {
  const theme = useTheme();
  const { items, getTotal, clearCart } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  const subtotal = getTotal();
  const deliveryFee = 2.50;
  const total = subtotal + deliveryFee - discount;

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const savedMethods = await AsyncStorage.getItem('payment_methods');
      if (savedMethods) {
        const methods: PaymentMethod[] = JSON.parse(savedMethods);
        setPaymentMethods(methods);
        const defaultMethod = methods.find(m => m.isDefault);
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod);
        } else if (methods.length > 0) {
          setSelectedPaymentMethod(methods[0]);
        }
      }
    } catch (error) {
      console.log('Error loading payment methods:', error);
    }
  };

  const handleApplyPromo = () => {
    // Mock promo code validation
    if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscount(subtotal * 0.1);
      Alert.alert('Success', '10% discount applied!');
    } else if (promoCode.toUpperCase() === 'SAVE20') {
      setDiscount(subtotal * 0.2);
      Alert.alert('Success', '20% discount applied!');
    } else {
      Alert.alert('Error', 'Invalid promo code');
    }
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter a delivery address');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    try {
      // Create order
      const order = {
        id: Date.now().toString(),
        userId: '1',
        items,
        total,
        status: 'pending',
        paymentMethod: `${selectedPaymentMethod.cardBrand?.toUpperCase()} •••• ${selectedPaymentMethod.last4}`,
        deliveryAddress,
        promoCode: promoCode || undefined,
        discount: discount > 0 ? discount : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save order
      const savedOrders = await AsyncStorage.getItem('orders');
      const orders = savedOrders ? JSON.parse(savedOrders) : [];
      orders.unshift(order);
      await AsyncStorage.setItem('orders', JSON.stringify(orders));

      // Create notification
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const notifications = savedNotifications ? JSON.parse(savedNotifications) : [];
      notifications.unshift({
        id: Date.now().toString(),
        type: 'order',
        title: 'Order Placed',
        message: `Your order #${order.id.slice(-6)} has been placed successfully. Total: £${total.toFixed(2)}`,
        read: false,
        createdAt: new Date().toISOString(),
        actionRoute: `/orders/${order.id}`,
      });
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));

      console.log('Order placed:', order);

      Alert.alert(
        'Order Placed!',
        'Your order has been placed successfully. You will receive a confirmation shortly.',
        [
          {
            text: 'View Order',
            onPress: () => {
              clearCart();
              router.replace(`/orders/${order.id}` as any);
            },
          },
          {
            text: 'Continue Shopping',
            onPress: () => {
              clearCart();
              router.replace('/(tabs)/(home)');
            },
          },
        ]
      );
    } catch (error) {
      console.log('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  };

  const handleSelectPaymentMethod = () => {
    router.push('/payment-methods' as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address */}
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Delivery Address</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.colors.text,
              }
            ]}
            placeholder="Enter your delivery address"
            placeholderTextColor={theme.dark ? '#666' : '#98989D'}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={3}
          />
        </GlassView>

        {/* Promo Code */}
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Promo Code</Text>
          <View style={styles.promoContainer}>
            <TextInput
              style={[
                styles.promoInput,
                {
                  backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  color: theme.colors.text,
                }
              ]}
              placeholder="Enter code (try SAVE10 or SAVE20)"
              placeholderTextColor={theme.dark ? '#666' : '#98989D'}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <Pressable
              style={[styles.applyButton, { backgroundColor: '#007AFF' }]}
              onPress={handleApplyPromo}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </Pressable>
          </View>
        </GlassView>

        {/* Order Summary */}
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
              Subtotal ({items.length} items)
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              £{subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
              Delivery Fee
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              £{deliveryFee.toFixed(2)}
            </Text>
          </View>
          {discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#34C759' }]}>
                Discount
              </Text>
              <Text style={[styles.summaryValue, { color: '#34C759' }]}>
                -£{discount.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
              Total
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.text }]}>
              £{total.toFixed(2)}
            </Text>
          </View>
        </GlassView>

        {/* Payment Method */}
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Payment Method</Text>
          {selectedPaymentMethod ? (
            <Pressable style={styles.paymentMethod} onPress={handleSelectPaymentMethod}>
              <IconSymbol name="creditcard.fill" color="#007AFF" size={24} />
              <Text style={[styles.paymentText, { color: theme.colors.text }]}>
                {selectedPaymentMethod.cardBrand?.toUpperCase()} ending in {selectedPaymentMethod.last4}
              </Text>
              <IconSymbol name="chevron.right" color={theme.dark ? '#98989D' : '#666'} size={20} />
            </Pressable>
          ) : (
            <Pressable style={styles.addPaymentButton} onPress={handleSelectPaymentMethod}>
              <IconSymbol name="plus.circle.fill" color="#007AFF" size={24} />
              <Text style={[styles.addPaymentText, { color: '#007AFF' }]}>
                Add Payment Method
              </Text>
            </Pressable>
          )}
        </GlassView>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <Pressable
          style={[styles.placeOrderButton, { backgroundColor: '#007AFF' }]}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderButtonText}>Place Order - £{total.toFixed(2)}</Text>
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
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  promoContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  promoInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  applyButton: {
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentText: {
    flex: 1,
    fontSize: 16,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  addPaymentText: {
    fontSize: 16,
    fontWeight: '600',
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
  placeOrderButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
