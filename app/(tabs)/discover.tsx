
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { router } from 'expo-router';
import { mockBusinesses, categories } from '@/data/mockData';
import { BusinessCategory, LondonBorough, ViewMode } from '@/types';
import { allBoroughs, neighborhoodsByBorough } from '@/data/neighborhoodData';

export default function DiscoverScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | null>(null);
  const [selectedBoroughs, setSelectedBoroughs] = useState<LondonBorough[]>([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [showBoroughModal, setShowBoroughModal] = useState(false);
  const [showNeighborhoodModal, setShowNeighborhoodModal] = useState(false);

  const filteredBusinesses = mockBusinesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || business.category === selectedCategory;
    const matchesBorough = selectedBoroughs.length === 0 || selectedBoroughs.includes(business.borough);
    const matchesNeighborhood = selectedNeighborhoods.length === 0 || selectedNeighborhoods.includes(business.neighborhood);
    const matchesVerified = !verifiedOnly || business.verified;
    const matchesRating = business.rating >= minRating;
    
    return matchesSearch && matchesCategory && matchesBorough && matchesNeighborhood && matchesVerified && matchesRating;
  });

  // Get available neighborhoods based on selected boroughs
  const availableNeighborhoods = selectedBoroughs.length > 0
    ? selectedBoroughs.flatMap(borough => neighborhoodsByBorough[borough] || [])
    : Object.values(neighborhoodsByBorough).flat();

  const toggleBorough = (borough: LondonBorough) => {
    setSelectedBoroughs(prev => {
      if (prev.includes(borough)) {
        // Remove borough and its neighborhoods
        const boroughNeighborhoods = neighborhoodsByBorough[borough] || [];
        setSelectedNeighborhoods(prevNeighborhoods => 
          prevNeighborhoods.filter(n => !boroughNeighborhoods.includes(n))
        );
        return prev.filter(b => b !== borough);
      } else {
        return [...prev, borough];
      }
    });
  };

  const toggleNeighborhood = (neighborhood: string) => {
    setSelectedNeighborhoods(prev => {
      if (prev.includes(neighborhood)) {
        return prev.filter(n => n !== neighborhood);
      } else {
        return [...prev, neighborhood];
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedBoroughs([]);
    setSelectedNeighborhoods([]);
    setSelectedCategory(null);
    setVerifiedOnly(false);
    setMinRating(0);
  };

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

        {/* Location Filters */}
        <View style={styles.locationFilters}>
          <Pressable
            style={[styles.locationButton, { backgroundColor: '#007AFF' }]}
            onPress={() => setShowBoroughModal(true)}
          >
            <IconSymbol name="building.2" color="#FFFFFF" size={20} />
            <Text style={styles.locationButtonText}>
              {selectedBoroughs.length === 0 
                ? 'Select Boroughs' 
                : `${selectedBoroughs.length} Borough${selectedBoroughs.length > 1 ? 's' : ''}`}
            </Text>
            <IconSymbol name="chevron.down" color="#FFFFFF" size={16} />
          </Pressable>

          <Pressable
            style={[
              styles.locationButton, 
              { backgroundColor: '#007AFF' },
              selectedBoroughs.length === 0 && { opacity: 0.5 }
            ]}
            onPress={() => selectedBoroughs.length > 0 && setShowNeighborhoodModal(true)}
            disabled={selectedBoroughs.length === 0}
          >
            <IconSymbol name="mappin.circle" color="#FFFFFF" size={20} />
            <Text style={styles.locationButtonText}>
              {selectedNeighborhoods.length === 0 
                ? 'Select Areas' 
                : `${selectedNeighborhoods.length} Area${selectedNeighborhoods.length > 1 ? 's' : ''}`}
            </Text>
            <IconSymbol name="chevron.down" color="#FFFFFF" size={16} />
          </Pressable>
        </View>

        {/* Active Filters Display */}
        {(selectedBoroughs.length > 0 || selectedNeighborhoods.length > 0) && (
          <View style={styles.activeFiltersContainer}>
            <View style={styles.activeFiltersHeader}>
              <Text style={[styles.activeFiltersTitle, { color: theme.colors.text }]}>
                Active Filters
              </Text>
              <Pressable onPress={clearAllFilters}>
                <Text style={[styles.clearAllText, { color: '#007AFF' }]}>Clear All</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersScroll}>
              {selectedBoroughs.map(borough => (
                <View key={borough} style={[styles.activeFilterChip, { backgroundColor: '#007AFF' }]}>
                  <Text style={styles.activeFilterChipText}>{borough}</Text>
                  <Pressable onPress={() => toggleBorough(borough)}>
                    <IconSymbol name="xmark.circle.fill" color="#FFFFFF" size={16} />
                  </Pressable>
                </View>
              ))}
              {selectedNeighborhoods.map(neighborhood => (
                <View key={neighborhood} style={[styles.activeFilterChip, { backgroundColor: '#34C759' }]}>
                  <Text style={styles.activeFilterChipText}>{neighborhood}</Text>
                  <Pressable onPress={() => toggleNeighborhood(neighborhood)}>
                    <IconSymbol name="xmark.circle.fill" color="#FFFFFF" size={16} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filters */}
        {showFilters && (
          <GlassView
            style={[
              styles.filtersContainer,
              Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}
            glassEffectStyle="regular"
          >
            <Text style={[styles.filterTitle, { color: theme.colors.text }]}>Additional Filters</Text>
            
            {/* Category Filter */}
            <Text style={[styles.filterLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <Pressable
                style={[
                  styles.filterChip,
                  !selectedCategory && { backgroundColor: '#007AFF', borderColor: '#007AFF' },
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
                    selectedCategory === category && { backgroundColor: '#007AFF', borderColor: '#007AFF' },
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
                      minRating === rating && { backgroundColor: '#007AFF', borderColor: '#007AFF' },
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
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsText, { color: theme.dark ? '#98989D' : '#666' }]}>
            {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'} found
          </Text>
        </View>

        {/* Map View - Visual Borough Map */}
        {viewMode === 'map' && (
          <View style={styles.mapContainer}>
            <View style={[styles.mapNotice, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <IconSymbol name="info.circle" color="#007AFF" size={20} />
              <Text style={[styles.mapNoticeText, { color: theme.colors.text }]}>
                Interactive maps (react-native-maps) are not supported on web in Natively. 
                Use the borough and area selectors above to filter businesses by location.
              </Text>
            </View>
            
            <Text style={[styles.mapTitle, { color: theme.colors.text }]}>
              London Boroughs Map
            </Text>
            <Text style={[styles.mapSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
              Use the buttons above to select boroughs and areas
            </Text>
            
            {/* Visual representation of London zones */}
            <View style={styles.londonMapVisual}>
              {['Central', 'North', 'East', 'South', 'West'].map(zone => {
                const zoneBoroughs = allBoroughs.filter(borough => {
                  if (zone === 'Central') return ['Westminster', 'Camden', 'Islington', 'Kensington and Chelsea', 'City of London'].includes(borough);
                  if (zone === 'North') return ['Barnet', 'Enfield', 'Haringey'].includes(borough);
                  if (zone === 'East') return ['Hackney', 'Tower Hamlets', 'Newham', 'Redbridge', 'Barking and Dagenham', 'Waltham Forest', 'Havering'].includes(borough);
                  if (zone === 'South') return ['Southwark', 'Lambeth', 'Lewisham', 'Greenwich', 'Bromley', 'Croydon', 'Sutton', 'Merton', 'Bexley'].includes(borough);
                  if (zone === 'West') return ['Hammersmith and Fulham', 'Ealing', 'Hounslow', 'Richmond upon Thames', 'Kingston upon Thames', 'Wandsworth', 'Brent', 'Harrow', 'Hillingdon'].includes(borough);
                  return false;
                });
                
                const selectedCount = zoneBoroughs.filter(b => selectedBoroughs.includes(b)).length;
                
                return (
                  <View key={zone} style={styles.zoneCard}>
                    <View style={styles.zoneHeader}>
                      <Text style={[styles.zoneTitle, { color: theme.colors.text }]}>
                        {zone} London
                      </Text>
                      {selectedCount > 0 && (
                        <View style={[styles.zoneBadge, { backgroundColor: '#007AFF' }]}>
                          <Text style={styles.zoneBadgeText}>{selectedCount}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.zoneSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                      {zoneBoroughs.length} boroughs
                    </Text>
                  </View>
                );
              })}
            </View>
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

      {/* Borough Selection Modal */}
      <Modal
        visible={showBoroughModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBoroughModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Select Boroughs
              </Text>
              <Pressable onPress={() => setShowBoroughModal(false)}>
                <IconSymbol name="xmark.circle.fill" color={theme.dark ? '#98989D' : '#666'} size={28} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {allBoroughs.map(borough => (
                <Pressable
                  key={borough}
                  style={styles.checkboxRow}
                  onPress={() => toggleBorough(borough)}
                >
                  <View style={styles.checkboxContainer}>
                    <View style={[
                      styles.checkbox,
                      { borderColor: theme.dark ? '#666' : '#ccc' },
                      selectedBoroughs.includes(borough) && { backgroundColor: '#007AFF', borderColor: '#007AFF' }
                    ]}>
                      {selectedBoroughs.includes(borough) && (
                        <IconSymbol name="checkmark" color="#FFFFFF" size={16} />
                      )}
                    </View>
                    <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>
                      {borough}
                    </Text>
                  </View>
                  <Text style={[styles.neighborhoodCount, { color: theme.dark ? '#98989D' : '#666' }]}>
                    {(neighborhoodsByBorough[borough] || []).length} areas
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#007AFF' }]}
                onPress={() => setShowBoroughModal(false)}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Neighborhood Selection Modal */}
      <Modal
        visible={showNeighborhoodModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNeighborhoodModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Select Areas
              </Text>
              <Pressable onPress={() => setShowNeighborhoodModal(false)}>
                <IconSymbol name="xmark.circle.fill" color={theme.dark ? '#98989D' : '#666'} size={28} />
              </Pressable>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {selectedBoroughs.map(borough => (
                <View key={borough} style={styles.boroughSection}>
                  <Text style={[styles.boroughSectionTitle, { color: theme.colors.text }]}>
                    {borough}
                  </Text>
                  {(neighborhoodsByBorough[borough] || []).map(neighborhood => (
                    <Pressable
                      key={neighborhood}
                      style={styles.checkboxRow}
                      onPress={() => toggleNeighborhood(neighborhood)}
                    >
                      <View style={styles.checkboxContainer}>
                        <View style={[
                          styles.checkbox,
                          { borderColor: theme.dark ? '#666' : '#ccc' },
                          selectedNeighborhoods.includes(neighborhood) && { backgroundColor: '#34C759', borderColor: '#34C759' }
                        ]}>
                          {selectedNeighborhoods.includes(neighborhood) && (
                            <IconSymbol name="checkmark" color="#FFFFFF" size={16} />
                          )}
                        </View>
                        <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>
                          {neighborhood}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#007AFF' }]}
                onPress={() => setShowNeighborhoodModal(false)}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  locationFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  activeFiltersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  activeFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeFiltersScroll: {
    flexDirection: 'row',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  activeFilterChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
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
  ratingButtonText: {
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
  mapNotice: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  mapNoticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
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
  londonMapVisual: {
    gap: 12,
  },
  zoneCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  zoneTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  zoneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  zoneBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  zoneSubtitle: {
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalScroll: {
    maxHeight: 400,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    flex: 1,
  },
  neighborhoodCount: {
    fontSize: 14,
  },
  boroughSection: {
    paddingVertical: 8,
  },
  boroughSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
