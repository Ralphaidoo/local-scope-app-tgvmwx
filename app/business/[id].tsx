
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useCart } from '@/contexts/CartContext';
import { mockBusinesses, mockProducts, mockServices, mockReviews } from '@/data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const { addItem } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'about' | 'products' | 'services' | 'reviews'>('about');

  const business = mockBusinesses.find(b => b.id === id);
  const products = mockProducts.filter(p => p.businessId === id);
  const services = mockServices.filter(s => s.businessId === id);
  const reviews = mockReviews.filter(r => r.businessId === id);

  useEffect(() => {
    checkFavorite();
  }, [id]);

  const checkFavorite = async () => {
    try {
      const favs = await AsyncStorage.getItem('favorites');
      if (favs) {
        const favorites = JSON.parse(favs);
        setIsFavorite(favorites.includes(id));
      }
    } catch (error) {
      console.log('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const favs = await AsyncStorage.getItem('favorites');
      const favorites = favs ? JSON.parse(favs) : [];
      
      const newFavorites = isFavorite
        ? favorites.filter((fid: string) => fid !== id)
        : [...favorites, id];
      
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.log('Error toggling favorite:', error);
    }
  };

  if (!business) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Business not found</Text>
      </View>
    );
  }

  const tabs = [
    { key: 'about', label: 'About', icon: 'info.circle' },
    { key: 'products', label: 'Products', icon: 'bag', count: products.length },
    { key: 'services', label: 'Services', icon: 'calendar', count: services.length },
    { key: 'reviews', label: 'Reviews', icon: 'star', count: reviews.length },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        {business.images[0] && (
          <Image
            source={{ uri: business.images[0] }}
            style={styles.headerImage}
            resizeMode="cover"
          />
        )}

        {/* Business Info */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.businessName, { color: theme.colors.text }]}>
                  {business.name}
                </Text>
                {business.verified && (
                  <IconSymbol name="checkmark.seal.fill" color="#007AFF" size={24} />
                )}
              </View>
              <Text style={[styles.category, { color: theme.dark ? '#98989D' : '#666' }]}>
                {business.category}
              </Text>
            </View>
            <Pressable onPress={toggleFavorite} style={styles.favoriteButton}>
              <IconSymbol 
                name={isFavorite ? 'heart.fill' : 'heart'} 
                color={isFavorite ? '#FF3B30' : theme.colors.text} 
                size={28} 
              />
            </Pressable>
          </View>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingRow}>
              <IconSymbol name="star.fill" color="#FFD700" size={20} />
              <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                {business.rating}
              </Text>
              <Text style={[styles.reviewCount, { color: theme.dark ? '#98989D' : '#666' }]}>
                ({business.reviewCount} reviews)
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <Pressable style={[styles.actionButton, { backgroundColor: '#007AFF' }]}>
              <IconSymbol name="phone.fill" color="#fff" size={20} />
              <Text style={styles.actionButtonText}>Call</Text>
            </Pressable>
            <Pressable 
              style={[styles.actionButton, { backgroundColor: '#34C759' }]}
              onPress={() => router.push('/messages')}
            >
              <IconSymbol name="message.fill" color="#fff" size={20} />
              <Text style={styles.actionButtonText}>Message</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, { backgroundColor: '#FF9500' }]}>
              <IconSymbol name="location.fill" color="#fff" size={20} />
              <Text style={styles.actionButtonText}>Directions</Text>
            </Pressable>
          </View>

          {/* Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            {tabs.map(tab => (
              <Pressable
                key={tab.key}
                style={[
                  styles.tab,
                  selectedTab === tab.key && styles.tabActive,
                  { borderBottomColor: selectedTab === tab.key ? '#007AFF' : 'transparent' }
                ]}
                onPress={() => setSelectedTab(tab.key as any)}
              >
                <IconSymbol 
                  name={tab.icon} 
                  color={selectedTab === tab.key ? '#007AFF' : theme.dark ? '#98989D' : '#666'} 
                  size={18} 
                />
                <Text style={[
                  styles.tabText,
                  { color: selectedTab === tab.key ? '#007AFF' : theme.dark ? '#98989D' : '#666' }
                ]}>
                  {tab.label}
                  {tab.count !== undefined && ` (${tab.count})`}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Tab Content */}
          {selectedTab === 'about' && (
            <View style={styles.tabContent}>
              <GlassView
                style={[
                  styles.infoCard,
                  Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}
                glassEffectStyle="regular"
              >
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>
                <Text style={[styles.description, { color: theme.dark ? '#98989D' : '#666' }]}>
                  {business.description}
                </Text>
              </GlassView>

              <GlassView
                style={[
                  styles.infoCard,
                  Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}
                glassEffectStyle="regular"
              >
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contact</Text>
                <View style={styles.infoRow}>
                  <IconSymbol name="phone" color={theme.dark ? '#98989D' : '#666'} size={18} />
                  <Text style={[styles.infoText, { color: theme.colors.text }]}>{business.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <IconSymbol name="envelope" color={theme.dark ? '#98989D' : '#666'} size={18} />
                  <Text style={[styles.infoText, { color: theme.colors.text }]}>{business.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <IconSymbol name="location" color={theme.dark ? '#98989D' : '#666'} size={18} />
                  <Text style={[styles.infoText, { color: theme.colors.text }]}>{business.address}</Text>
                </View>
              </GlassView>

              <GlassView
                style={[
                  styles.infoCard,
                  Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}
                glassEffectStyle="regular"
              >
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Hours</Text>
                {Object.entries(business.workingHours).map(([day, hours]) => (
                  <View key={day} style={styles.hoursRow}>
                    <Text style={[styles.dayText, { color: theme.colors.text }]}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </Text>
                    <Text style={[styles.hoursText, { color: theme.dark ? '#98989D' : '#666' }]}>
                      {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                    </Text>
                  </View>
                ))}
              </GlassView>
            </View>
          )}

          {selectedTab === 'products' && (
            <View style={styles.tabContent}>
              {products.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
                  No products available
                </Text>
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
                    <View style={styles.productInfo}>
                      <Text style={[styles.productName, { color: theme.colors.text }]}>
                        {product.name}
                      </Text>
                      <Text style={[styles.productDescription, { color: theme.dark ? '#98989D' : '#666' }]}>
                        {product.description}
                      </Text>
                      <Text style={[styles.productPrice, { color: '#34C759' }]}>
                        £{product.price.toFixed(2)}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.addButton}
                      onPress={() => {
                        addItem({
                          businessId: business.id,
                          businessName: business.name,
                          productId: product.id,
                          productName: product.name,
                          price: product.price,
                          quantity: 1,
                          image: product.images[0],
                        });
                      }}
                    >
                      <IconSymbol name="plus.circle.fill" color="#007AFF" size={32} />
                    </Pressable>
                  </GlassView>
                ))
              )}
            </View>
          )}

          {selectedTab === 'services' && (
            <View style={styles.tabContent}>
              {services.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
                  No services available
                </Text>
              ) : (
                services.map(service => (
                  <GlassView
                    key={service.id}
                    style={[
                      styles.serviceCard,
                      Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                    ]}
                    glassEffectStyle="regular"
                  >
                    <View style={styles.serviceInfo}>
                      <Text style={[styles.serviceName, { color: theme.colors.text }]}>
                        {service.name}
                      </Text>
                      <Text style={[styles.serviceDescription, { color: theme.dark ? '#98989D' : '#666' }]}>
                        {service.description}
                      </Text>
                      <View style={styles.serviceDetails}>
                        <Text style={[styles.servicePrice, { color: '#34C759' }]}>
                          £{service.price.toFixed(2)}
                        </Text>
                        <Text style={[styles.serviceDuration, { color: theme.dark ? '#98989D' : '#666' }]}>
                          {service.duration} min
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      style={styles.bookButton}
                      onPress={() => router.push({
                        pathname: '/booking',
                        params: { businessId: business.id, serviceId: service.id }
                      })}
                    >
                      <Text style={styles.bookButtonText}>Book</Text>
                    </Pressable>
                  </GlassView>
                ))
              )}
            </View>
          )}

          {selectedTab === 'reviews' && (
            <View style={styles.tabContent}>
              {reviews.length === 0 ? (
                <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
                  No reviews yet
                </Text>
              ) : (
                reviews.map(review => (
                  <GlassView
                    key={review.id}
                    style={[
                      styles.reviewCard,
                      Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                    ]}
                    glassEffectStyle="regular"
                  >
                    <View style={styles.reviewHeader}>
                      <View>
                        <View style={styles.reviewNameRow}>
                          <Text style={[styles.reviewerName, { color: theme.colors.text }]}>
                            {review.userName}
                          </Text>
                          {review.verified && (
                            <IconSymbol name="checkmark.seal.fill" color="#007AFF" size={14} />
                          )}
                        </View>
                        <View style={styles.reviewRating}>
                          {[...Array(5)].map((_, i) => (
                            <IconSymbol
                              key={i}
                              name={i < review.rating ? 'star.fill' : 'star'}
                              color="#FFD700"
                              size={14}
                            />
                          ))}
                        </View>
                      </View>
                      <Text style={[styles.reviewDate, { color: theme.dark ? '#98989D' : '#666' }]}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={[styles.reviewComment, { color: theme.colors.text }]}>
                      {review.comment}
                    </Text>
                  </GlassView>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 16,
  },
  favoriteButton: {
    padding: 8,
  },
  ratingContainer: {
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabsContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContent: {
    gap: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    flex: 1,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 15,
  },
  productCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 8,
  },
  serviceCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '600',
  },
  serviceDuration: {
    fontSize: 14,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 32,
  },
});
