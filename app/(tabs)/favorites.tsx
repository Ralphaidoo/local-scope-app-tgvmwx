
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockBusinesses } from '@/data/mockData';
import { Business } from '@/types';

export default function FavoritesScreen() {
  const theme = useTheme();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favs = await AsyncStorage.getItem('favorites');
      if (favs) {
        setFavoriteIds(JSON.parse(favs));
      }
    } catch (error) {
      console.log('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (businessId: string) => {
    try {
      const newFavorites = favoriteIds.includes(businessId)
        ? favoriteIds.filter(id => id !== businessId)
        : [...favoriteIds, businessId];
      
      setFavoriteIds(newFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.log('Error toggling favorite:', error);
    }
  };

  const favoriteBusinesses = mockBusinesses.filter(b => favoriteIds.includes(b.id));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Favorites</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {favoriteBusinesses.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="heart" color={theme.dark ? '#98989D' : '#666'} size={64} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Favorites Yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
              Start exploring and save your favorite businesses here
            </Text>
            <Pressable
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/discover')}
            >
              <Text style={styles.exploreButtonText}>Explore Businesses</Text>
            </Pressable>
          </View>
        ) : (
          favoriteBusinesses.map(business => (
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
                  <Pressable
                    onPress={() => toggleFavorite(business.id)}
                    style={styles.favoriteButton}
                  >
                    <IconSymbol 
                      name="heart.fill" 
                      color="#FF3B30" 
                      size={24} 
                    />
                  </Pressable>
                </View>
              </GlassView>
            </Pressable>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingVertical: 8,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
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
  exploreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
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
  favoriteButton: {
    padding: 8,
  },
});
