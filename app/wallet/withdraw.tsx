
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { IconSymbol } from '@/components/IconSymbol';
import { GlassView } from 'expo-glass-effect';
import { router } from 'expo-router';

export default function WithdrawScreen() {
  const theme = useTheme();
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  const availableBalance = 1234.56;

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    
    if (!amount || isNaN(withdrawAmount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (withdrawAmount > availableBalance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    if (!bankAccount) {
      Alert.alert('Error', 'Please enter your bank account details');
      return;
    }

    console.log('Withdrawal requested:', { amount: withdrawAmount, bankAccount });
    Alert.alert(
      'Success',
      'Your withdrawal request has been submitted. It will be processed within 2-3 business days.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <IconSymbol name="xmark" color={theme.colors.text} size={24} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Withdraw Funds</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GlassView
          style={[
            styles.balanceCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Text style={[styles.balanceLabel, { color: theme.dark ? '#98989D' : '#666' }]}>
            Available Balance
          </Text>
          <Text style={[styles.balanceAmount, { color: theme.colors.text }]}>
            £{availableBalance.toFixed(2)}
          </Text>
        </GlassView>

        <GlassView
          style={[
            styles.formCard,
            Platform.OS !== 'ios' && { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
          ]}
          glassEffectStyle="regular"
        >
          <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
            Withdrawal Amount (£)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.colors.text,
              }
            ]}
            placeholder="0.00"
            placeholderTextColor={theme.dark ? '#666' : '#98989D'}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <View style={styles.quickAmounts}>
            {[50, 100, 200, 500].map(quickAmount => (
              <Pressable
                key={quickAmount}
                style={[
                  styles.quickAmountButton,
                  {
                    backgroundColor: amount === quickAmount.toString()
                      ? '#007AFF'
                      : theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }
                ]}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={[
                  styles.quickAmountText,
                  { color: amount === quickAmount.toString() ? '#fff' : theme.colors.text }
                ]}>
                  £{quickAmount}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: theme.dark ? '#98989D' : '#666' }]}>
            Bank Account Number
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: theme.colors.text,
              }
            ]}
            placeholder="12345678"
            placeholderTextColor={theme.dark ? '#666' : '#98989D'}
            value={bankAccount}
            onChangeText={setBankAccount}
            keyboardType="number-pad"
          />

          <View style={[styles.infoBox, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
            <IconSymbol name="info.circle" color="#007AFF" size={20} />
            <Text style={[styles.infoText, { color: '#007AFF' }]}>
              Withdrawals are processed within 2-3 business days
            </Text>
          </View>
        </GlassView>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <Pressable
          style={[styles.button, { backgroundColor: '#007AFF' }]}
          onPress={handleWithdraw}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Request Withdrawal</Text>
        </Pressable>
      </View>
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
    paddingBottom: 100,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  formCard: {
    padding: 20,
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  quickAmountButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
