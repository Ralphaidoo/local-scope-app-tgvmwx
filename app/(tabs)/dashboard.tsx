
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { supabase } from '@/app/integrations/supabase/client';

interface DashboardStats {
  totalOrders: number;
  revenue: number;
  bookings: number;
  averageRating: number;
}

export default function DashboardScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    revenue: 0,
    bookings: 0,
    averageRating: 0,
  });
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.userType === 'business_user' || user?.userType === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      console.log('Loading dashboard data for user:', user?.id);
      
      // Get user's profile to find their profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) {
        console.log('No profile found');
        setIsLoading(false);
        return;
      }

      console.log('Profile ID:', profile.id);

      // Get user's businesses
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', profile.id)
        .eq('archived', false);

      if (businessError) {
        console.log('Error loading businesses:', businessError);
      } else {
        console.log('Businesses loaded:', businessData?.length);
        setBusinesses(businessData || []);
      }

      const businessIds = businessData?.map(b => b.id) || [];

      if (businessIds.length === 0) {
        console.log('No businesses found');
        setIsLoading(false);
        return;
      }

      // Get orders for user's businesses
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, status')
        .in('business_id', businessIds);

      if (ordersError) {
        console.log('Error loading orders:', ordersError);
      }

      // Get bookings for user's businesses
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .in('business_id', businessIds);

      if (bookingsError) {
        console.log('Error loading bookings:', bookingsError);
      }

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const revenue = orders?.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;
      const totalBookings = bookings?.length || 0;
      
      // Calculate average rating from businesses
      const ratings = businessData?.map(b => parseFloat(b.average_rating) || 0) || [];
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;

      console.log('Stats calculated:', { totalOrders, revenue, totalBookings, averageRating });

      setStats({
        totalOrders,
        revenue,
        bookings: totalBookings,
        averageRating,
      });
    } catch (error) {
      console.log('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (user?.userType !== 'business_user' && user?.userType !== 'admin') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.notAuthorized}>
          <IconSymbol name="exclamationmark.triangle" color="#FF9500" size={64} />
          <Text style={[styles.notAuthorizedText, { color: theme.colors.text }]}>
            This section is only available for business owners and admins
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const statsDisplay = [
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: 'bag.fill', color: '#007AFF' },
    { label: 'Revenue', value: `£${stats.revenue.toFixed(2)}`, icon: 'sterlingsign.circle.fill', color: '#34C759' },
    { label: 'Bookings', value: stats.bookings.toString(), icon: 'calendar', color: '#FF9500' },
    { label: 'Avg Rating', value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A', icon: 'star.fill', color: '#FFD700' },
  ];

  const quickActions = [
    { label: 'Manage Products', icon: 'bag.fill', route: '/products' },
    { label: 'View Orders', icon: 'list.bullet', route: '/orders' },
    { label: 'Wallet', icon: 'sterlingsign.circle.fill', route: '/wallet' },
    { label: 'Edit Business', icon: 'pencil', route: '/business-management' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Dashboard</Text>
          <Text style={[styles.headerSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
            Welcome back, {user?.fullName?.split(' ')[0] || 'User'}!
          </Text>
        </View>

        {/* Admin Badge */}
        {user?.userType === 'admin' && (
          <GlassView
            style={[
              styles.adminBadge,
              Platform.OS !== 'ios' && { backgroundColor: 'rgba(255, 149, 0, 0.1)' }
            ]}
            glassEffectStyle="regular"
          >
            <IconSymbol name="checkmark.shield.fill" color="#FF9500" size={24} />
            <Text style={[styles.adminBadgeText, { color: theme.colors.text }]}>
              Admin Dashboard - Full Access
            </Text>
          </GlassView>
        )}

        {/* Business Count Info */}
        {businesses.length > 0 && (
          <GlassView
            style={[
              styles.infoCard,
              Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}
            glassEffectStyle="regular"
          >
            <Text style={[styles.infoText, { color: theme.colors.text }]}>
              You have {businesses.length} active business{businesses.length !== 1 ? 'es' : ''}
            </Text>
          </GlassView>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsDisplay.map(stat => (
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
                onPress={() => router.push(action.route as any)}
              >
                <GlassView
                  style={[
                    styles.actionCard,
                    Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                  ]}
                  glassEffectStyle="regular"
                >
                  <IconSymbol name={action.icon} color="#007AFF" size={32} />
                  <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{action.label}</Text>
                </GlassView>
              </Pressable>
            ))}
          </View>
        </View>

        {/* My Businesses */}
        {businesses.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>My Businesses</Text>
            {businesses.map(business => (
              <Pressable
                key={business.id}
                onPress={() => router.push(`/business/${business.id}` as any)}
              >
                <GlassView
                  style={[
                    styles.businessCard,
                    Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                  ]}
                  glassEffectStyle="regular"
                >
                  <View style={styles.businessInfo}>
                    <Text style={[styles.businessName, { color: theme.colors.text }]}>
                      {business.name}
                    </Text>
                    <Text style={[styles.businessCategory, { color: theme.dark ? '#98989D' : '#666' }]}>
                      {business.category}
                    </Text>
                  </View>
                  <View style={styles.businessStats}>
                    <View style={styles.businessStat}>
                      <IconSymbol name="star.fill" color="#FFD700" size={16} />
                      <Text style={[styles.businessStatText, { color: theme.colors.text }]}>
                        {parseFloat(business.average_rating || 0).toFixed(1)}
                      </Text>
                    </View>
                    <View style={styles.businessStat}>
                      <IconSymbol name="eye.fill" color="#007AFF" size={16} />
                      <Text style={[styles.businessStatText, { color: theme.colors.text }]}>
                        {business.view_count || 0}
                      </Text>
                    </View>
                  </View>
                </GlassView>
              </Pressable>
            ))}
          </View>
        )}

        {/* Empty State */}
        {businesses.length === 0 && !isLoading && (
          <View style={styles.section}>
            <GlassView
              style={[
                styles.emptyCard,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}
              glassEffectStyle="regular"
            >
              <IconSymbol name="building.2" color={theme.dark ? '#98989D' : '#666'} size={48} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
                No Businesses Yet
              </Text>
              <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
                Add your first business to start managing orders and bookings
              </Text>
              <Pressable
                style={styles.addBusinessButton}
                onPress={() => router.push('/business-management')}
              >
                <Text style={styles.addBusinessButtonText}>Add Business</Text>
              </Pressable>
            </GlassView>
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
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF9500',
  },
  adminBadgeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
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
  businessCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
  },
  businessStats: {
    flexDirection: 'row',
    gap: 16,
  },
  businessStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  businessStatText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  addBusinessButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  addBusinessButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
