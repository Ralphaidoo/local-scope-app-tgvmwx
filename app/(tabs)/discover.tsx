
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { router } from 'expo-router';
import { mockBusinesses, categories, boroughs } from '@/data/mockData';
import { BusinessCategory, LondonBorough, ViewMode } from '@/types';

export default function DiscoverScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);
  const [selectedBorough, setSelectedBorough] = useState<LondonBorough | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const filteredBusinesses = mockBusinesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || business.category === selectedCategory;
    const matchesBorough = !selectedBorough || business.borough === selectedBorough;
    const matchesVerified = !verifiedOnly || business.verified;
    const matchesRating = business.rating >= minRating;
    
    return matchesSearch && matchesCategory && matchesBorough && matchesVerified && matchesRating;
  });

  // Group businesses by borough for the map view
  const boroughBusinessCounts = boroughs.reduce((acc, borough) => {
    acc[borough] = mockBusinesses.filter(b => b.borough === borough).length;
    return acc;
  }, {} as Record<LondonBorough, number>);

  // Borough regions with positions for visual map
  const boroughRegions: Array<{ name: LondonBorough; count: number; zone: string }> = [
    // Central London
    { name: 'Westminster', count: boroughBusinessCounts['Westminster'], zone: 'Central' },
    { name: 'Camden', count: boroughBusinessCounts['Camden'], zone: 'Central' },
    { name: 'Islington', count: boroughBusinessCounts['Islington'], zone: 'Central' },
    { name: 'Kensington and Chelsea', count: boroughBusinessCounts['Kensington and Chelsea'], zone: 'Central' },
    
    // North London
    { name: 'Barnet', count: boroughBusinessCounts['Barnet'], zone: 'North' },
    { name: 'Enfield', count: boroughBusinessCounts['Enfield'], zone: 'North' },
    { name: 'Haringey', count: boroughBusinessCounts['Haringey'], zone: 'North' },
    
    // East London
    { name: 'Hackney', count: boroughBusinessCounts['Hackney'], zone: 'East' },
    { name: 'Tower Hamlets', count: boroughBusinessCounts['Tower Hamlets'], zone: 'East' },
    { name: 'Newham', count: boroughBusinessCounts['Newham'], zone: 'East' },
    { name: 'Redbridge', count: boroughBusinessCounts['Redbridge'], zone: 'East' },
    { name: 'Barking and Dagenham', count: boroughBusinessCounts['Barking and Dagenham'], zone: 'East' },
    { name: 'Waltham Forest', count: boroughBusinessCounts['Waltham Forest'], zone: 'East' },
    
    // South London
    { name: 'Southwark', count: boroughBusinessCounts['Southwark'], zone: 'South' },
    { name: 'Lambeth', count: boroughBusinessCounts['Lambeth'], zone: 'South' },
    { name: 'Lewisham', count: boroughBusinessCounts['Lewisham'], zone: 'South' },
    { name: 'Greenwich', count: boroughBusinessCounts['Greenwich'], zone: 'South' },
    { name: 'Bromley', count: boroughBusinessCounts['Bromley'], zone: 'South' },
    { name: 'Croydon', count: boroughBusinessCounts['Croydon'], zone: 'South' },
    { name: 'Sutton', count: boroughBusinessCounts['Sutton'], zone: 'South' },
    { name: 'Merton', count: boroughBusinessCounts['Merton'], zone: 'South' },
    
    // West London
    { name: 'Hammersmith and Fulham', count: boroughBusinessCounts['Hammersmith and Fulham'], zone: 'West' },
    { name: 'Ealing', count: boroughBusinessCounts['Ealing'], zone: 'West' },
    { name: 'Hounslow', count: boroughBusinessCounts['Hounslow'], zone: 'West' },
    { name: 'Richmond upon Thames', count: boroughBusinessCounts['Richmond upon Thames'], zone: 'West' },
    { name: 'Kingston upon Thames', count: boroughBusinessCounts['Kingston upon Thames'], zone: 'West' },
    { name: 'Wandsworth', count: boroughBusinessCounts['Wandsworth'], zone: 'West' },
    { name: 'Brent', count: boroughBusinessCounts['Brent'], zone: 'West' },
    { name: 'Harrow', count: boroughBusinessCounts['Harrow'], zone: 'West' },
    { name: 'Hillingdon', count: boroughBusinessCounts['Hillingdon'], zone: 'West' },
    
    // Southeast
    { name: 'Bexley', count: boroughBusinessCounts['Bexley'], zone: 'South' },
  ];

  const zones = ['Central', 'North', 'East', 'South', 'West'];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Discover</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.headerButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <IconSymbol 
              name={showFilters ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle'} 
              color={theme.colors.primary} 
              size={24} 
            />
          </Pressable>
          <Pressable
            style={styles.headerButton}
            onPress={() => {
              const modes: ViewMode[] = ['map', 'list', 'grid'];
              const currentIndex = modes.indexOf(viewMode);
              const nextIndex = (currentIndex + 1) % modes.length;
              setViewMode(modes[nextIndex]);
            }}
          >
            <IconSymbol 
              name={viewMode === 'list' ? 'list.bullet' : viewMode === 'grid' ? 'square.grid.2x2' : 'map'} 
              color={theme.colors.primary} 
              size={24} 
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
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
            placeholder="Search by name, category, or location..."
            placeholderTextColor={theme.dark ? '#98989D' : '#666'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </GlassView>

        {/* Filters */}
        {showFilters && (
          <GlassView
            style={[
              styles.filtersContainer,
              Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}
            glassEffectStyle="regular"
          >
            <Text style={[styles.filterTitle, { color: theme.colors.text }]}>Filters</Text>
            
            {/* Category Filter */}
            <Text style={[styles.filterLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <Pressable
                style={[
                  styles.filterChip,
                  !selectedCategory && styles.filterChipActive,
                  { borderColor: theme.dark ? '#333' : '#ddd' }
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: !selectedCategory ? '#fff' : theme.colors.text }
                ]}>
                  All
                </Text>
              </Pressable>
              {categories.map(category => (
                <Pressable
                  key={category}
                  style={[
                    styles.filterChip,
                    selectedCategory === category && styles.filterChipActive,
                    { borderColor: theme.dark ? '#333' : '#ddd' }
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: selectedCategory === category ? '#fff' : theme.colors.text }
                  ]}>
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Additional Filters */}
            <Pressable
              style={styles.filterOption}
              onPress={() => setVerifiedOnly(!verifiedOnly)}
            >
              <Text style={[styles.filterOptionText, { color: theme.colors.text }]}>
                Verified Only
              </Text>
              <IconSymbol 
                name={verifiedOnly ? 'checkmark.circle.fill' : 'circle'} 
                color={verifiedOnly ? '#007AFF' : theme.dark ? '#98989D' : '#666'} 
                size={24} 
              />
            </Pressable>

            <View style={styles.filterOption}>
              <Text style={[styles.filterOptionText, { color: theme.colors.text }]}>
                Minimum Rating: {minRating > 0 ? minRating.toFixed(1) : 'Any'}
              </Text>
              <View style={styles.ratingButtons}>
                {[0, 3, 4, 4.5].map(rating => (
                  <Pressable
                    key={rating}
                    style={[
                      styles.ratingButton,
                      minRating === rating && styles.ratingButtonActive,
                      { borderColor: theme.dark ? '#333' : '#ddd' }
                    ]}
                    onPress={() => setMinRating(rating)}
                  >
                    <Text style={[
                      styles.ratingButtonText,
                      { color: minRating === rating ? '#fff' : theme.colors.text }
                    ]}>
                      {rating === 0 ? 'Any' : `${rating}+`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </GlassView>
        )}

        {/* Results Header */}
        {selectedBorough && (
          <View style={styles.selectedBoroughHeader}>
            <GlassView
              style={[
                styles.selectedBoroughBadge,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}
              glassEffectStyle="regular"
            >
              <IconSymbol name="mappin.circle.fill" color="#007AFF" size={20} />
              <Text style={[styles.selectedBoroughText, { color: theme.colors.text }]}>
                {selectedBorough}
              </Text>
              <Pressable onPress={() => setSelectedBorough(null)}>
                <IconSymbol name="xmark.circle.fill" color={theme.dark ? '#98989D' : '#666'} size={20} />
              </Pressable>
            </GlassView>
          </View>
        )}

        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsText, { color: theme.dark ? '#98989D' : '#666' }]}>
            {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'} found
          </Text>
        </View>

        {/* Map View - Borough Selector */}
        {viewMode === 'map' && (
          <View style={styles.mapContainer}>
            <Text style={[styles.mapTitle, { color: theme.colors.text }]}>
              Select a Borough or Area
            </Text>
            <Text style={[styles.mapSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
              Tap on any zone to see businesses in that area
            </Text>
            
            {zones.map(zone => (
              <View key={zone} style={styles.zoneSection}>
                <Text style={[styles.zoneTitle, { color: theme.colors.text }]}>
                  {zone} London
                </Text>
                <View style={styles.boroughGrid}>
                  {boroughRegions
                    .filter(region => region.zone === zone)
                    .map(region => (
                      <Pressable
                        key={region.name}
                        onPress={() => {
                          setSelectedBorough(region.name);
                          setViewMode('list');
                        }}
                      >
                        <GlassView
                          style={[
                            styles.boroughCard,
                            selectedBorough === region.name && styles.boroughCardSelected,
                            Platform.OS !== 'ios' && { 
                              backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' 
                            }
                          ]}
                          glassEffectStyle="regular"
                        >
                          <View style={styles.boroughCardHeader}>
                            <IconSymbol 
                              name="building.2.fill" 
                              color={selectedBorough === region.name ? '#007AFF' : theme.dark ? '#98989D' : '#666'} 
                              size={24} 
                            />
                            <View style={[
                              styles.boroughBadge,
                              { backgroundColor: selectedBorough === region.name ? '#007AFF' : theme.dark ? '#333' : '#ddd' }
                            ]}>
                              <Text style={[
                                styles.boroughBadgeText,
                                { color: selectedBorough === region.name ? '#fff' : theme.colors.text }
                              ]}>
                                {region.count}
                              </Text>
                            </View>
                          </View>
                          <Text 
                            style={[
                              styles.boroughName, 
                              { color: selectedBorough === region.name ? '#007AFF' : theme.colors.text }
                            ]}
                            numberOfLines={2}
                          >
                            {region.name}
                          </Text>
                          <Text style={[styles.boroughCount, { color: theme.dark ? '#98989D' : '#666' }]}>
                            {region.count} {region.count === 1 ? 'business' : 'businesses'}
                          </Text>
                        </GlassView>
                      </Pressable>
                    ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* List View */}
        {viewMode === 'list' && filteredBusinesses.map(business => (
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

        {/* Grid View */}
        {viewMode === 'grid' && (
          <View style={styles.gridContainer}>
            {filteredBusinesses.map(business => (
              <Pressable
                key={business.id}
                style={styles.gridItem}
                onPress={() => router.push(`/business/${business.id}`)}
              >
                <GlassView
                  style={[
                    styles.gridCard,
                    Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                  ]}
                  glassEffectStyle="regular"
                >
                  <View style={styles.gridCardHeader}>
                    <Text style={[styles.gridBusinessName, { color: theme.colors.text }]} numberOfLines={2}>
                      {business.name}
                    </Text>
                    {business.verified && (
                      <IconSymbol name="checkmark.seal.fill" color="#007AFF" size={16} />
                    )}
                  </View>
                  <Text style={[styles.gridBusinessCategory, { color: theme.dark ? '#98989D' : '#666' }]} numberOfLines={1}>
                    {business.category}
                  </Text>
                  <View style={styles.gridRatingRow}>
                    <IconSymbol name="star.fill" color="#FFD700" size={12} />
                    <Text style={[styles.gridRatingText, { color: theme.colors.text }]}>
                      {business.rating}
                    </Text>
                  </View>
                </GlassView>
              </Pressable>
            ))}
          </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 8,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  filterOptionText: {
    fontSize: 16,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  ratingButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedBoroughHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  selectedBoroughBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  selectedBoroughText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 14,
  },
  mapContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  mapSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  zoneSection: {
    marginBottom: 24,
  },
  zoneTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  boroughGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  boroughCard: {
    width: 160,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  boroughCardSelected: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  boroughCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  boroughBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  boroughBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  boroughName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    minHeight: 40,
  },
  boroughCount: {
    fontSize: 12,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
  gridCard: {
    padding: 12,
    borderRadius: 12,
    minHeight: 120,
  },
  gridCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: 6,
  },
  gridBusinessName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  gridBusinessCategory: {
    fontSize: 12,
    marginBottom: 6,
  },
  gridRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridRatingText: {
    fontSize: 12,
  },
});
