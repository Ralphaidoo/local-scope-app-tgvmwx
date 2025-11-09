
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useCart } from '@/contexts/CartContext';

export default function CartScreen() {
  const theme = useTheme();
  const { items, itemCount, total, removeItem, updateQuantity, clearCart } = useCart();

  // Group items by business
  const itemsByBusiness = items.reduce((acc, item) => {
    if (!acc[item.businessId]) {
      acc[item.businessId] = {
        businessName: item.businessName,
        items: [],
      };
    }
    acc[item.businessId].items.push(item);
    return acc;
  }, {} as Record<string, { businessName: string; items: typeof items }>);

  const handleCheckout = () => {
    // In a real app, this would navigate to payment processing
    console.log('Processing checkout for', itemCount, 'items, total:', total);
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyState}>
          <IconSymbol name="cart" color={theme.dark ? '#98989D' : '#666'} size={64} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            Your Cart is Empty
          </Text>
          <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
            Add items from businesses to get started
          </Text>
          <Pressable
            style={styles.shopButton}
            onPress={() => router.back()}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {Object.entries(itemsByBusiness).map(([businessId, { businessName, items: businessItems }]) => (
          <View key={businessId} style={styles.businessSection}>
            <Text style={[styles.businessName, { color: theme.colors.text }]}>
              {businessName}
            </Text>
            {businessItems.map(item => (
              <GlassView
                key={item.id}
                style={[
                  styles.cartItem,
                  Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}
                glassEffectStyle="regular"
              >
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: theme.colors.text }]}>
                    {item.productName}
                  </Text>
                  <Text style={[styles.itemPrice, { color: '#34C759' }]}>
                    £{item.price.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  <View style={styles.quantityControl}>
                    <Pressable
                      style={[styles.quantityButton, { borderColor: theme.dark ? '#333' : '#ddd' }]}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <IconSymbol name="minus" color={theme.colors.text} size={16} />
                    </Pressable>
                    <Text style={[styles.quantityText, { color: theme.colors.text }]}>
                      {item.quantity}
                    </Text>
                    <Pressable
                      style={[styles.quantityButton, { borderColor: theme.dark ? '#333' : '#ddd' }]}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <IconSymbol name="plus" color={theme.colors.text} size={16} />
                    </Pressable>
                  </View>
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => removeItem(item.id)}
                  >
                    <IconSymbol name="trash" color="#FF3B30" size={20} />
                  </Pressable>
                </View>
              </GlassView>
            ))}
          </View>
        ))}

        <GlassView
          style={[
            styles.summaryCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
              Subtotal ({itemCount} items)
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              £{total.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
              Delivery
            </Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
              £3.50
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>
              Total
            </Text>
            <Text style={[styles.totalValue, { color: '#34C759' }]}>
              £{(total + 3.50).toFixed(2)}
            </Text>
          </View>
        </GlassView>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.dark ? '#333' : '#ddd' }]}>
        <Pressable
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          <IconSymbol name="arrow.right" color="#fff" size={20} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  businessSection: {
    marginBottom: 24,
  },
  businessName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  cartItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemInfo: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 12,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
