
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
  const [refreshCounter, setRefreshCounter] = useState(0);

  const loadProfile = async (userId: string) => {
    console.log('=== LOAD PROFILE START ===');
    console.log('Loading profile for user_id:', userId);
    
    try {
      // Removed 'role' from the select query to avoid issues
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, email, full_name, user_type, subscription_plan, business_listing_count, phone, created_at')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('Profile query result:', { data, error });

      if (error) {
        console.error('Profile fetch error:', error);
        Alert.alert('Profile Error', 'Failed to load your profile. Please try logging in again.');
        return;
      }

      if (data) {
        console.log('Profile data found:', data);
        console.log('User type from DB:', data.user_type);

        const userProfile: User = {
          id: data.id,
          email: data.email || '',
          fullName: data.full_name || '',
          userType: data.user_type as UserType,
          phone: data.phone,
          createdAt: data.created_at || new Date().toISOString(),
          subscriptionPlan: (data.subscription_plan as SubscriptionPlan) || 'free',
          businessListingCount: data.business_listing_count || 0,
        };

        console.log('Setting user profile with userType:', userProfile.userType);
        setUser(userProfile);
        setRefreshCounter(prev => prev + 1);
        console.log('User state updated successfully');
      } else {
        console.warn('No profile found for user_id:', userId);
        setUser(null);
      }
    } catch (err) {
      console.error('Exception in loadProfile:', err);
      Alert.alert('Error', 'An unexpected error occurred while loading your profile.');
    }
    
    console.log('=== LOAD PROFILE END ===');
  };

  useEffect(() => {
    console.log('=== AUTH CONTEXT INIT ===');
    
    const initAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setIsLoading(false);
          return;
        }

        console.log('Initial session:', currentSession?.user?.id);
        setSession(currentSession);
        
        if (currentSession?.user) {
          await loadProfile(currentSession.user.id);
        }
      } catch (err) {
        console.error('Exception in initAuth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('=== AUTH STATE CHANGE ===');
      console.log('Event:', event);
      console.log('Session user_id:', currentSession?.user?.id);
      
      setSession(currentSession);
      
      if (currentSession?.user) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        await loadProfile(currentSession.user.id);
      } else {
        console.log('No session, clearing user');
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      console.log('Unsubscribing from auth state changes');
      subscription.unsubscribe();
    };
  }, []);

  const refreshUser = async () => {
    console.log('=== REFRESH USER CALLED ===');
    console.log('Current session:', session?.user?.id);
    console.log('Current user before refresh:', user);
    
    if (session?.user?.id) {
      setIsLoading(true);
      await loadProfile(session.user.id);
      setIsLoading(false);
      console.log('User after refresh:', user);
    } else {
      console.warn('No session available for refreshUser');
    }
    
    console.log('=== REFRESH USER COMPLETED ===');
  };

  const refreshProfile = async () => {
    console.log('=== REFRESH PROFILE CALLED ===');
    
    if (!session?.user?.id) {
      console.warn('No session available for refreshProfile');
      return;
    }
    
    await loadProfile(session.user.id);
    console.log('=== REFRESH PROFILE COMPLETED ===');
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('=== LOGIN START ===');
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('Login error:', error);
        
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

      console.log('Login successful, user_id:', data.user?.id);
      
      if (data.session?.user?.id) {
        // Wait a bit to ensure the profile is created/updated
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadProfile(data.session.user.id);
      }
      
      console.log('=== LOGIN END ===');
    } catch (error: any) {
      console.error('Login exception:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, fullName: string, userType: UserType) => {
    try {
      console.log('=== SIGNUP START ===');
      console.log('Attempting signup for:', email, 'as', userType);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: { 
            full_name: fullName, 
            user_type: userType 
          }
        }
      });

      if (authError) {
        console.error('Signup error:', authError);
        Alert.alert('Signup Failed', authError.message || 'Could not create account');
        throw authError;
      }

      console.log('Signup successful, user_id:', authData.user?.id);
      
      if (authData.session?.user?.id) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadProfile(authData.session.user.id);
      }

      Alert.alert(
        'Verify Your Email',
        'We\'ve sent a verification link to your email. Please check your inbox or spam folder and verify your email before signing in.',
        [{ text: 'OK' }]
      );
      
      console.log('=== SIGNUP END ===');
    } catch (error: any) {
      console.error('Signup exception:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('=== LOGOUT START ===');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      console.log('=== LOGOUT END ===');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      console.log('=== UPDATE PROFILE START ===');
      console.log('Updates:', updates);
      
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !currentSession) {
        throw new Error('Session expired. Please log in again.');
      }
      
      if (!user) {
        throw new Error('No user data available');
      }

      const profileUpdates: any = {};
      
      if (updates.fullName !== undefined) profileUpdates.full_name = updates.fullName;
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
      if (updates.userType !== undefined) {
        profileUpdates.user_type = updates.userType;
        // Keep role in sync with user_type for backward compatibility
        profileUpdates.role = updates.userType;
      }
      if (updates.subscriptionPlan !== undefined) {
        profileUpdates.subscription_plan = updates.subscriptionPlan;
      }
      if (updates.businessListingCount !== undefined) {
        profileUpdates.business_listing_count = updates.businessListingCount;
      }

      console.log('Updating profile with:', profileUpdates);

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('user_id', currentSession.user.id);
        
      if (error) throw error;

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      setRefreshCounter(prev => prev + 1);
      
      console.log('Profile updated successfully');
      console.log('=== UPDATE PROFILE END ===');
    } catch (error: any) {
      console.error('Update profile error:', error);
      Alert.alert('Update Failed', error.message || 'Could not update profile');
      throw error;
    }
  };

  const upgradeSubscription = async (plan: SubscriptionPlan) => {
    try {
      console.log('=== UPGRADE SUBSCRIPTION START ===');
      console.log('Upgrading to:', plan);
      
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !currentSession) {
        throw new Error('Session expired. Please log in again.');
      }
      
      if (!user) {
        throw new Error('No user data available');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ subscription_plan: plan })
        .eq('user_id', currentSession.user.id);
        
      if (error) throw error;

      setUser({ ...user, subscriptionPlan: plan });
      setRefreshCounter(prev => prev + 1);
      
      console.log('Subscription upgraded successfully');
      console.log('=== UPGRADE SUBSCRIPTION END ===');
    } catch (error: any) {
      console.error('Upgrade subscription error:', error);
      Alert.alert('Upgrade Failed', error.message || 'Could not upgrade subscription');
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

  const contextValue = {
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
  };

  console.log('Auth Context Render - User:', user?.email, 'Type:', user?.userType, 'Counter:', refreshCounter);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
