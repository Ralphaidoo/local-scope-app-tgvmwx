
import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.notLoggedIn}>
          <IconSymbol name="person.circle" color={theme.dark ? '#98989D' : '#666'} size={64} />
          <Text style={[styles.notLoggedInTitle, { color: theme.colors.text }]}>
            Not Logged In
          </Text>
          <Text style={[styles.notLoggedInText, { color: theme.dark ? '#98989D' : '#666' }]}>
            Sign in to access your profile
          </Text>
          <Pressable
            style={styles.loginButton}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    { icon: 'person', label: 'Edit Profile', route: '/profile/edit' },
    { icon: 'heart', label: 'Favorites', route: '/(tabs)/favorites' },
    { icon: 'bag', label: 'Orders', route: '/orders' },
    { icon: 'calendar', label: 'Bookings', route: '/bookings' },
    { icon: 'creditcard', label: 'Payment Methods', route: '/payment-methods' },
    { icon: 'bell', label: 'Notifications', route: '/notifications' },
    { icon: 'gear', label: 'Settings', route: '/settings' },
    { icon: 'questionmark.circle', label: 'Help & Support', route: '/support' },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          Platform.OS !== 'ios' && styles.contentContainerWithTabBar
        ]}
      >
        <GlassView style={[
          styles.profileHeader,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          <IconSymbol name="person.circle.fill" size={80} color={theme.colors.primary} />
          <Text style={[styles.name, { color: theme.colors.text }]}>{user.fullName}</Text>
          <Text style={[styles.email, { color: theme.dark ? '#98989D' : '#666' }]}>{user.email}</Text>
          <View style={[styles.userTypeBadge, { backgroundColor: user.userType === 'business' ? '#34C759' : '#007AFF' }]}>
            <Text style={styles.userTypeText}>
              {user.userType === 'business' ? 'Business Owner' : user.userType === 'admin' ? 'Admin' : 'Customer'}
            </Text>
          </View>
        </GlassView>

        <GlassView style={[
          styles.menuSection,
          Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]} glassEffectStyle="regular">
          {menuItems.map((item, index) => (
            <Pressable
              key={item.label}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
                { borderBottomColor: theme.dark ? '#333' : '#ddd' }
              ]}
              onPress={() => {
                if (item.route) {
                  router.push(item.route as any);
                }
              }}
            >
              <View style={styles.menuItemLeft}>
                <IconSymbol name={item.icon} size={22} color={theme.colors.text} />
                <Text style={[styles.menuItemText, { color: theme.colors.text }]}>{item.label}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={theme.dark ? '#98989D' : '#666'} />
            </Pressable>
          ))}
        </GlassView>

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <IconSymbol name="arrow.right.square" size={20} color="#FF3B30" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>

        <Text style={[styles.version, { color: theme.dark ? '#666' : '#999' }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  contentContainerWithTabBar: {
    paddingBottom: 100,
  },
  notLoggedIn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  notLoggedInText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    borderRadius: 12,
    padding: 32,
    marginBottom: 16,
    gap: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
  },
  userTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  userTypeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  menuSection: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
    marginBottom: 16,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
