
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminScreen() {
  const theme = useTheme();
  const { user } = useAuth();

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

  const stats = [
    { label: 'Total Users', value: '1,234', icon: 'person.3.fill', color: '#007AFF' },
    { label: 'Businesses', value: '456', icon: 'building.2.fill', color: '#34C759' },
    { label: 'Orders', value: '789', icon: 'bag.fill', color: '#FF9500' },
    { label: 'Revenue', value: '£45.6K', icon: 'sterlingsign.circle.fill', color: '#FFD700' },
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Admin Panel</Text>
          <Text style={[styles.headerSubtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
            Platform Overview
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Management</Text>
          <GlassView
            style={[
              styles.infoCard,
              Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}
            glassEffectStyle="regular"
          >
            <Text style={[styles.infoText, { color: theme.dark ? '#98989D' : '#666' }]}>
              Admin features coming soon...
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
  infoCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
  },
});
