
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, BookingStatus } from '@/types';

export default function BookingsScreen() {
  const theme = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const savedBookings = await AsyncStorage.getItem('bookings');
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      } else {
        // Mock bookings for demo
        const mockBookings: Booking[] = [
          {
            id: '1',
            userId: '1',
            businessId: '3',
            serviceId: '1',
            serviceName: 'Women\'s Cut & Blow Dry',
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            time: '14:00',
            duration: 60,
            price: 65.00,
            status: 'confirmed',
            notes: 'Please use organic products',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            userId: '1',
            businessId: '3',
            serviceId: '2',
            serviceName: 'Full Color Treatment',
            date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
            time: '10:00',
            duration: 120,
            price: 95.00,
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            userId: '1',
            businessId: '3',
            serviceId: '3',
            serviceName: 'Manicure',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            time: '15:30',
            duration: 45,
            price: 35.00,
            status: 'completed',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ];
        setBookings(mockBookings);
        await AsyncStorage.setItem('bookings', JSON.stringify(mockBookings));
      }
    } catch (error) {
      console.log('Error loading bookings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const cancelBooking = async (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedBookings = bookings.map(booking =>
                booking.id === bookingId ? { ...booking, status: 'cancelled' as BookingStatus } : booking
              );
              setBookings(updatedBookings);
              await AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
              Alert.alert('Success', 'Booking cancelled successfully');
            } catch (error) {
              console.log('Error cancelling booking:', error);
              Alert.alert('Error', 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const rescheduleBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      router.push({
        pathname: '/booking',
        params: {
          businessId: booking.businessId,
          serviceId: booking.serviceId,
          reschedule: 'true',
          bookingId: booking.id,
        },
      } as any);
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'cancelled':
        return '#FF3B30';
      case 'completed':
        return '#007AFF';
      default:
        return '#98989D';
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (filter === 'upcoming') {
      return bookingDate >= today && booking.status !== 'cancelled' && booking.status !== 'completed';
    } else if (filter === 'past') {
      return bookingDate < today || booking.status === 'completed' || booking.status === 'cancelled';
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>My Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <Pressable
          style={[
            styles.filterTab,
            filter === 'all' && styles.filterTabActive,
            { borderBottomColor: filter === 'all' ? '#007AFF' : 'transparent' }
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterTabText,
            { color: filter === 'all' ? '#007AFF' : theme.dark ? '#98989D' : '#666' }
          ]}>
            All
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterTab,
            filter === 'upcoming' && styles.filterTabActive,
            { borderBottomColor: filter === 'upcoming' ? '#007AFF' : 'transparent' }
          ]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[
            styles.filterTabText,
            { color: filter === 'upcoming' ? '#007AFF' : theme.dark ? '#98989D' : '#666' }
          ]}>
            Upcoming
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterTab,
            filter === 'past' && styles.filterTabActive,
            { borderBottomColor: filter === 'past' ? '#007AFF' : 'transparent' }
          ]}
          onPress={() => setFilter('past')}
        >
          <Text style={[
            styles.filterTabText,
            { color: filter === 'past' ? '#007AFF' : theme.dark ? '#98989D' : '#666' }
          ]}>
            Past
          </Text>
        </Pressable>
      </View>

      {filteredBookings.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="calendar" color={theme.dark ? '#98989D' : '#666'} size={64} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No Bookings
          </Text>
          <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
            {filter === 'upcoming' 
              ? 'You don\'t have any upcoming bookings.'
              : filter === 'past'
              ? 'You don\'t have any past bookings.'
              : 'You haven\'t made any bookings yet.'}
          </Text>
          <Pressable
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)/discover')}
          >
            <Text style={styles.browseButtonText}>Browse Services</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredBookings.map((booking) => (
            <GlassView
              key={booking.id}
              style={[
                styles.bookingCard,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}
              glassEffectStyle="regular"
            >
              <View style={styles.bookingHeader}>
                <View style={styles.bookingHeaderLeft}>
                  <IconSymbol name="calendar" color={theme.colors.text} size={20} />
                  <Text style={[styles.bookingDate, { color: theme.colors.text }]}>
                    {formatDate(booking.date)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                    {getStatusLabel(booking.status)}
                  </Text>
                </View>
              </View>

              <Text style={[styles.serviceName, { color: theme.colors.text }]}>
                {booking.serviceName}
              </Text>

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <IconSymbol name="clock" color={theme.dark ? '#98989D' : '#666'} size={16} />
                  <Text style={[styles.detailText, { color: theme.dark ? '#98989D' : '#666' }]}>
                    {booking.time} ({booking.duration} min)
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <IconSymbol name="sterlingsign.circle" color={theme.dark ? '#98989D' : '#666'} size={16} />
                  <Text style={[styles.detailText, { color: theme.dark ? '#98989D' : '#666' }]}>
                    £{booking.price.toFixed(2)}
                  </Text>
                </View>
              </View>

              {booking.notes && (
                <View style={[styles.notesContainer, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                  <Text style={[styles.notesLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                    Notes:
                  </Text>
                  <Text style={[styles.notesText, { color: theme.colors.text }]}>
                    {booking.notes}
                  </Text>
                </View>
              )}

              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                <View style={styles.bookingActions}>
                  <Pressable
                    style={[styles.actionButton, styles.rescheduleButton]}
                    onPress={() => rescheduleBooking(booking.id)}
                  >
                    <IconSymbol name="arrow.2.squarepath" color="#007AFF" size={16} />
                    <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>
                      Reschedule
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => cancelBooking(booking.id)}
                  >
                    <IconSymbol name="xmark.circle" color="#FF3B30" size={16} />
                    <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              )}
            </GlassView>
          ))}
        </ScrollView>
      )}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
  },
  filterTabActive: {
    borderBottomWidth: 2,
  },
  filterTabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  browseButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bookingDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
  },
  notesContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  rescheduleButton: {
    borderColor: '#007AFF',
  },
  cancelButton: {
    borderColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
