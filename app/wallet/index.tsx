
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { router } from 'expo-router';

export default function WalletScreen() {
  const theme = useTheme();

  const wallet = {
    balance: 1234.56,
    pendingBalance: 345.67,
    totalEarnings: 5678.90,
  };

  const transactions = [
    {
      id: '1',
      type: 'earning',
      amount: 45.50,
      description: 'Order #12345',
      date: new Date().toISOString(),
      status: 'completed',
    },
    {
      id: '2',
      type: 'withdrawal',
      amount: -200.00,
      description: 'Bank Transfer',
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'pending',
    },
    {
      id: '3',
      type: 'earning',
      amount: 32.00,
      description: 'Order #12344',
      date: new Date(Date.now() - 172800000).toISOString(),
      status: 'completed',
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Wallet</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== 'ios' && styles.scrollContentWithTabBar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <GlassView
          style={[
            styles.balanceCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <View style={styles.balanceHeader}>
            <IconSymbol name="sterlingsign.circle.fill" color="#FFD700" size={48} />
            <Text style={[styles.balanceLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
              Available Balance
            </Text>
          </View>
          <Text style={[styles.balanceAmount, { color: theme.colors.text }]}>
            £{wallet.balance.toFixed(2)}
          </Text>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceDetailItem}>
              <Text style={[styles.balanceDetailLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                Pending
              </Text>
              <Text style={[styles.balanceDetailValue, { color: theme.colors.text }]}>
                £{wallet.pendingBalance.toFixed(2)}
              </Text>
            </View>
            <View style={styles.balanceDetailItem}>
              <Text style={[styles.balanceDetailLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
                Total Earned
              </Text>
              <Text style={[styles.balanceDetailValue, { color: theme.colors.text }]}>
                £{wallet.totalEarnings.toFixed(2)}
              </Text>
            </View>
          </View>
          <Pressable
            style={[styles.withdrawButton, { backgroundColor: '#007AFF' }]}
            onPress={() => router.push('/wallet/withdraw')}
          >
            <IconSymbol name="arrow.down.circle.fill" color="#fff" size={20} />
            <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
          </Pressable>
        </GlassView>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Transactions</Text>
          {transactions.map(transaction => (
            <GlassView
              key={transaction.id}
              style={[
                styles.transactionCard,
                Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
              ]}
              glassEffectStyle="regular"
            >
              <View style={[
                styles.transactionIcon,
                {
                  backgroundColor: transaction.type === 'earning'
                    ? 'rgba(52, 199, 89, 0.2)'
                    : 'rgba(255, 149, 0, 0.2)'
                }
              ]}>
                <IconSymbol
                  name={transaction.type === 'earning' ? 'arrow.down.left' : 'arrow.up.right'}
                  color={transaction.type === 'earning' ? '#34C759' : '#FF9500'}
                  size={20}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={[styles.transactionDescription, { color: theme.colors.text }]}>
                  {transaction.description}
                </Text>
                <Text style={[styles.transactionDate, { color: theme.dark ? '#98989D' : '#666' }]}>
                  {new Date(transaction.date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.transactionRight}>
                <Text style={[
                  styles.transactionAmount,
                  {
                    color: transaction.type === 'earning' ? '#34C759' : theme.colors.text
                  }
                ]}>
                  {transaction.amount > 0 ? '+' : ''}£{Math.abs(transaction.amount).toFixed(2)}
                </Text>
                {transaction.status === 'pending' && (
                  <View style={[styles.statusBadge, { backgroundColor: '#FF9500' }]}>
                    <Text style={styles.statusText}>Pending</Text>
                  </View>
                )}
              </View>
            </GlassView>
          ))}
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingTop: 8,
  },
  scrollContentWithTabBar: {
    paddingBottom: 100,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  balanceHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  balanceDetailItem: {
    alignItems: 'center',
  },
  balanceDetailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  balanceDetailValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});
