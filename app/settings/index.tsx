
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  darkMode: boolean;
  locationServices: boolean;
  biometricAuth: boolean;
}

export default function SettingsScreen() {
  const theme = useTheme();
  const [settings, setSettings] = useState<SettingsState>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
    darkMode: theme.dark,
    locationServices: true,
    biometricAuth: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: SettingsState) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.log('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const toggleSetting = (key: keyof SettingsState) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the app cache? This will remove temporary files and may improve performance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            // Clear cache logic here
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Please contact support to delete your account.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Section */}
        <Text style={[styles.sectionHeader, { color: theme.dark ? '#98989D' : '#666' }]}>
          NOTIFICATIONS
        </Text>
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <IconSymbol name="bell.fill" color={theme.colors.text} size={20} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Push Notifications
              </Text>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={() => toggleSetting('pushNotifications')}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: theme.dark ? '#333' : '#ddd' }]}>
            <View style={styles.settingLeft}>
              <IconSymbol name="envelope.fill" color={theme.colors.text} size={20} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Email Notifications
              </Text>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => toggleSetting('emailNotifications')}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: theme.dark ? '#333' : '#ddd' }]}>
            <View style={styles.settingLeft}>
              <IconSymbol name="message.fill" color={theme.colors.text} size={20} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                SMS Notifications
              </Text>
            </View>
            <Switch
              value={settings.smsNotifications}
              onValueChange={() => toggleSetting('smsNotifications')}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: theme.dark ? '#333' : '#ddd' }]}>
            <View style={styles.settingLeft}>
              <IconSymbol name="bag.fill" color={theme.colors.text} size={20} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Order Updates
              </Text>
            </View>
            <Switch
              value={settings.orderUpdates}
              onValueChange={() => toggleSetting('orderUpdates')}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: theme.dark ? '#333' : '#ddd' }]}>
            <View style={styles.settingLeft}>
              <IconSymbol name="tag.fill" color={theme.colors.text} size={20} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Promotions & Offers
              </Text>
            </View>
            <Switch
              value={settings.promotions}
              onValueChange={() => toggleSetting('promotions')}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </GlassView>

        {/* Appearance Section */}
        <Text style={[styles.sectionHeader, { color: theme.dark ? '#98989D' : '#666' }]}>
          APPEARANCE
        </Text>
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <IconSymbol name="moon.fill" color={theme.colors.text} size={20} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={() => toggleSetting('darkMode')}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </GlassView>

        {/* Privacy & Security Section */}
        <Text style={[styles.sectionHeader, { color: theme.dark ? '#98989D' : '#666' }]}>
          PRIVACY & SECURITY
        </Text>
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <IconSymbol name="location.fill" color={theme.colors.text} size={20} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Location Services
              </Text>
            </View>
            <Switch
              value={settings.locationServices}
              onValueChange={() => toggleSetting('locationServices')}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: theme.dark ? '#333' : '#ddd' }]}>
            <View style={styles.settingLeft}>
              <IconSymbol name="faceid" color={theme.colors.text} size={20} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Biometric Authentication
              </Text>
            </View>
            <Switch
              value={settings.biometricAuth}
              onValueChange={() => toggleSetting('biometricAuth')}
              trackColor={{ false: '#767577', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </GlassView>

        {/* Other Section */}
        <Text style={[styles.sectionHeader, { color: theme.dark ? '#98989D' : '#666' }]}>
          OTHER
        </Text>
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Pressable
            style={styles.settingRow}
            onPress={() => router.push('/settings/language' as any)}
          >
            <View style={styles.settingLeft}>
              <IconSymbol name="globe" color={theme.colors.text} size={20} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Language
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: theme.dark ? '#98989D' : '#666' }]}>
                English
              </Text>
              <IconSymbol name="chevron.right" color={theme.dark ? '#98989D' : '#666'} size={18} />
            </View>
          </Pressable>

          <Pressable
            style={[styles.settingRow, styles.settingRowBorder, { borderTopColor: theme.dark ? '#333' : '#ddd' }]}
            onPress={handleClearCache}
          >
            <View style={styles.settingLeft}>
              <IconSymbol name="trash" color={theme.colors.text} size={20} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                Clear Cache
              </Text>
            </View>
            <IconSymbol name="chevron.right" color={theme.dark ? '#98989D' : '#666'} size={18} />
          </Pressable>
        </GlassView>

        {/* Danger Zone */}
        <Text style={[styles.sectionHeader, { color: '#FF3B30' }]}>
          DANGER ZONE
        </Text>
        <GlassView
          style={[
            styles.card,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Pressable
            style={styles.settingRow}
            onPress={handleDeleteAccount}
          >
            <View style={styles.settingLeft}>
              <IconSymbol name="xmark.circle.fill" color="#FF3B30" size={20} />
              <Text style={[styles.settingLabel, { color: '#FF3B30' }]}>
                Delete Account
              </Text>
            </View>
            <IconSymbol name="chevron.right" color={theme.dark ? '#98989D' : '#666'} size={18} />
          </Pressable>
        </GlassView>

        <Text style={[styles.footer, { color: theme.dark ? '#666' : '#999' }]}>
          Local Scope v1.0.0
        </Text>
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
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingRowBorder: {
    borderTopWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 16,
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
