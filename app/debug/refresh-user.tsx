
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { supabase } from '@/app/integrations/supabase/client';

export default function RefreshUserScreen() {
  const theme = useTheme();
  const { user, refreshUser, refreshProfile, isLoading, session } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [dbData, setDbData] = useState<any>(null);
  const [loadingDb, setLoadingDb] = useState(false);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  const handleLoadFromDb = async () => {
    if (!session?.user?.id) {
      console.log('No session available');
      return;
    }

    setLoadingDb(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      console.log('Direct DB query result:', { data, error });
      setDbData(data);
    } catch (err) {
      console.error('Error loading from DB:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  const handleNavigateToAdmin = () => {
    router.push('/(tabs)/admin');
  };

  const handleNavigateToDashboard = () => {
    router.push('/(tabs)/dashboard');
  };

  const handleNavigateToHome = () => {
    router.push('/(tabs)/(home)/');
  };

  useEffect(() => {
    handleLoadFromDb();
  }, [session]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text }]}>User Debug Panel</Text>

        <View style={[styles.infoBox, { borderColor: theme.dark ? '#333' : '#ddd' }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Current User State</Text>
          {user ? (
            <>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email:</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{user.email}</Text>

              <Text style={[styles.label, { color: theme.colors.text }]}>Full Name:</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{user.fullName}</Text>

              <Text style={[styles.label, { color: theme.colors.text }]}>User Type:</Text>
              <Text style={[styles.value, { color: theme.colors.text, fontWeight: 'bold' }]}>
                {user.userType}
              </Text>

              <Text style={[styles.label, { color: theme.colors.text }]}>Subscription Plan:</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{user.subscriptionPlan}</Text>

              <Text style={[styles.label, { color: theme.colors.text }]}>User ID:</Text>
              <Text style={[styles.value, { color: theme.colors.text, fontSize: 12 }]}>{user.id}</Text>
            </>
          ) : (
            <Text style={[styles.value, { color: theme.colors.text }]}>No user loaded</Text>
          )}
        </View>

        <View style={[styles.infoBox, { borderColor: theme.dark ? '#333' : '#ddd' }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Database Data</Text>
          {loadingDb ? (
            <ActivityIndicator color="#007AFF" />
          ) : dbData ? (
            <>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email:</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{dbData.email}</Text>

              <Text style={[styles.label, { color: theme.colors.text }]}>Full Name:</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{dbData.full_name}</Text>

              <Text style={[styles.label, { color: theme.colors.text }]}>User Type (DB):</Text>
              <Text style={[styles.value, { color: theme.colors.text, fontWeight: 'bold' }]}>
                {dbData.user_type}
              </Text>

              <Text style={[styles.label, { color: theme.colors.text }]}>Role (DB):</Text>
              <Text style={[styles.value, { color: theme.colors.text, fontWeight: 'bold' }]}>
                {dbData.role}
              </Text>

              <Text style={[styles.label, { color: theme.colors.text }]}>Subscription Plan:</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{dbData.subscription_plan}</Text>
            </>
          ) : (
            <Text style={[styles.value, { color: theme.colors.text }]}>No database data loaded</Text>
          )}
        </View>

        <View style={[styles.infoBox, { borderColor: theme.dark ? '#333' : '#ddd' }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Session Info</Text>
          <Text style={[styles.label, { color: theme.colors.text }]}>Has Session:</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{session ? 'Yes' : 'No'}</Text>

          {session && (
            <>
              <Text style={[styles.label, { color: theme.colors.text }]}>Session User ID:</Text>
              <Text style={[styles.value, { color: theme.colors.text, fontSize: 12 }]}>
                {session.user.id}
              </Text>
            </>
          )}
        </View>

        <Pressable
          onPress={handleManualRefresh}
          style={({ pressed }) => [
            styles.refreshButton,
            { opacity: pressed || refreshing || isLoading ? 0.7 : 1 },
          ]}
          disabled={refreshing || isLoading}
        >
          {refreshing || isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.refreshButtonText}>Refresh User</Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleLoadFromDb}
          style={({ pressed }) => [
            styles.dbButton,
            { opacity: pressed || loadingDb ? 0.7 : 1 },
          ]}
          disabled={loadingDb}
        >
          {loadingDb ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.refreshButtonText}>Reload from Database</Text>
          )}
        </Pressable>

        <View style={styles.navigationSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Navigation</Text>
          
          <Pressable
            onPress={handleNavigateToAdmin}
            style={({ pressed }) => [
              styles.navButton,
              { opacity: pressed ? 0.7 : 1, backgroundColor: '#FF3B30' },
            ]}
          >
            <Text style={styles.navButtonText}>Go to Admin Dashboard</Text>
          </Pressable>

          <Pressable
            onPress={handleNavigateToDashboard}
            style={({ pressed }) => [
              styles.navButton,
              { opacity: pressed ? 0.7 : 1, backgroundColor: '#34C759' },
            ]}
          >
            <Text style={styles.navButtonText}>Go to Business Dashboard</Text>
          </Pressable>

          <Pressable
            onPress={handleNavigateToHome}
            style={({ pressed }) => [
              styles.navButton,
              { opacity: pressed ? 0.7 : 1, backgroundColor: '#007AFF' },
            ]}
          >
            <Text style={styles.navButtonText}>Go to Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoBox: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    marginBottom: 8,
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  dbButton: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 24,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationSection: {
    marginTop: 16,
  },
  navButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
