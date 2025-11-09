
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const theme = useTheme();
  const { user } = useAuth();

  if (user?.userType !== 'business') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.notAuthorized}>
          <IconSymbol name="exclamationmark.triangle" color="#FF9500" size={64} />
          <Text style={[styles.notAuthorizedText, { color: theme.colors.text }]}>
            This section is only available for business owners
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = [
    { label: 'Total Orders', value: '127', icon: 'bag.fill', color: '#007AFF' },
    { label: 'Revenue', value: '£3,450', icon: 'sterlingsign.circle.fill', color: '#34C759' },
    { label: 'Bookings', value: '45', icon: 'calendar', color: '#FF9500' },
    { label: 'Reviews', value: '4.8', icon: 'star.fill', color: '#FFD700' },
  ];

  const quickActions = [
    { label: 'Add Product', icon: 'plus.circle.fill', route: '/products/add' },
    { label: 'Manage Orders', icon: 'bag', route: '/orders/manage' },
    { label: 'View Bookings', icon: 'calendar', route: '/bookings/manage' },
    { label: 'Wallet', icon: 'creditcard', route: '/wallet' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Dashboard</Text>
          <Text style={[styles.headerSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
            Welcome back, {user.fullName.split(' ')[0]}!
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map(stat => (
            <GlassView
              key={stat.label}
              style={[
                styles.statCard,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}
              glassEffectStyle="regular"
            >
              <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                <IconSymbol name={stat.icon} color="#fff" size={24} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>{stat.label}</Text>
            </GlassView>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map(action => (
              <Pressable
                key={action.label}
                onPress={() => console.log('Navigate to:', action.route)}
              >
                <GlassView
                  style={[
                    styles.actionCard,
                    Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                  ]}
                  glassEffectStyle="regular"
                >
                  <IconSymbol name={action.icon} color={theme.colors.primary} size={32} />
                  <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{action.label}</Text>
                </GlassView>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Activity</Text>
          <GlassView
            style={[
              styles.activityCard,
              Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}
            glassEffectStyle="regular"
          >
            <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
              No recent activity
            </Text>
          </GlassView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  notAuthorized: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  notAuthorizedText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: 170,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  activityCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
