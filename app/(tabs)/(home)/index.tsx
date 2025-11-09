
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { mockBusinesses, categories } from '@/data/mockData';
import { BusinessCategory } from '@/types';

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);

  const filteredBusinesses = mockBusinesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || business.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredBusinesses = mockBusinesses.filter(b => b.featured);

  const renderHeaderRight = () => (
    <View style={styles.headerRight}>
      <Pressable
        onPress={() => router.push('/cart')}
        style={styles.headerButton}
      >
        <IconSymbol name="cart.fill" color={theme.colors.primary} size={24} />
        {itemCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{itemCount}</Text>
          </View>
        )}
      </Pressable>
      <Pressable
        onPress={() => router.push('/messages')}
        style={styles.headerButton}
      >
        <IconSymbol name="message.fill" color={theme.colors.primary} size={24} />
      </Pressable>
    </View>
  );

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: 'Local Scope',
            headerRight: renderHeaderRight,
          }}
        />
      )}
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            Platform.OS !== 'ios' && styles.scrollContentWithTabBar
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
              Welcome{user ? `, ${user.fullName.split(' ')[0]}` : ''}!
            </Text>
            <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
              Discover local businesses in London
            </Text>
          </View>

          {/* Search Bar */}
          <GlassView
            style={[
              styles.searchContainer,
              Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}
            glassEffectStyle="regular"
          >
            <IconSymbol name="magnifyingglass" color={theme.dark ? '#98989D' : '#666'} size={20} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search businesses..."
              placeholderTextColor={theme.dark ? '#98989D' : '#666'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </GlassView>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              <Pressable
                style={[
                  styles.categoryChip,
                  !selectedCategory && styles.categoryChipActive,
                  { borderColor: theme.dark ? '#333' : '#ddd' }
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[
                  styles.categoryText,
                  { color: !selectedCategory ? '#fff' : theme.colors.text }
                ]}>
                  All
                </Text>
              </Pressable>
              {categories.map(category => (
                <Pressable
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.categoryChipActive,
                    { borderColor: theme.dark ? '#333' : '#ddd' }
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    { color: selectedCategory === category ? '#fff' : theme.colors.text }
                  ]}>
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Featured Businesses */}
          {!searchQuery && !selectedCategory && featuredBusinesses.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Featured</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
                {featuredBusinesses.map(business => (
                  <Pressable
                    key={business.id}
                    onPress={() => router.push(`/business/${business.id}`)}
                  >
                    <GlassView
                      style={[
                        styles.featuredCard,
                        Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                      ]}
                      glassEffectStyle="regular"
                    >
                      <View style={styles.featuredBadge}>
                        <IconSymbol name="star.fill" color="#FFD700" size={16} />
                        <Text style={styles.featuredBadgeText}>Featured</Text>
                      </View>
                      <Text style={[styles.businessName, { color: theme.colors.text }]} numberOfLines={1}>
                        {business.name}
                      </Text>
                      <Text style={[styles.businessCategory, { color: theme.dark ? '#98989D' : '#666' }]}>
                        {business.category}
                      </Text>
                      <View style={styles.ratingRow}>
                        <IconSymbol name="star.fill" color="#FFD700" size={14} />
                        <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                          {business.rating} ({business.reviewCount})
                        </Text>
                      </View>
                    </GlassView>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* All Businesses */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {searchQuery || selectedCategory ? 'Results' : 'All Businesses'}
            </Text>
            {filteredBusinesses.map(business => (
              <Pressable
                key={business.id}
                onPress={() => router.push(`/business/${business.id}`)}
              >
                <GlassView
                  style={[
                    styles.businessCard,
                    Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                  ]}
                  glassEffectStyle="regular"
                >
                  <View style={styles.businessHeader}>
                    <View style={styles.businessInfo}>
                      <View style={styles.businessNameRow}>
                        <Text style={[styles.businessName, { color: theme.colors.text }]}>
                          {business.name}
                        </Text>
                        {business.verified && (
                          <IconSymbol name="checkmark.seal.fill" color="#007AFF" size={18} />
                        )}
                      </View>
                      <Text style={[styles.businessCategory, { color: theme.dark ? '#98989D' : '#666' }]}>
                        {business.category} • {business.borough}
                      </Text>
                      <View style={styles.ratingRow}>
                        <IconSymbol name="star.fill" color="#FFD700" size={14} />
                        <Text style={[styles.ratingText, { color: theme.colors.text }]}>
                          {business.rating} ({business.reviewCount} reviews)
                        </Text>
                      </View>
                    </View>
                    <IconSymbol name="chevron.right" color={theme.dark ? '#98989D' : '#666'} size={20} />
                  </View>
                </GlassView>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  welcomeSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoriesScroll: {
    paddingLeft: 16,
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
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  featuredScroll: {
    paddingLeft: 16,
  },
  featuredCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  businessCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  businessInfo: {
    flex: 1,
  },
  businessNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
  },
  businessCategory: {
    fontSize: 14,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
  },
});
