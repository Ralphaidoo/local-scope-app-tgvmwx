
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionPlan } from '@/types';

export default function SubscriptionScreen() {
  const theme = useTheme();
  const { user, upgradeSubscription, getBusinessLimit } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlan = user?.subscriptionPlan || 'free';
  const businessLimit = getBusinessLimit();
  const currentBusinessCount = user?.businessListingCount || 0;

  const plans = [
    {
      id: 'free' as SubscriptionPlan,
      name: 'Free',
      price: '£0',
      period: 'forever',
      features: [
        'List up to 2 businesses',
        'Basic business profile',
        'Customer reviews',
        'Business directory listing',
        'No booking functionality',
        'No product sales',
      ],
      limitations: [
        'Cannot accept bookings',
        'Cannot sell products',
        'Limited to 2 business listings',
      ],
    },
    {
      id: 'pro' as SubscriptionPlan,
      name: 'Pro',
      price: '£29',
      period: 'per month',
      features: [
        'List up to 5 businesses',
        'Full business profile',
        'Customer reviews',
        'Featured directory placement',
        'Online booking system',
        'Product sales & e-commerce',
        'Payment processing',
        'Analytics dashboard',
        'Priority support',
      ],
      limitations: [],
      recommended: true,
    },
  ];

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (plan === currentPlan) {
      Alert.alert('Already Subscribed', `You are already on the ${plan} plan.`);
      return;
    }

    if (plan === 'free' && currentPlan === 'pro') {
      Alert.alert(
        'Downgrade Plan',
        'Are you sure you want to downgrade to the Free plan? You will lose access to booking and product sales features.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Downgrade',
            style: 'destructive',
            onPress: async () => {
              setIsProcessing(true);
              try {
                await upgradeSubscription(plan);
                Alert.alert('Success', 'Your plan has been downgraded.');
                router.back();
              } catch (error) {
                console.log('Downgrade error:', error);
                Alert.alert('Error', 'Failed to downgrade plan. Please try again.');
              } finally {
                setIsProcessing(false);
              }
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Upgrade to Pro',
      'Upgrade to Pro to unlock all features including bookings, product sales, and list up to 5 businesses.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: async () => {
            setIsProcessing(true);
            try {
              // In production, this would process payment via Stripe
              await upgradeSubscription(plan);
              Alert.alert('Success', 'Welcome to Pro! You now have access to all features.');
              router.back();
            } catch (error) {
              console.log('Upgrade error:', error);
              Alert.alert('Error', 'Failed to upgrade plan. Please try again.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Subscription Plans</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Info */}
        <GlassView
          style={[
            styles.currentPlanCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.currentPlanHeader}>
            <IconSymbol name="star.circle.fill" color="#FFD700" size={32} />
            <View style={styles.currentPlanInfo}>
              <Text style={[styles.currentPlanLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                Current Plan
              </Text>
              <Text style={[styles.currentPlanName, { color: theme.colors.text }]}>
                {currentPlan === 'free' ? 'Free' : 'Pro'}
              </Text>
            </View>
          </View>
          <View style={styles.currentPlanStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {currentBusinessCount} / {businessLimit}
              </Text>
              <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                Business Listings
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {currentPlan === 'pro' ? 'Enabled' : 'Disabled'}
              </Text>
              <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                Bookings & Sales
              </Text>
            </View>
          </View>
        </GlassView>

        {/* Plan Comparison */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Choose Your Plan
        </Text>

        {plans.map(plan => (
          <GlassView
            key={plan.id}
            style={[
              styles.planCard,
              plan.recommended && styles.planCardRecommended,
              currentPlan === plan.id && styles.planCardCurrent,
              Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}
            glassEffectStyle="regular"
          >
            {plan.recommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            )}
            
            <View style={styles.planHeader}>
              <Text style={[styles.planName, { color: theme.colors.text }]}>
                {plan.name}
              </Text>
              {currentPlan === plan.id && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              )}
            </View>

            <View style={styles.planPricing}>
              <Text style={[styles.planPrice, { color: theme.colors.text }]}>
                {plan.price}
              </Text>
              <Text style={[styles.planPeriod, { color: theme.dark ? '#98989D' : '#666' }]}>
                {plan.period}
              </Text>
            </View>

            <View style={styles.planFeatures}>
              <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>
                Features:
              </Text>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <IconSymbol name="checkmark.circle.fill" color="#34C759" size={20} />
                  <Text style={[styles.featureText, { color: theme.colors.text }]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            {plan.limitations.length > 0 && (
              <View style={styles.planLimitations}>
                <Text style={[styles.limitationsTitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                  Limitations:
                </Text>
                {plan.limitations.map((limitation, index) => (
                  <View key={index} style={styles.limitationItem}>
                    <IconSymbol name="xmark.circle.fill" color="#FF3B30" size={20} />
                    <Text style={[styles.limitationText, { color: theme.dark ? '#98989D' : '#666' }]}>
                      {limitation}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Pressable
              style={[
                styles.selectButton,
                currentPlan === plan.id && styles.selectButtonCurrent,
                isProcessing && styles.selectButtonDisabled,
                { backgroundColor: currentPlan === plan.id ? theme.dark ? '#333' : '#ddd' : '#007AFF' }
              ]}
              onPress={() => handleUpgrade(plan.id)}
              disabled={isProcessing || currentPlan === plan.id}
            >
              <Text style={[
                styles.selectButtonText,
                currentPlan === plan.id && { color: theme.colors.text }
              ]}>
                {isProcessing ? 'Processing...' : currentPlan === plan.id ? 'Current Plan' : plan.id === 'pro' ? 'Upgrade to Pro' : 'Downgrade'}
              </Text>
            </Pressable>
          </GlassView>
        ))}

        {/* Customer Plan Info */}
        <GlassView
          style={[
            styles.infoCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.infoHeader}>
            <IconSymbol name="info.circle.fill" color="#007AFF" size={24} />
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              Customer Users
            </Text>
          </View>
          <Text style={[styles.infoText, { color: theme.dark ? '#98989D' : '#666' }]}>
            Customer accounts are always free and include full access to discover businesses, make bookings, purchase products, write reviews, and save favorites.
          </Text>
        </GlassView>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContent: {
    paddingVertical: 8,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  currentPlanCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  currentPlanInfo: {
    flex: 1,
  },
  currentPlanLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  currentPlanName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  currentPlanStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  planCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    position: 'relative',
  },
  planCardRecommended: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  planCardCurrent: {
    borderWidth: 2,
    borderColor: '#34C759',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  currentBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 20,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  planPeriod: {
    fontSize: 16,
  },
  planFeatures: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  planLimitations: {
    marginBottom: 16,
  },
  limitationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  limitationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  limitationText: {
    fontSize: 14,
    flex: 1,
  },
  selectButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonCurrent: {
    opacity: 0.6,
  },
  selectButtonDisabled: {
    opacity: 0.5,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
