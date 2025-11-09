
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, TextInput, Alert, RefreshControl, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DashboardStats {
  totalUsers: number;
  totalBusinesses: number;
  totalOrders: number;
  totalRevenue: number;
  pendingWithdrawals: number;
  pendingBusinesses: number;
  activePromoCodes: number;
  totalAdmins: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  user_type: string;
  subscription_plan: string;
  created_at: string;
}

interface Business {
  id: string;
  name: string;
  category: string;
  owner_id: string;
  moderation_status: string;
  featured: boolean;
  verified: boolean;
  created_at: string;
  owner?: {
    full_name: string;
    email: string;
  };
}

interface WithdrawalRequest {
  id: string;
  business_id: string;
  amount: number;
  status: string;
  requested_at: string;
  bank_details: any;
  business?: {
    name: string;
    owner?: {
      full_name: string;
      email: string;
    };
  };
}

interface PromoCode {
  id: string;
  code: string;
  type: string;
  value: number;
  usage_limit: number;
  used_count: number;
  expires_at: string;
  active: boolean;
  created_at: string;
}

type TabType = 'overview' | 'users' | 'businesses' | 'withdrawals' | 'promos' | 'analytics' | 'admins' | 'data';

export default function AdminScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBusinesses: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingWithdrawals: 0,
    pendingBusinesses: 0,
    activePromoCodes: 0,
    totalAdmins: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  // Modal states
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState({
    code: '',
    type: 'percentage',
    value: '',
    usageLimit: '',
    expiresAt: '',
  });
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  useEffect(() => {
    if (user?.userType === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadAdminUsers(),
        loadBusinesses(),
        loadWithdrawals(),
        loadPromoCodes(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get total users
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get total admins
      const { count: adminsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      // Get total businesses
      const { count: businessesCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

      // Get total orders
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'completed');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Get pending withdrawals
      const { count: pendingWithdrawalsCount } = await supabase
        .from('withdrawal_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get pending businesses
      const { count: pendingBusinessesCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('moderation_status', 'pending');

      // Get active promo codes
      const { count: activePromoCodesCount } = await supabase
        .from('promo_codes')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      setStats({
        totalUsers: usersCount || 0,
        totalBusinesses: businessesCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue: totalRevenue,
        pendingWithdrawals: pendingWithdrawalsCount || 0,
        pendingBusinesses: pendingBusinessesCount || 0,
        activePromoCodes: activePromoCodesCount || 0,
        totalAdmins: adminsCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, user_type, subscription_plan, created_at')
        .neq('role', 'admin')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, user_type, subscription_plan, created_at')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error loading admin users:', error);
    }
  };

  const loadBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select(`
          id,
          name,
          category,
          owner_id,
          moderation_status,
          featured,
          verified,
          created_at,
          owner:profiles!businesses_owner_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };

  const loadWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          id,
          business_id,
          amount,
          status,
          requested_at,
          bank_details,
          business:businesses!withdrawal_requests_business_id_fkey(
            name,
            owner:profiles!businesses_owner_id_fkey(full_name, email)
          )
        `)
        .order('requested_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    }
  };

  const loadPromoCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error) {
      console.error('Error loading promo codes:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'delete' | 'promote') => {
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${action} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              if (action === 'delete') {
                const { error } = await supabase
                  .from('profiles')
                  .delete()
                  .eq('id', userId);
                if (error) throw error;
              } else if (action === 'promote') {
                const { error } = await supabase
                  .from('profiles')
                  .update({ role: 'admin', user_type: 'admin' })
                  .eq('id', userId);
                if (error) throw error;
              }

              // Log admin action
              await supabase.from('admin_actions').insert({
                action_type: action,
                target_type: 'user',
                target_id: userId,
              });

              Alert.alert('Success', `User ${action}ed successfully`);
              loadUsers();
              loadAdminUsers();
              loadStats();
            } catch (error) {
              console.error(`Error ${action}ing user:`, error);
              Alert.alert('Error', `Failed to ${action} user`);
            }
          },
        },
      ]
    );
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newAdmin.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            full_name: newAdmin.fullName,
            user_type: 'admin',
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create admin profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            email: newAdmin.email,
            full_name: newAdmin.fullName,
            role: 'admin',
            user_type: 'admin',
            subscription_plan: 'pro',
            business_listing_count: 0,
            has_completed_onboarding: true,
          });

        if (profileError) throw profileError;

        // Log admin action
        await supabase.from('admin_actions').insert({
          action_type: 'create_admin',
          target_type: 'user',
          target_id: authData.user.id,
          details: { email: newAdmin.email, full_name: newAdmin.fullName },
        });

        Alert.alert(
          'Success',
          'Admin user created successfully! They will need to verify their email before logging in.',
          [{ text: 'OK', onPress: () => {
            setShowAdminModal(false);
            setNewAdmin({ email: '', password: '', fullName: '' });
            loadAdminUsers();
            loadStats();
          }}]
        );
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      Alert.alert('Error', error.message || 'Failed to create admin user');
    }
  };

  const handleRemoveAdmin = async (userId: string, userEmail: string) => {
    if (userId === user?.id) {
      Alert.alert('Error', 'You cannot remove yourself as an admin');
      return;
    }

    Alert.alert(
      'Confirm Action',
      `Are you sure you want to remove admin privileges from ${userEmail}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('profiles')
                .update({ role: 'customer', user_type: 'customer' })
                .eq('id', userId);

              if (error) throw error;

              // Log admin action
              await supabase.from('admin_actions').insert({
                action_type: 'remove_admin',
                target_type: 'user',
                target_id: userId,
              });

              Alert.alert('Success', 'Admin privileges removed successfully');
              loadAdminUsers();
              loadUsers();
              loadStats();
            } catch (error) {
              console.error('Error removing admin:', error);
              Alert.alert('Error', 'Failed to remove admin privileges');
            }
          },
        },
      ]
    );
  };

  const handleBusinessModeration = async (businessId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ moderation_status: status })
        .eq('id', businessId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_actions').insert({
        action_type: 'moderate_business',
        target_type: 'business',
        target_id: businessId,
        details: { status },
      });

      Alert.alert('Success', `Business ${status} successfully`);
      loadBusinesses();
      loadStats();
    } catch (error) {
      console.error('Error moderating business:', error);
      Alert.alert('Error', 'Failed to moderate business');
    }
  };

  const handleToggleFeatured = async (businessId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ featured: !currentFeatured })
        .eq('id', businessId);

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_actions').insert({
        action_type: 'toggle_featured',
        target_type: 'business',
        target_id: businessId,
        details: { featured: !currentFeatured },
      });

      Alert.alert('Success', `Business ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`);
      loadBusinesses();
    } catch (error) {
      console.error('Error toggling featured:', error);
      Alert.alert('Error', 'Failed to toggle featured status');
    }
  };

  const handleWithdrawalAction = async (withdrawalId: string, action: 'approved' | 'rejected') => {
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${action === 'approved' ? 'approve' : 'reject'} this withdrawal?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('withdrawal_requests')
                .update({
                  status: action,
                  processed_at: new Date().toISOString(),
                })
                .eq('id', withdrawalId);

              if (error) throw error;

              // Log admin action
              await supabase.from('admin_actions').insert({
                action_type: 'process_withdrawal',
                target_type: 'withdrawal',
                target_id: withdrawalId,
                details: { status: action },
              });

              Alert.alert('Success', `Withdrawal ${action} successfully`);
              loadWithdrawals();
              loadStats();
            } catch (error) {
              console.error('Error processing withdrawal:', error);
              Alert.alert('Error', 'Failed to process withdrawal');
            }
          },
        },
      ]
    );
  };

  const handleCreatePromoCode = async () => {
    if (!newPromoCode.code || !newPromoCode.value) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase.from('promo_codes').insert({
        code: newPromoCode.code.toUpperCase(),
        type: newPromoCode.type,
        value: parseFloat(newPromoCode.value),
        usage_limit: newPromoCode.usageLimit ? parseInt(newPromoCode.usageLimit) : null,
        expires_at: newPromoCode.expiresAt || null,
        active: true,
      });

      if (error) throw error;

      // Log admin action
      await supabase.from('admin_actions').insert({
        action_type: 'create_promo_code',
        target_type: 'promo_code',
        details: { code: newPromoCode.code },
      });

      Alert.alert('Success', 'Promo code created successfully');
      setShowPromoModal(false);
      setNewPromoCode({
        code: '',
        type: 'percentage',
        value: '',
        usageLimit: '',
        expiresAt: '',
      });
      loadPromoCodes();
      loadStats();
    } catch (error) {
      console.error('Error creating promo code:', error);
      Alert.alert('Error', 'Failed to create promo code');
    }
  };

  const handleTogglePromoCode = async (promoId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ active: !currentActive })
        .eq('id', promoId);

      if (error) throw error;

      Alert.alert('Success', `Promo code ${!currentActive ? 'activated' : 'deactivated'} successfully`);
      loadPromoCodes();
      loadStats();
    } catch (error) {
      console.error('Error toggling promo code:', error);
      Alert.alert('Error', 'Failed to toggle promo code');
    }
  };

  const handleDeleteAllSampleData = async () => {
    Alert.alert(
      'Delete All Sample Data',
      'This will clear all local sample data including favorites, cart items, bookings, and payment methods stored in AsyncStorage. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all AsyncStorage keys related to sample data
              const keysToRemove = [
                'favorites',
                'cart',
                'bookings',
                'paymentMethods',
                'settings',
                'orders',
              ];

              await Promise.all(
                keysToRemove.map(key => AsyncStorage.removeItem(key))
              );

              // Log admin action
              await supabase.from('admin_actions').insert({
                action_type: 'delete_sample_data',
                target_type: 'system',
                details: { cleared_keys: keysToRemove },
              });

              Alert.alert(
                'Success',
                'All sample data has been cleared from local storage. Users will need to restart the app to see the changes.',
                [{ text: 'OK' }]
              );

              console.log('Sample data cleared successfully');
            } catch (error) {
              console.error('Error clearing sample data:', error);
              Alert.alert('Error', 'Failed to clear sample data');
            }
          },
        },
      ]
    );
  };

  if (user?.userType !== 'admin') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.notAuthorized}>
          <IconSymbol name="exclamationmark.triangle" color="#FF9500" size={64} />
          <Text style={[styles.notAuthorizedText, { color: theme.colors.text }]}>
            This section is only available for administrators
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderOverview = () => (
    <View>
      <View style={styles.statsGrid}>
        <GlassView
          style={[
            styles.statCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={[styles.statIcon, { backgroundColor: '#007AFF' }]}>
            <IconSymbol name="person.3.fill" color="#fff" size={24} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.totalUsers}</Text>
          <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Total Users</Text>
        </GlassView>

        <GlassView
          style={[
            styles.statCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={[styles.statIcon, { backgroundColor: '#FF3B30' }]}>
            <IconSymbol name="shield.fill" color="#fff" size={24} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.totalAdmins}</Text>
          <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Admins</Text>
        </GlassView>

        <GlassView
          style={[
            styles.statCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={[styles.statIcon, { backgroundColor: '#34C759' }]}>
            <IconSymbol name="building.2.fill" color="#fff" size={24} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.totalBusinesses}</Text>
          <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Businesses</Text>
        </GlassView>

        <GlassView
          style={[
            styles.statCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={[styles.statIcon, { backgroundColor: '#FF9500' }]}>
            <IconSymbol name="bag.fill" color="#fff" size={24} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.totalOrders}</Text>
          <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Orders</Text>
        </GlassView>

        <GlassView
          style={[
            styles.statCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={[styles.statIcon, { backgroundColor: '#FFD700' }]}>
            <IconSymbol name="sterlingsign.circle.fill" color="#fff" size={24} />
          </View>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>£{stats.totalRevenue.toFixed(2)}</Text>
          <Text style={[styles.statLabel, { color: theme.dark ? '#98989D' : '#666' }]}>Revenue</Text>
        </GlassView>
      </View>

      <View style={styles.alertsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pending Actions</Text>
        
        {stats.pendingBusinesses > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.alertCard,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={() => setActiveTab('businesses')}
          >
            <GlassView
              style={[
                styles.alertCardInner,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,149,0,0.2)' : 'rgba(255,149,0,0.1)' }
              ]}
              glassEffectStyle="regular"
            >
              <View style={[styles.alertIcon, { backgroundColor: '#FF9500' }]}>
                <IconSymbol name="building.2.fill" color="#fff" size={20} />
              </View>
              <View style={styles.alertContent}>
                <Text style={[styles.alertTitle, { color: theme.colors.text }]}>
                  {stats.pendingBusinesses} Business{stats.pendingBusinesses !== 1 ? 'es' : ''} Pending Review
                </Text>
                <Text style={[styles.alertSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                  Tap to review and approve
                </Text>
              </View>
              <IconSymbol name="chevron.right" color={theme.dark ? '#98989D' : '#666'} size={20} />
            </GlassView>
          </Pressable>
        )}

        {stats.pendingWithdrawals > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.alertCard,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={() => setActiveTab('withdrawals')}
          >
            <GlassView
              style={[
                styles.alertCardInner,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(52,199,89,0.2)' : 'rgba(52,199,89,0.1)' }
              ]}
              glassEffectStyle="regular"
            >
              <View style={[styles.alertIcon, { backgroundColor: '#34C759' }]}>
                <IconSymbol name="sterlingsign.circle.fill" color="#fff" size={20} />
              </View>
              <View style={styles.alertContent}>
                <Text style={[styles.alertTitle, { color: theme.colors.text }]}>
                  {stats.pendingWithdrawals} Withdrawal{stats.pendingWithdrawals !== 1 ? 's' : ''} Pending
                </Text>
                <Text style={[styles.alertSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                  Tap to process withdrawals
                </Text>
              </View>
              <IconSymbol name="chevron.right" color={theme.dark ? '#98989D' : '#666'} size={20} />
            </GlassView>
          </Pressable>
        )}
      </View>
    </View>
  );

  const renderAdmins = () => (
    <View>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Admin Users</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
            {adminUsers.length} admin{adminUsers.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={() => setShowAdminModal(true)}
        >
          <IconSymbol name="plus.circle.fill" color="#007AFF" size={32} />
        </Pressable>
      </View>

      {adminUsers.map((admin) => (
        <GlassView
          key={admin.id}
          style={[
            styles.listCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.listCardHeader}>
            <View style={styles.listCardInfo}>
              <View style={styles.adminHeaderRow}>
                <IconSymbol name="shield.fill" color="#FF3B30" size={24} />
                <Text style={[styles.listCardTitle, { color: theme.colors.text, marginLeft: 8 }]}>
                  {admin.full_name || 'No name'}
                </Text>
              </View>
              <Text style={[styles.listCardSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                {admin.email}
              </Text>
              <Text style={[styles.listCardSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                Created: {new Date(admin.created_at).toLocaleDateString()}
              </Text>
              <View style={styles.badgeContainer}>
                <View style={[styles.badge, { backgroundColor: '#FF3B30' }]}>
                  <Text style={styles.badgeText}>Admin</Text>
                </View>
                {admin.id === user?.id && (
                  <View style={[styles.badge, { backgroundColor: '#007AFF' }]}>
                    <Text style={styles.badgeText}>You</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {admin.id !== user?.id && (
            <View style={styles.listCardActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { opacity: pressed ? 0.7 : 1, backgroundColor: '#FF9500' }
                ]}
                onPress={() => handleRemoveAdmin(admin.id, admin.email)}
              >
                <Text style={styles.actionButtonText}>Remove Admin</Text>
              </Pressable>
            </View>
          )}
        </GlassView>
      ))}
    </View>
  );

  const renderUsers = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>User Management</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
          {users.length} users
        </Text>
      </View>

      {users.map((user) => (
        <GlassView
          key={user.id}
          style={[
            styles.listCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.listCardHeader}>
            <View style={styles.listCardInfo}>
              <Text style={[styles.listCardTitle, { color: theme.colors.text }]}>
                {user.full_name || 'No name'}
              </Text>
              <Text style={[styles.listCardSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                {user.email}
              </Text>
              <View style={styles.badgeContainer}>
                <View style={[styles.badge, { backgroundColor: user.role === 'admin' ? '#FF3B30' : '#007AFF' }]}>
                  <Text style={styles.badgeText}>{user.role || user.user_type}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: user.subscription_plan === 'pro' ? '#FFD700' : '#8E8E93' }]}>
                  <Text style={styles.badgeText}>{user.subscription_plan || 'free'}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.listCardActions}>
            {user.role !== 'admin' && (
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { opacity: pressed ? 0.7 : 1, backgroundColor: '#007AFF' }
                ]}
                onPress={() => handleUserAction(user.id, 'promote')}
              >
                <Text style={styles.actionButtonText}>Make Admin</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.7 : 1, backgroundColor: '#FF3B30' }
              ]}
              onPress={() => handleUserAction(user.id, 'delete')}
            >
              <Text style={styles.actionButtonText}>Delete</Text>
            </Pressable>
          </View>
        </GlassView>
      ))}
    </View>
  );

  const renderBusinesses = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Business Moderation</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
          {businesses.length} businesses
        </Text>
      </View>

      {businesses.map((business) => (
        <GlassView
          key={business.id}
          style={[
            styles.listCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.listCardHeader}>
            <View style={styles.listCardInfo}>
              <Text style={[styles.listCardTitle, { color: theme.colors.text }]}>
                {business.name}
              </Text>
              <Text style={[styles.listCardSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                {business.category}
              </Text>
              {business.owner && (
                <Text style={[styles.listCardSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                  Owner: {business.owner.full_name} ({business.owner.email})
                </Text>
              )}
              <View style={styles.badgeContainer}>
                <View style={[
                  styles.badge,
                  {
                    backgroundColor:
                      business.moderation_status === 'approved' ? '#34C759' :
                      business.moderation_status === 'rejected' ? '#FF3B30' :
                      '#FF9500'
                  }
                ]}>
                  <Text style={styles.badgeText}>{business.moderation_status}</Text>
                </View>
                {business.featured && (
                  <View style={[styles.badge, { backgroundColor: '#FFD700' }]}>
                    <Text style={styles.badgeText}>Featured</Text>
                  </View>
                )}
                {business.verified && (
                  <View style={[styles.badge, { backgroundColor: '#007AFF' }]}>
                    <Text style={styles.badgeText}>Verified</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.listCardActions}>
            {business.moderation_status === 'pending' && (
              <>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { opacity: pressed ? 0.7 : 1, backgroundColor: '#34C759' }
                  ]}
                  onPress={() => handleBusinessModeration(business.id, 'approved')}
                >
                  <Text style={styles.actionButtonText}>Approve</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { opacity: pressed ? 0.7 : 1, backgroundColor: '#FF3B30' }
                  ]}
                  onPress={() => handleBusinessModeration(business.id, 'rejected')}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </Pressable>
              </>
            )}
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.7 : 1, backgroundColor: business.featured ? '#8E8E93' : '#FFD700' }
              ]}
              onPress={() => handleToggleFeatured(business.id, business.featured)}
            >
              <Text style={styles.actionButtonText}>
                {business.featured ? 'Unfeature' : 'Feature'}
              </Text>
            </Pressable>
          </View>
        </GlassView>
      ))}
    </View>
  );

  const renderWithdrawals = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Withdrawal Requests</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
          {withdrawals.length} requests
        </Text>
      </View>

      {withdrawals.map((withdrawal) => (
        <GlassView
          key={withdrawal.id}
          style={[
            styles.listCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.listCardHeader}>
            <View style={styles.listCardInfo}>
              <Text style={[styles.listCardTitle, { color: theme.colors.text }]}>
                £{Number(withdrawal.amount).toFixed(2)}
              </Text>
              {withdrawal.business && (
                <>
                  <Text style={[styles.listCardSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                    Business: {withdrawal.business.name}
                  </Text>
                  {withdrawal.business.owner && (
                    <Text style={[styles.listCardSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                      Owner: {withdrawal.business.owner.full_name}
                    </Text>
                  )}
                </>
              )}
              <Text style={[styles.listCardSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                Requested: {new Date(withdrawal.requested_at).toLocaleDateString()}
              </Text>
              <View style={styles.badgeContainer}>
                <View style={[
                  styles.badge,
                  {
                    backgroundColor:
                      withdrawal.status === 'approved' ? '#34C759' :
                      withdrawal.status === 'rejected' ? '#FF3B30' :
                      withdrawal.status === 'completed' ? '#007AFF' :
                      '#FF9500'
                  }
                ]}>
                  <Text style={styles.badgeText}>{withdrawal.status}</Text>
                </View>
              </View>
            </View>
          </View>

          {withdrawal.status === 'pending' && (
            <View style={styles.listCardActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { opacity: pressed ? 0.7 : 1, backgroundColor: '#34C759' }
                ]}
                onPress={() => handleWithdrawalAction(withdrawal.id, 'approved')}
              >
                <Text style={styles.actionButtonText}>Approve</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { opacity: pressed ? 0.7 : 1, backgroundColor: '#FF3B30' }
                ]}
                onPress={() => handleWithdrawalAction(withdrawal.id, 'rejected')}
              >
                <Text style={styles.actionButtonText}>Reject</Text>
              </Pressable>
            </View>
          )}
        </GlassView>
      ))}
    </View>
  );

  const renderPromoCodes = () => (
    <View>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Promo Codes</Text>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={() => setShowPromoModal(true)}
        >
          <IconSymbol name="plus.circle.fill" color="#007AFF" size={28} />
        </Pressable>
      </View>

      {promoCodes.map((promo) => (
        <GlassView
          key={promo.id}
          style={[
            styles.listCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.listCardHeader}>
            <View style={styles.listCardInfo}>
              <Text style={[styles.listCardTitle, { color: theme.colors.text }]}>
                {promo.code}
              </Text>
              <Text style={[styles.listCardSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                {promo.type === 'percentage' ? `${promo.value}% off` : `£${promo.value} off`}
              </Text>
              <Text style={[styles.listCardSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                Used: {promo.used_count} / {promo.usage_limit || '∞'}
              </Text>
              {promo.expires_at && (
                <Text style={[styles.listCardSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
                  Expires: {new Date(promo.expires_at).toLocaleDateString()}
                </Text>
              )}
              <View style={styles.badgeContainer}>
                <View style={[styles.badge, { backgroundColor: promo.active ? '#34C759' : '#8E8E93' }]}>
                  <Text style={styles.badgeText}>{promo.active ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.listCardActions}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.7 : 1, backgroundColor: promo.active ? '#8E8E93' : '#34C759' }
              ]}
              onPress={() => handleTogglePromoCode(promo.id, promo.active)}
            >
              <Text style={styles.actionButtonText}>
                {promo.active ? 'Deactivate' : 'Activate'}
              </Text>
            </Pressable>
          </View>
        </GlassView>
      ))}
    </View>
  );

  const renderAnalytics = () => (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Platform Analytics</Text>
      <GlassView
        style={[
          styles.analyticsCard,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}
        glassEffectStyle="regular"
      >
        <View style={styles.analyticsRow}>
          <Text style={[styles.analyticsLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
            Total Users
          </Text>
          <Text style={[styles.analyticsValue, { color: theme.colors.text }]}>
            {stats.totalUsers}
          </Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={[styles.analyticsLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
            Total Admins
          </Text>
          <Text style={[styles.analyticsValue, { color: theme.colors.text }]}>
            {stats.totalAdmins}
          </Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={[styles.analyticsLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
            Total Businesses
          </Text>
          <Text style={[styles.analyticsValue, { color: theme.colors.text }]}>
            {stats.totalBusinesses}
          </Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={[styles.analyticsLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
            Total Orders
          </Text>
          <Text style={[styles.analyticsValue, { color: theme.colors.text }]}>
            {stats.totalOrders}
          </Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={[styles.analyticsLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
            Total Revenue
          </Text>
          <Text style={[styles.analyticsValue, { color: theme.colors.text }]}>
            £{stats.totalRevenue.toFixed(2)}
          </Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={[styles.analyticsLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
            Active Promo Codes
          </Text>
          <Text style={[styles.analyticsValue, { color: theme.colors.text }]}>
            {stats.activePromoCodes}
          </Text>
        </View>
      </GlassView>
    </View>
  );

  const renderDataManagement = () => (
    <View>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Data Management</Text>
      <Text style={[styles.sectionDescription, { color: theme.dark ? '#98989D' : '#666' }]}>
        Manage sample and test data in the application
      </Text>

      <GlassView
        style={[
          styles.dataCard,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}
        glassEffectStyle="regular"
      >
        <View style={styles.dataCardHeader}>
          <IconSymbol name="trash.fill" color="#FF3B30" size={32} />
          <Text style={[styles.dataCardTitle, { color: theme.colors.text }]}>
            Delete All Sample Data
          </Text>
        </View>
        <Text style={[styles.dataCardDescription, { color: theme.dark ? '#98989D' : '#666' }]}>
          This will clear all local sample data including:
        </Text>
        <View style={styles.dataList}>
          <View style={styles.dataListItem}>
            <IconSymbol name="checkmark.circle.fill" color="#007AFF" size={20} />
            <Text style={[styles.dataListText, { color: theme.colors.text }]}>
              Favorite businesses
            </Text>
          </View>
          <View style={styles.dataListItem}>
            <IconSymbol name="checkmark.circle.fill" color="#007AFF" size={20} />
            <Text style={[styles.dataListText, { color: theme.colors.text }]}>
              Shopping cart items
            </Text>
          </View>
          <View style={styles.dataListItem}>
            <IconSymbol name="checkmark.circle.fill" color="#007AFF" size={20} />
            <Text style={[styles.dataListText, { color: theme.colors.text }]}>
              Booking history
            </Text>
          </View>
          <View style={styles.dataListItem}>
            <IconSymbol name="checkmark.circle.fill" color="#007AFF" size={20} />
            <Text style={[styles.dataListText, { color: theme.colors.text }]}>
              Payment methods
            </Text>
          </View>
          <View style={styles.dataListItem}>
            <IconSymbol name="checkmark.circle.fill" color="#007AFF" size={20} />
            <Text style={[styles.dataListText, { color: theme.colors.text }]}>
              User settings
            </Text>
          </View>
        </View>
        <View style={[styles.warningBox, { backgroundColor: theme.dark ? 'rgba(255,59,48,0.2)' : 'rgba(255,59,48,0.1)' }]}>
          <IconSymbol name="exclamationmark.triangle.fill" color="#FF3B30" size={20} />
          <Text style={[styles.warningText, { color: theme.colors.text }]}>
            This action cannot be undone. Users will need to restart the app to see changes.
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={handleDeleteAllSampleData}
        >
          <IconSymbol name="trash.fill" color="#fff" size={20} />
          <Text style={styles.deleteButtonText}>Delete All Sample Data</Text>
        </Pressable>
      </GlassView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Admin Dashboard</Text>
      </View>

      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {[
          { key: 'overview', label: 'Overview', icon: 'chart.bar.fill' },
          { key: 'admins', label: 'Admins', icon: 'shield.fill' },
          { key: 'users', label: 'Users', icon: 'person.3.fill' },
          { key: 'businesses', label: 'Businesses', icon: 'building.2.fill' },
          { key: 'withdrawals', label: 'Withdrawals', icon: 'sterlingsign.circle.fill' },
          { key: 'promos', label: 'Promo Codes', icon: 'tag.fill' },
          { key: 'analytics', label: 'Analytics', icon: 'chart.line.uptrend.xyaxis' },
          { key: 'data', label: 'Data', icon: 'externaldrive.fill' },
        ].map((tab) => (
          <Pressable
            key={tab.key}
            style={({ pressed }) => [
              styles.tab,
              activeTab === tab.key && styles.activeTab,
              { opacity: pressed ? 0.7 : 1 }
            ]}
            onPress={() => setActiveTab(tab.key as TabType)}
          >
            <IconSymbol
              name={tab.icon}
              color={activeTab === tab.key ? '#007AFF' : theme.dark ? '#98989D' : '#666'}
              size={20}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab.key ? '#007AFF' : theme.dark ? '#98989D' : '#666' }
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

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
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'admins' && renderAdmins()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'businesses' && renderBusinesses()}
        {activeTab === 'withdrawals' && renderWithdrawals()}
        {activeTab === 'promos' && renderPromoCodes()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'data' && renderDataManagement()}
      </ScrollView>

      {/* Create Admin Modal */}
      <Modal
        visible={showAdminModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAdminModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassView
            style={[
              styles.modalContent,
              Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)' }
            ]}
            glassEffectStyle="regular"
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <IconSymbol name="shield.fill" color="#FF3B30" size={28} />
                <Text style={[styles.modalTitle, { color: theme.colors.text, marginLeft: 8 }]}>Create Admin User</Text>
              </View>
              <Pressable onPress={() => setShowAdminModal(false)}>
                <IconSymbol name="xmark.circle.fill" color={theme.dark ? '#98989D' : '#666'} size={28} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Full Name *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      borderColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    }
                  ]}
                  placeholder="John Doe"
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  value={newAdmin.fullName}
                  onChangeText={(text) => setNewAdmin({ ...newAdmin, fullName: text })}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Email *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      borderColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    }
                  ]}
                  placeholder="admin@example.com"
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  value={newAdmin.email}
                  onChangeText={(text) => setNewAdmin({ ...newAdmin, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Password *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      borderColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    }
                  ]}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  value={newAdmin.password}
                  onChangeText={(text) => setNewAdmin({ ...newAdmin, password: text })}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={[styles.infoBox, { backgroundColor: theme.dark ? 'rgba(0,122,255,0.2)' : 'rgba(0,122,255,0.1)' }]}>
                <IconSymbol name="info.circle.fill" color="#007AFF" size={20} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  The new admin will receive an email to verify their account before they can log in.
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.createButton,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
                onPress={handleCreateAdmin}
              >
                <Text style={styles.createButtonText}>Create Admin User</Text>
              </Pressable>
            </View>
          </GlassView>
        </View>
      </Modal>

      {/* Create Promo Code Modal */}
      <Modal
        visible={showPromoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPromoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <GlassView
            style={[
              styles.modalContent,
              Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)' }
            ]}
            glassEffectStyle="regular"
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Create Promo Code</Text>
              <Pressable onPress={() => setShowPromoModal(false)}>
                <IconSymbol name="xmark.circle.fill" color={theme.dark ? '#98989D' : '#666'} size={28} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Code *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      borderColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    }
                  ]}
                  placeholder="SUMMER2024"
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  value={newPromoCode.code}
                  onChangeText={(text) => setNewPromoCode({ ...newPromoCode, code: text })}
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Type</Text>
                <View style={styles.typeButtons}>
                  <Pressable
                    style={[
                      styles.typeButton,
                      newPromoCode.type === 'percentage' && styles.typeButtonActive,
                      { borderColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }
                    ]}
                    onPress={() => setNewPromoCode({ ...newPromoCode, type: 'percentage' })}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      { color: newPromoCode.type === 'percentage' ? '#007AFF' : theme.colors.text }
                    ]}>
                      Percentage
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.typeButton,
                      newPromoCode.type === 'fixed' && styles.typeButtonActive,
                      { borderColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }
                    ]}
                    onPress={() => setNewPromoCode({ ...newPromoCode, type: 'fixed' })}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      { color: newPromoCode.type === 'fixed' ? '#007AFF' : theme.colors.text }
                    ]}>
                      Fixed Amount
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                  Value * {newPromoCode.type === 'percentage' ? '(%)' : '(£)'}
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      borderColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    }
                  ]}
                  placeholder={newPromoCode.type === 'percentage' ? '10' : '5.00'}
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  value={newPromoCode.value}
                  onChangeText={(text) => setNewPromoCode({ ...newPromoCode, value: text })}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Usage Limit (optional)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      borderColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    }
                  ]}
                  placeholder="100"
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  value={newPromoCode.usageLimit}
                  onChangeText={(text) => setNewPromoCode({ ...newPromoCode, usageLimit: text })}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Expires At (optional)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.colors.text,
                      backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      borderColor: theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    }
                  ]}
                  placeholder="2024-12-31"
                  placeholderTextColor={theme.dark ? '#98989D' : '#999'}
                  value={newPromoCode.expiresAt}
                  onChangeText={(text) => setNewPromoCode({ ...newPromoCode, expiresAt: text })}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.createButton,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
                onPress={handleCreatePromoCode}
              >
                <Text style={styles.createButtonText}>Create Promo Code</Text>
              </Pressable>
            </View>
          </GlassView>
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
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tabBar: {
    maxHeight: 60,
  },
  tabBarContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
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
    textAlign: 'center',
  },
  alertsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  alertCard: {
    marginBottom: 12,
  },
  alertCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 14,
  },
  listCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  listCardHeader: {
    marginBottom: 12,
  },
  listCardInfo: {
    gap: 4,
  },
  listCardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  listCardSubtitle: {
    fontSize: 14,
  },
  adminHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  listCardActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    padding: 4,
  },
  analyticsCard: {
    padding: 16,
    borderRadius: 12,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  analyticsLabel: {
    fontSize: 16,
  },
  analyticsValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  dataCard: {
    padding: 20,
    borderRadius: 12,
  },
  dataCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dataCardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  dataCardDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  dataList: {
    gap: 8,
    marginBottom: 16,
  },
  dataListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dataListText: {
    fontSize: 14,
  },
  warningBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalBody: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
