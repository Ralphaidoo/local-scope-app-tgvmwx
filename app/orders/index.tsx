
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { router } from 'expo-router';
import { Order, OrderStatus } from '@/types';

export default function OrdersScreen() {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');

  // Mock orders data
  const mockOrders: Order[] = [
    {
      id: '1',
      userId: 'user1',
      businessId: 'biz1',
      items: [
        {
          id: 'item1',
          businessId: 'biz1',
          businessName: 'The Corner Café',
          productId: 'prod1',
          productName: 'Cappuccino',
          price: 3.50,
          quantity: 2,
          image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
        },
      ],
      total: 7.00,
      status: 'preparing',
      paymentMethod: 'card',
      deliveryAddress: '123 High Street, London',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: 'user1',
      businessId: 'biz2',
      items: [
        {
          id: 'item2',
          businessId: 'biz2',
          businessName: 'Green Grocers',
          productId: 'prod2',
          productName: 'Organic Apples',
          price: 4.99,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
        },
      ],
      total: 4.99,
      status: 'completed',
      paymentMethod: 'card',
      deliveryAddress: '123 High Street, London',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const activeOrders = mockOrders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
  );
  const completedOrders = mockOrders.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  );

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

  const getStatusLabel = (status: OrderStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const renderOrder = (order: Order) => (
    <Pressable
      key={order.id}
      onPress={() => router.push(`/orders/${order.id}`)}
    >
      <GlassView
        style={[
          styles.orderCard,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}
        glassEffectStyle="regular"
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={[styles.orderBusiness, { color: theme.colors.text }]}>
              {order.items[0].businessName}
            </Text>
            <Text style={[styles.orderDate, { color: theme.dark ? '#98989D' : '#666' }]}>
              {new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
          </View>
        </View>

        <View style={styles.orderItems}>
          {order.items.map(item => (
            <Text key={item.id} style={[styles.orderItem, { color: theme.dark ? '#98989D' : '#666' }]}>
              {item.quantity}x {item.productName}
            </Text>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <Text style={[styles.orderTotal, { color: theme.colors.text }]}>
            Total: £{order.total.toFixed(2)}
          </Text>
          <IconSymbol name="chevron.right" color={theme.dark ? '#98989D' : '#666'} size={20} />
        </View>
      </GlassView>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Orders</Text>
      </View>

      <View style={styles.tabContainer}>
        <Pressable
          style={[
            styles.tab,
            selectedTab === 'active' && styles.activeTab,
          ]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'active' ? '#007AFF' : theme.dark ? '#98989D' : '#666' }
          ]}>
            Active ({activeOrders.length})
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            selectedTab === 'completed' && styles.activeTab,
          ]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[
            styles.tabText,
            { color: selectedTab === 'completed' ? '#007AFF' : theme.dark ? '#98989D' : '#666' }
          ]}>
            Completed ({completedOrders.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'active' ? (
          activeOrders.length > 0 ? (
            activeOrders.map(renderOrder)
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="bag" color={theme.dark ? '#98989D' : '#666'} size={64} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No Active Orders
              </Text>
              <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
                Your active orders will appear here
              </Text>
            </View>
          )
        ) : (
          completedOrders.length > 0 ? (
            completedOrders.map(renderOrder)
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="checkmark.circle" color={theme.dark ? '#98989D' : '#666'} size={64} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No Completed Orders
              </Text>
              <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
                Your order history will appear here
              </Text>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  orderCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderBusiness: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
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
});
