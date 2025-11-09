
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';

export default function MessagesScreen() {
  const theme = useTheme();

  // Mock messages data
  const conversations = [
    {
      id: '1',
      businessName: 'The Corner Café',
      lastMessage: 'Thank you for your order!',
      timestamp: '2h ago',
      unread: true,
    },
    {
      id: '2',
      businessName: 'Bella Hair & Beauty',
      lastMessage: 'Your appointment is confirmed for tomorrow at 2 PM',
      timestamp: '1d ago',
      unread: false,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="message" color={theme.dark ? '#98989D' : '#666'} size={64} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No Messages Yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.dark ? '#98989D' : '#666' }]}>
              Start a conversation with a business
            </Text>
          </View>
        ) : (
          conversations.map(conversation => (
            <Pressable key={conversation.id}>
              <GlassView
                style={[
                  styles.conversationCard,
                  Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                ]}
                glassEffectStyle="regular"
              >
                <View style={styles.conversationContent}>
                  <View style={styles.conversationHeader}>
                    <Text style={[styles.businessName, { color: theme.colors.text }]}>
                      {conversation.businessName}
                    </Text>
                    <Text style={[styles.timestamp, { color: theme.dark ? '#98989D' : '#666' }]}>
                      {conversation.timestamp}
                    </Text>
                  </View>
                  <View style={styles.messageRow}>
                    <Text 
                      style={[
                        styles.lastMessage, 
                        { color: conversation.unread ? theme.colors.text : theme.dark ? '#98989D' : '#666' },
                        conversation.unread && styles.unreadMessage
                      ]}
                      numberOfLines={1}
                    >
                      {conversation.lastMessage}
                    </Text>
                    {conversation.unread && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>1</Text>
                      </View>
                    )}
                  </View>
                </View>
                <IconSymbol name="chevron.right" color={theme.dark ? '#98989D' : '#666'} size={20} />
              </GlassView>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
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
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
