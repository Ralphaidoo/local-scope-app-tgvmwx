
import React from 'react';
import { Platform } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();

  // Define the tabs configuration based on user type
  const getTabsForUserType = (): TabBarItem[] => {
    const baseTabs: TabBarItem[] = [
      {
        name: '(home)',
        route: '/(tabs)/(home)/',
        icon: 'house.fill',
        label: 'Home',
      },
      {
        name: 'discover',
        route: '/(tabs)/discover',
        icon: 'magnifyingglass',
        label: 'Discover',
      },
    ];

    if (user?.userType === 'business_user') {
      return [
        ...baseTabs,
        {
          name: 'dashboard',
          route: '/(tabs)/dashboard',
          icon: 'chart.bar.fill',
          label: 'Dashboard',
        },
        {
          name: 'profile',
          route: '/(tabs)/profile',
          icon: 'person.fill',
          label: 'Profile',
        },
      ];
    } else if (user?.userType === 'admin') {
      return [
        ...baseTabs,
        {
          name: 'dashboard',
          route: '/(tabs)/dashboard',
          icon: 'chart.bar.fill',
          label: 'Dashboard',
        },
        {
          name: 'admin',
          route: '/(tabs)/admin',
          icon: 'gear',
          label: 'Admin',
        },
        {
          name: 'profile',
          route: '/(tabs)/profile',
          icon: 'person.fill',
          label: 'Profile',
        },
      ];
    } else {
      return [
        ...baseTabs,
        {
          name: 'favorites',
          route: '/(tabs)/favorites',
          icon: 'heart.fill',
          label: 'Favorites',
        },
        {
          name: 'profile',
          route: '/(tabs)/profile',
          icon: 'person.fill',
          label: 'Profile',
        },
      ];
    }
  };

  const tabs = getTabsForUserType();

  // Use NativeTabs for iOS, custom FloatingTabBar for Android and Web
  if (Platform.OS === 'ios') {
    return (
      <NativeTabs>
        {tabs.map(tab => (
          <NativeTabs.Trigger key={tab.name} name={tab.name}>
            <Icon sf={tab.icon} drawable={`ic_${tab.name}`} />
            <Label>{tab.label}</Label>
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    );
  }

  // For Android and Web, use Stack navigation with custom floating tab bar
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="discover" />
        <Stack.Screen name="favorites" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
