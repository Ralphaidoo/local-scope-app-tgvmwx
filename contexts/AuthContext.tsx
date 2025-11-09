import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserType, SubscriptionPlan } from '@/types';
import { supabase } from '@/app/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Alert } from 'react-native';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, userType: UserType) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  upgradeSubscription: (plan: SubscriptionPlan) => Promise<void>;
  canAddBusiness: () => boolean;
  getBusinessLimit: () => number;
  refreshUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Updated loadProfile with full console tracing
  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, email, full_name, user_type, subscription_plan')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('Profile from Supabase →', data);
    console.log('User ID used for profile fetch →', userId);

    if (error) {
      console.error('Profile fetch error:', error);
      return;
    }

    if (data) {
      console.log('Setting user with normalized userType:', data.user_type);

      setUser({
        id: data.id,
        email: data.email || '',
        fullName: data.full_name || '',
        userType: data.user_type, // normalized key for client checks
        createdAt: new Date().toISOString(),
        subscriptionPlan: (data.subscription_plan as SubscriptionPlan) || 'free',
        businessListingCount: 0,
      });

      console.log('User successfully set in state');
    } else {
      console.warn('No profile found for this userId');
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.log('Error getting initial session:', error);
        setIsLoading(false);
        return;
      }
      console.log('Initial session:', session?.user?.id);
      setSession(session);
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.id);
      setSession(session);
      
      if (session?.user) {
        if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED') {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        await loadProfile(session.user.id);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshUser = async () => {
    if (session?.user?.id) {
      console.log('=== REFRESH USER CALLED ===');
      console.log('Current user before refresh:', JSON.stringify(user, null, 2));
      setIsLoading(true);
      await loadProfile(session.user.id);
      setIsLoading(false);
      console.log('=== REFRESH USER COMPLETED ===');
    }
  };

  const refreshProfile = async () => {
    if (!session?.user?.id) {
      console.log('No session available for refreshProfile');
      return;
    }
    console.log('=== REFRESH PROFILE CALLED ===');
    await loadProfile(session.user.id);
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.log('Login error:', error);
        if (error.message.includes('Email not confirmed')) {
          Alert.alert(
            'Email Not Verified',
            'Please check your email and click the verification link before signing in. Check your spam folder if you don\'t see it.',
            [{ text: 'OK' }]
          );
        } else if (error.message.includes('Invalid login credentials')) {
          Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
        } else {
          Alert.alert('Login Failed', error.message || 'An error occurred during login.');
        }
        throw error;
      }

      console.log('Login successful:', data.user?.id);
      if (data.session?.user?.id) await loadProfile(data.session.user.id);
    } catch (error: any) {
      console.log('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, fullName: string, userType: UserType) => {
    try {
      console.log('Attempting signup for:', email, userType);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: { full_name: fullName, user_type: userType }
        }
      });

      if (authError) {
        console.log('Signup error:', authError);
        Alert.alert('Signup Failed', authError.message || 'Could not create account');
        throw authError;
      }

      console.log('Signup successful:', authData.user?.id);
      if (authData.session?.user?.id) await loadProfile(authData.session.user.id);

      Alert.alert(
        'Verify Your Email',
        'We\'ve sent a verification link to your email. Please check your inbox or spam folder.',
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.log('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
    } catch (error) {
      console.log('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !currentSession) throw new Error('Session expired. Please log in again.');
      if (!user) throw new Error('No user data available');

      console.log('Updating profile for:', currentSession.user.id, updates);
      const profileUpdates: any = {};
      if (updates.fullName !== undefined) profileUpdates.full_name = updates.fullName;
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
      if (updates.userType !== undefined) {
        profileUpdates.user_type = updates.userType;
        profileUpdates.role = updates.userType;
      }
      if (updates.subscriptionPlan !== undefined)
        profileUpdates.subscription_plan = updates.subscriptionPlan;
      if (updates.businessListingCount !== undefined)
        profileUpdates.business_listing_count = updates.businessListingCount;

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('user_id', currentSession.user.id);
      if (error) throw error;

      setUser({ ...user, ...updates });
      console.log('Profile updated successfully');
    } catch (error: any) {
      console.log('Update profile error:', error);
      throw error;
    }
  };

  const upgradeSubscription = async (plan: SubscriptionPlan) => {
    try {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !currentSession) throw new Error('Session expired. Please log in again.');
      if (!user) throw new Error('No user data available');

      console.log('Upgrading subscription to:', plan);
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_plan: plan })
        .eq('user_id', currentSession.user.id);
      if (error) throw error;

      setUser({ ...user, subscriptionPlan: plan });
    } catch (error) {
      console.log('Upgrade subscription error:', error);
      throw error;
    }
  };

  const canAddBusiness = (): boolean => {
    if (!user) return false;
    if (user.userType === 'admin') return true;
    if (user.userType !== 'business_user') return false;
    const limit = getBusinessLimit();
    const currentCount = user.businessListingCount || 0;
    return currentCount < limit;
  };

  const getBusinessLimit = (): number => {
    if (!user) return 0;
    if (user.userType === 'admin') return 999;
    if (user.userType !== 'business_user') return 0;
    return user.subscriptionPlan === 'pro' ? 5 : 2;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user && !!session,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        upgradeSubscription,
        canAddBusiness,
        getBusinessLimit,
        refreshUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
