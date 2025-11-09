
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@react-navigation/native';

export default function RefreshUserScreen() {
  const theme = useTheme();
  const { user, refreshUser, isLoading } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.colors.text }]}>User Debug Panel</Text>

        <View style={styles.infoBox}>
          {user ? (
            <>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email:</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{user.email}</Text>

              <Text style={[styles.label, { color: theme.colors.text }]}>Full Name:</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{user.fullName}</Text>

              <Text style={[styles.label, { color: theme.colors.text }]}>User Type:</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{user.userType}</Text>

              <Text style={[styles.label, { color: theme.colors.text }]}>Subscription Plan:</Text>
              <Text style={[styles.value, { color: theme.colors.text }]}>{user.subscriptionPlan}</Text>
            </>
          ) : (
            <Text style={[styles.value, { color: theme.colors.text }]}>No user loaded</Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoBox: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    marginBottom: 24,
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
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
