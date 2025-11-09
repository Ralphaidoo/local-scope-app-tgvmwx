
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout, getBusinessLimit } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth');
            } catch (error) {
              console.log('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const businessLimit = getBusinessLimit();
  const currentBusinessCount = user?.businessListingCount || 0;
  const subscriptionPlan = user?.subscriptionPlan || 'free';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <GlassView
          style={[
            styles.userCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.dark ? '#333' : '#ddd' }]}>
              <IconSymbol name="person.fill" color={theme.colors.text} size={40} />
            </View>
          </View>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {user?.fullName || 'User'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.dark ? '#98989D' : '#666' }]}>
            {user?.email || 'user@example.com'}
          </Text>
          <View style={styles.userTypeBadge}>
            <Text style={[styles.userTypeText, { color: theme.colors.text }]}>
              {user?.userType === 'customer' ? 'Customer' : user?.userType === 'business' ? 'Business Owner' : 'Admin'}
            </Text>
          </View>
        </GlassView>

        {/* Subscription Card (for business users) */}
        {user?.userType === 'business' && (
          <GlassView
            style={[
              styles.subscriptionCard,
              Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}
            glassEffectStyle="regular"
          >
            <View style={styles.subscriptionHeader}>
              <View style={styles.subscriptionInfo}>
                <Text style={[styles.subscriptionLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                  Subscription Plan
                </Text>
                <View style={styles.subscriptionPlanRow}>
                  <Text style={[styles.subscriptionPlan, { color: theme.colors.text }]}>
                    {subscriptionPlan === 'free' ? 'Free' : 'Pro'}
                  </Text>
                  {subscriptionPlan === 'pro' && (
                    <IconSymbol name="star.fill" color="#FFD700" size={20} />
                  )}
                </View>
              </View>
              <Pressable
                style={[styles.upgradeButton, { backgroundColor: subscriptionPlan === 'free' ? '#007AFF' : theme.dark ? '#333' : '#ddd' }]}
                onPress={() => router.push('/subscription')}
              >
                <Text style={[styles.upgradeButtonText, { color: subscriptionPlan === 'free' ? '#fff' : theme.colors.text }]}>
                  {subscriptionPlan === 'free' ? 'Upgrade' : 'Manage'}
                </Text>
              </Pressable>
            </View>
            
            <View style={styles.subscriptionStats}>
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
                  {subscriptionPlan === 'pro' ? 'Enabled' : 'Disabled'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                  Bookings & Sales
                </Text>
              </View>
            </View>

            {subscriptionPlan === 'free' && (
              <View style={styles.upgradePrompt}>
                <IconSymbol name="star.circle.fill" color="#FFD700" size={24} />
                <Text style={[styles.upgradePromptText, { color: theme.colors.text }]}>
                  Upgrade to Pro to unlock bookings, product sales, and list up to 5 businesses!
                </Text>
              </View>
            )}
          </GlassView>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Pressable onPress={() => router.push('/settings')}>
            <GlassView
              style={[
                styles.menuItem,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}
              glassEffectStyle="regular"
            >
              <View style={styles.menuItemLeft}>
                <IconSymbol name="gear" color={theme.colors.text} size={24} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  Settings
                </Text>
              </View>
              <IconSymbol name="chevron.right" color={theme.dark ? '#98989D' : '#666'} size={20} />
            </GlassView>
          </Pressable>

          <Pressable onPress={() => router.push('/notifications')}>
            <GlassView
              style={[
                styles.menuItem,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}
              glassEffectStyle="regular"
            >
              <View style={styles.menuItemLeft}>
                <IconSymbol name="bell" color={theme.colors.text} size={24} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  Notifications
                </Text>
              </View>
              <IconSymbol name="chevron.right" color={theme.dark ? '#98989D' : '#666'} size={20} />
            </GlassView>
          </Pressable>

          {user?.userType === 'customer' && (
            <Pressable onPress={() => router.push('/bookings')}>
              <GlassView
                style={[
                  styles.menuItem,
                  Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}
                glassEffectStyle="regular"
              >
                <View style={styles.menuItemLeft}>
                  <IconSymbol name="calendar" color={theme.colors.text} size={24} />
                  <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                    My Bookings
                  </Text>
                </View>
                <IconSymbol name="chevron.right" color={theme.dark ? '#98989D' : '#666'} size={20} />
              </GlassView>
            </Pressable>
          )}

          <Pressable onPress={() => router.push('/payment-methods')}>
            <GlassView
              style={[
                styles.menuItem,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}
              glassEffectStyle="regular"
            >
              <View style={styles.menuItemLeft}>
                <IconSymbol name="creditcard" color={theme.colors.text} size={24} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                  Payment Methods
                </Text>
              </View>
              <IconSymbol name="chevron.right" color={theme.dark ? '#98989D' : '#666'} size={20} />
            </GlassView>
          </Pressable>

          <Pressable onPress={handleLogout}>
            <GlassView
              style={[
                styles.menuItem,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}
              glassEffectStyle="regular"
            >
              <View style={styles.menuItemLeft}>
                <IconSymbol name="arrow.right.square" color="#FF3B30" size={24} />
                <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>
                  Logout
                </Text>
              </View>
              <IconSymbol name="chevron.right" color={theme.dark ? '#98989D' : '#666'} size={20} />
            </GlassView>
          </Pressable>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: theme.dark ? '#666' : '#999' }]}>
            Local Scope v1.0.0
          </Text>
          <Text style={[styles.appInfoText, { color: theme.dark ? '#666' : '#999' }]}>
            © 2024 Local Scope. All rights reserved.
          </Text>
        </View>
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
  userCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  userTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  userTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subscriptionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  subscriptionPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subscriptionPlan: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  upgradeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subscriptionStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
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
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  upgradePromptText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 12,
    marginBottom: 4,
  },
});
