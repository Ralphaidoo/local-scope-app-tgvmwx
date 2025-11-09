
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { router, useLocalSearchParams } from 'expo-router';

export default function WriteReviewScreen() {
  const theme = useTheme();
  const { businessId, businessName } = useLocalSearchParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    console.log('Review submitted:', { businessId, rating, comment });
    Alert.alert(
      'Success',
      'Thank you for your review!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="xmark" color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Write Review</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Text style={[styles.businessName, { color: theme.colors.text }]}>
            {businessName || 'Business Name'}
          </Text>

          <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
            How would you rate your experience?
          </Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <IconSymbol
                  name={star <= rating ? 'star.fill' : 'star'}
                  color={star <= rating ? '#FFD700' : theme.dark ? '#666' : '#98989D'}
                  size={40}
                />
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
            Tell us about your experience
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.colors.text,
              }
            ]}
            placeholder="Share your thoughts..."
            placeholderTextColor={theme.dark ? '#666' : '#98989D'}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
          />

          <View style={[styles.infoBox, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
            <IconSymbol name="checkmark.shield" color="#007AFF" size={20} />
            <Text style={[styles.infoText, { color: '#007AFF' }]}>
              Your review will be marked as verified since you&apos;ve made a purchase
            </Text>
          </View>
        </GlassView>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <Pressable
          style={[styles.button, { backgroundColor: '#007AFF' }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Submit Review</Text>
        </Pressable>
      </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    padding: 20,
    borderRadius: 12,
  },
  businessName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    marginTop: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  starButton: {
    padding: 4,
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    height: 150,
    textAlignVertical: 'top',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
