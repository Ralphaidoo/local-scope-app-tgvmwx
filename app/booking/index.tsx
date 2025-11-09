
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { mockBusinesses, mockServices } from '@/data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking } from '@/types';

export default function BookingScreen() {
  const { businessId, serviceId, reschedule, bookingId } = useLocalSearchParams();
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const business = mockBusinesses.find(b => b.id === businessId);
  const service = mockServices.find(s => s.id === serviceId);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ];

  const handleBooking = async () => {
    if (!selectedTime) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    try {
      // Load existing bookings
      const savedBookings = await AsyncStorage.getItem('bookings');
      const bookings: Booking[] = savedBookings ? JSON.parse(savedBookings) : [];

      if (reschedule === 'true' && bookingId) {
        // Update existing booking
        const updatedBookings = bookings.map(booking =>
          booking.id === bookingId
            ? {
                ...booking,
                date: selectedDate.toISOString().split('T')[0],
                time: selectedTime,
              }
            : booking
        );
        await AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
        
        Alert.alert(
          'Booking Rescheduled',
          `Your appointment has been rescheduled to ${selectedDate.toLocaleDateString()} at ${selectedTime}.`,
          [
            {
              text: 'OK',
              onPress: () => router.push('/bookings'),
            },
          ]
        );
      } else {
        // Create new booking
        const newBooking: Booking = {
          id: Date.now().toString(),
          userId: '1', // In production, get from auth context
          businessId: business?.id || '',
          serviceId: service?.id || '',
          serviceName: service?.name || '',
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          duration: service?.duration || 60,
          price: service?.price || 0,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        bookings.push(newBooking);
        await AsyncStorage.setItem('bookings', JSON.stringify(bookings));

        // Create notification
        const savedNotifications = await AsyncStorage.getItem('notifications');
        const notifications = savedNotifications ? JSON.parse(savedNotifications) : [];
        notifications.unshift({
          id: Date.now().toString(),
          type: 'booking',
          title: 'Booking Confirmed',
          message: `Your appointment at ${business?.name} for ${service?.name} on ${selectedDate.toLocaleDateString()} at ${selectedTime} has been confirmed.`,
          read: false,
          createdAt: new Date().toISOString(),
          actionRoute: '/bookings',
        });
        await AsyncStorage.setItem('notifications', JSON.stringify(notifications));

        Alert.alert(
          'Booking Confirmed',
          `Your appointment at ${business?.name} for ${service?.name} on ${selectedDate.toLocaleDateString()} at ${selectedTime} has been confirmed.`,
          [
            {
              text: 'View Bookings',
              onPress: () => router.push('/bookings'),
            },
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.log('Error saving booking:', error);
      Alert.alert('Error', 'Failed to save booking. Please try again.');
    }
  };

  if (!business || !service) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Booking information not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {reschedule === 'true' ? 'Reschedule Booking' : 'Book Service'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <GlassView
          style={[
            styles.serviceCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Text style={[styles.businessName, { color: theme.colors.text }]}>
            {business.name}
          </Text>
          <Text style={[styles.serviceName, { color: theme.colors.text }]}>
            {service.name}
          </Text>
          <View style={styles.serviceDetails}>
            <View style={styles.detailRow}>
              <IconSymbol name="clock" color={theme.dark ? '#98989D' : '#666'} size={18} />
              <Text style={[styles.detailText, { color: theme.dark ? '#98989D' : '#666' }]}>
                {service.duration} minutes
              </Text>
            </View>
            <View style={styles.detailRow}>
              <IconSymbol name="sterlingsign.circle" color={theme.dark ? '#98989D' : '#666'} size={18} />
              <Text style={[styles.detailText, { color: '#34C759' }]}>
                £{service.price.toFixed(2)}
              </Text>
            </View>
          </View>
        </GlassView>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Select Date
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
            {[...Array(14)].map((_, index) => {
              const date = new Date();
              date.setDate(date.getDate() + index);
              const isSelected = selectedDate.toDateString() === date.toDateString();
              
              return (
                <Pressable
                  key={index}
                  style={[
                    styles.dateCard,
                    isSelected && styles.dateCardSelected,
                    { borderColor: theme.dark ? '#333' : '#ddd' }
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[
                    styles.dateDay,
                    { color: isSelected ? '#fff' : theme.colors.text }
                  ]}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={[
                    styles.dateNumber,
                    { color: isSelected ? '#fff' : theme.colors.text }
                  ]}>
                    {date.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Select Time
          </Text>
          <View style={styles.timeSlotsGrid}>
            {timeSlots.map(time => {
              const isSelected = selectedTime === time;
              
              return (
                <Pressable
                  key={time}
                  style={[
                    styles.timeSlot,
                    isSelected && styles.timeSlotSelected,
                    { borderColor: theme.dark ? '#333' : '#ddd' }
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[
                    styles.timeSlotText,
                    { color: isSelected ? '#fff' : theme.colors.text }
                  ]}>
                    {time}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.dark ? '#333' : '#ddd' }]}>
        <Pressable
          style={[styles.bookButton, !selectedTime && styles.bookButtonDisabled]}
          onPress={handleBooking}
          disabled={!selectedTime}
        >
          <Text style={styles.bookButtonText}>
            {reschedule === 'true' ? 'Confirm Reschedule' : 'Confirm Booking'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 32,
  },
  serviceCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  datesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  dateCard: {
    width: 70,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 12,
  },
  dateCardSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dateDay: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeSlotText: {
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    opacity: 0.4,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
