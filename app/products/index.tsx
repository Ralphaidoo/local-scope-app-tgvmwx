
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { router } from 'expo-router';
import { Product } from '@/types';

export default function ProductManagementScreen() {
  const theme = useTheme();

  // Mock products data
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      businessId: 'biz1',
      name: 'Cappuccino',
      description: 'Rich espresso with steamed milk',
      price: 3.50,
      images: ['https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400'],
      category: 'Beverages',
      inStock: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      businessId: 'biz1',
      name: 'Croissant',
      description: 'Freshly baked butter croissant',
      price: 2.50,
      images: ['https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400'],
      category: 'Pastries',
      inStock: true,
      createdAt: new Date().toISOString(),
    },
  ]);

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProducts(products.filter(p => p.id !== productId));
            console.log('Product deleted:', productId);
          },
        },
      ]
    );
  };

  const toggleStock = (productId: string) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, inStock: !p.inStock } : p
    ));
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Products & Services</Text>
        <Pressable
          style={[styles.addButton, { backgroundColor: '#007AFF' }]}
          onPress={() => router.push('/products/add')}
        >
          <IconSymbol name="plus" color="#fff" size={20} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="bag" color={theme.dark ? '#98989D' : '#666'} size={64} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Products Yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
              Add your first product or service
            </Text>
            <Pressable
              style={[styles.emptyButton, { backgroundColor: '#007AFF' }]}
              onPress={() => router.push('/products/add')}
            >
              <Text style={styles.emptyButtonText}>Add Product</Text>
            </Pressable>
          </View>
        ) : (
          products.map(product => (
            <GlassView
              key={product.id}
              style={[
                styles.productCard,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}
              glassEffectStyle="regular"
            >
              <Image source={{ uri: product.images[0] }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <View style={styles.productTitleContainer}>
                    <Text style={[styles.productName, { color: theme.colors.text }]}>
                      {product.name}
                    </Text>
                    <View style={[
                      styles.stockBadge,
                      { backgroundColor: product.inStock ? '#34C759' : '#FF3B30' }
                    ]}>
                      <Text style={styles.stockText}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.productPrice, { color: theme.colors.text }]}>
                    £{product.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={[styles.productDescription, { color: theme.dark ? '#98989D' : '#666' }]} numberOfLines={2}>
                  {product.description}
                </Text>
                <View style={styles.productActions}>
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: product.inStock ? '#FF9500' : '#34C759' }]}
                    onPress={() => toggleStock(product.id)}
                  >
                    <IconSymbol
                      name={product.inStock ? 'eye.slash' : 'eye'}
                      color="#fff"
                      size={16}
                    />
                    <Text style={styles.actionButtonText}>
                      {product.inStock ? 'Mark Unavailable' : 'Mark Available'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
                    onPress={() => router.push(`/products/edit/${product.id}`)}
                  >
                    <IconSymbol name="pencil" color="#fff" size={16} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.iconButton, { backgroundColor: '#FF3B30' }]}
                    onPress={() => handleDeleteProduct(product.id)}
                  >
                    <IconSymbol name="trash" color="#fff" size={16} />
                  </Pressable>
                </View>
              </View>
            </GlassView>
          ))
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
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
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  productCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  stockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
