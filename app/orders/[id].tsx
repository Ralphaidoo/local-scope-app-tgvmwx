
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { OrderStatus } from '@/types';

export default function OrderDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams();

  // Mock order data
  const order = {
    id: id as string,
    businessName: 'The Corner Café',
    businessAddress: '45 High Street, Camden, London NW1 7JH',
    items: [
      {
        id: '1',
        name: 'Cappuccino',
        quantity: 2,
        price: 3.50,
        image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
      },
      {
        id: '2',
        name: 'Croissant',
        quantity: 1,
        price: 2.50,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400',
      },
    ],
    subtotal: 9.50,
    deliveryFee: 2.50,
    total: 12.00,
    status: 'preparing' as OrderStatus,
    orderNumber: '#12345',
    placedAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 1800000).toISOString(),
    deliveryAddress: '123 High Street, London NW1 8AB',
    paymentMethod: 'Visa ending in 4242',
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'confirmed': return '#007AFF';
      case 'preparing': return '#5856D6';
      case 'ready': return '#34C759';
      case 'completed': return '#34C759';
      case 'cancelled': return '#FF3B30';
      default: return '#98989D';
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { label: 'Order Placed', status: 'pending', completed: true },
      { label: 'Confirmed', status: 'confirmed', completed: ['confirmed', 'preparing', 'ready', 'completed'].includes(order.status) },
      { label: 'Preparing', status: 'preparing', completed: ['preparing', 'ready', 'completed'].includes(order.status) },
      { label: 'Ready', status: 'ready', completed: ['ready', 'completed'].includes(order.status) },
      { label: 'Completed', status: 'completed', completed: order.status === 'completed' },
    ];
    return steps;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Status */}
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { backgroundColor: getStatusColor(order.status) }]}>
              <IconSymbol name="bag.fill" color="#fff" size={24} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
              <Text style={[styles.statusSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                Order {order.orderNumber}
              </Text>
            </View>
          </View>

          {/* Progress Steps */}
          <View style={styles.progressContainer}>
            {getStatusSteps().map((step, index) => (
              <View key={step.status} style={styles.progressStep}>
                <View style={styles.progressLine}>
                  {index > 0 && (
                    <View style={[
                      styles.progressLineSegment,
                      { backgroundColor: step.completed ? '#34C759' : theme.dark ? '#333' : '#E5E5EA' }
                    ]} />
                  )}
                </View>
                <View style={[
                  styles.progressDot,
                  { backgroundColor: step.completed ? '#34C759' : theme.dark ? '#333' : '#E5E5EA' }
                ]}>
                  {step.completed && (
                    <IconSymbol name="checkmark" color="#fff" size={12} />
                  )}
                </View>
                <Text style={[
                  styles.progressLabel,
                  { color: step.completed ? theme.colors.text : theme.dark ? '#666' : '#98989D' }
                ]}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.estimatedTime, { color: theme.dark ? '#98989D' : '#666' }]}>
            Estimated delivery: {new Date(order.estimatedDelivery).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </GlassView>

        {/* Business Info */}
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Business</Text>
          <Text style={[styles.businessName, { color: theme.colors.text }]}>
            {order.businessName}
          </Text>
          <Text style={[styles.businessAddress, { color: theme.dark ? '#98989D' : '#666' }]}>
            {order.businessAddress}
          </Text>
        </GlassView>

        {/* Order Items */}
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Order Items</Text>
          {order.items.map(item => (
            <View key={item.id} style={styles.orderItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.colors.text }]}>
                  {item.name}
                </Text>
                <Text style={[styles.itemQuantity, { color: theme.dark ? '#98989D' : '#666' }]}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: theme.colors.text }]}>
                £{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
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
              Subtotal
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              £{order.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
              Delivery Fee
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              £{order.deliveryFee.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
              Total
            </Text>
            <Text style={[styles.totalValue, { color: theme.colors.text }]}>
              £{order.total.toFixed(2)}
            </Text>
          </View>
        </GlassView>

        {/* Delivery Info */}
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Delivery Address</Text>
          <Text style={[styles.address, { color: theme.dark ? '#98989D' : '#666' }]}>
            {order.deliveryAddress}
          </Text>
        </GlassView>

        {/* Payment Info */}
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Payment Method</Text>
          <Text style={[styles.paymentMethod, { color: theme.dark ? '#98989D' : '#666' }]}>
            {order.paymentMethod}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLine: {
    position: 'absolute',
    left: 10,
    top: -16,
    width: 2,
    height: 32,
  },
  progressLineSegment: {
    flex: 1,
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  estimatedTime: {
    fontSize: 14,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 14,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
  },
  itemPrice: {
    fontSize: 16,
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
  address: {
    fontSize: 14,
  },
  paymentMethod: {
    fontSize: 14,
  },
});
