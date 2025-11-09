
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Notification {
  id: string;
  type: 'order' | 'booking' | 'message' | 'promotion' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionRoute?: string;
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      } else {
        // Mock notifications for demo
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'order',
            title: 'Order Confirmed',
            message: 'Your order #12345 has been confirmed and is being prepared.',
            read: false,
            createdAt: new Date().toISOString(),
            actionRoute: '/orders/12345',
          },
          {
            id: '2',
            type: 'booking',
            title: 'Booking Reminder',
            message: 'Your appointment at Bella Hair & Beauty is tomorrow at 2:00 PM.',
            read: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            actionRoute: '/bookings',
          },
          {
            id: '3',
            type: 'message',
            title: 'New Message',
            message: 'The Corner Café sent you a message.',
            read: true,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            actionRoute: '/messages',
          },
          {
            id: '4',
            type: 'promotion',
            title: 'Special Offer',
            message: 'Get 20% off your next order at Green Thumb Garden Centre!',
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '5',
            type: 'system',
            title: 'Welcome to Local Scope',
            message: 'Thank you for joining our community of local businesses and customers.',
            read: true,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ];
        setNotifications(mockNotifications);
        await AsyncStorage.setItem('notifications', JSON.stringify(mockNotifications));
      }
    } catch (error) {
      console.log('Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const updatedNotifications = notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.log('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.log('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.log('Error deleting notification:', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionRoute) {
      router.push(notification.actionRoute as any);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return 'bag.fill';
      case 'booking':
        return 'calendar';
      case 'message':
        return 'message.fill';
      case 'promotion':
        return 'tag.fill';
      case 'system':
        return 'info.circle.fill';
      default:
        return 'bell.fill';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return '#007AFF';
      case 'booking':
        return '#34C759';
      case 'message':
        return '#FF9500';
      case 'promotion':
        return '#FF3B30';
      case 'system':
        return '#5856D6';
      default:
        return '#007AFF';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="chevron.left" color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <Pressable onPress={markAllAsRead}>
            <Text style={[styles.markAllRead, { color: '#007AFF' }]}>Mark all read</Text>
          </Pressable>
        )}
        {unreadCount === 0 && <View style={{ width: 24 }} />}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="bell.slash" color={theme.dark ? '#98989D' : '#666'} size={64} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No Notifications
          </Text>
          <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
            You&apos;re all caught up! Check back later for updates.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {notifications.map((notification) => (
            <Pressable
              key={notification.id}
              onPress={() => handleNotificationPress(notification)}
            >
              <GlassView
                style={[
                  styles.notificationCard,
                  !notification.read && styles.unreadCard,
                  Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}
                glassEffectStyle="regular"
              >
                <View style={styles.notificationContent}>
                  <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(notification.type) + '20' }]}>
                    <IconSymbol
                      name={getNotificationIcon(notification.type)}
                      color={getNotificationColor(notification.type)}
                      size={24}
                    />
                  </View>
                  <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.title, { color: theme.colors.text }]}>
                        {notification.title}
                      </Text>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={[styles.message, { color: theme.dark ? '#98989D' : '#666' }]} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={[styles.time, { color: theme.dark ? '#666' : '#999' }]}>
                      {formatTime(notification.createdAt)}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => deleteNotification(notification.id)}
                  >
                    <IconSymbol name="xmark.circle.fill" color={theme.dark ? '#666' : '#999'} size={20} />
                  </Pressable>
                </View>
              </GlassView>
            </Pressable>
          ))}
        </ScrollView>
      )}
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
  markAllRead: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  notificationCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
});
