
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.log('Error getting initial session:', error);
        setIsLoading(false);
        return;
      }
      console.log('Initial session:', session?.user?.id);
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email || '');
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.id);
      setSession(session);
      
      if (session?.user) {
        // For email confirmation events, wait a bit for the profile to be created
        if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED') {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        await loadUserProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string, userEmail: string) => {
    try {
      console.log('Loading user profile for:', userId);
      
      // Retry logic for profile loading (in case trigger hasn't completed yet)
      let retries = 5;
      let profile = null;
      let error = null;

      while (retries > 0 && !profile) {
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        profile = result.data;
        error = result.error;

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist yet
          console.log('Profile not found, retrying...', retries);
          
          // If this is the last retry, try to create the profile manually
          if (retries === 1) {
            console.log('Creating profile manually as fallback');
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  user_id: userId,
                  email: userEmail,
                  full_name: '',
                  user_type: 'customer',
                })
                .select()
                .single();

              if (!createError && newProfile) {
                profile = newProfile;
                error = null;
                break;
              } else {
                console.log('Failed to create profile manually:', createError);
              }
            } catch (createErr) {
              console.log('Exception creating profile:', createErr);
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries--;
        } else {
          break;
        }
      }

      if (error && error.code !== 'PGRST116') {
        console.log('Error loading profile:', error);
        throw error;
      }

      if (profile) {
        console.log('Profile loaded:', profile);
        const userData: User = {
          id: profile.id,
          email: profile.email || userEmail,
          fullName: profile.full_name || '',
          userType: (profile.user_type as UserType) || 'customer',
          phone: profile.phone || undefined,
          createdAt: profile.created_at || new Date().toISOString(),
          subscriptionPlan: (profile.subscription_plan as SubscriptionPlan) || 'free',
          businessListingCount: profile.business_listing_count || 0,
        };
        setUser(userData);
      } else {
        console.log('No profile found after retries');
        // Don't set user to null if we have a session - this prevents the login loop
        // Instead, create a minimal user object
        const minimalUser: User = {
          id: userId,
          email: userEmail,
          fullName: '',
          userType: 'customer',
          createdAt: new Date().toISOString(),
          subscriptionPlan: 'free',
          businessListingCount: 0,
        };
        setUser(minimalUser);
      }
    } catch (error) {
      console.log('Error in loadUserProfile:', error);
      // Don't set user to null - create minimal user to prevent login loop
      const minimalUser: User = {
        id: userId,
        email: userEmail,
        fullName: '',
        userType: 'customer',
        createdAt: new Date().toISOString(),
        subscriptionPlan: 'free',
        businessListingCount: 0,
      };
      setUser(minimalUser);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (session?.user?.id) {
      setIsLoading(true);
      await loadUserProfile(session.user.id, session.user.email || '');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Login error:', error);
        
        // Check for specific error messages
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
      // Profile will be loaded by the auth state change listener
    } catch (error: any) {
      console.log('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, fullName: string, userType: UserType) => {
    try {
      console.log('Attempting signup for:', email, userType);
      
      // Sign up the user - the trigger will automatically create the profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed',
          data: {
            full_name: fullName,
            user_type: userType,
          }
        }
      });

      if (authError) {
        console.log('Signup error:', authError);
        Alert.alert('Signup Failed', authError.message || 'Could not create account');
        throw authError;
      }

      console.log('Signup successful:', authData.user?.id);

      // Show email verification message
      Alert.alert(
        'Verify Your Email',
        'We\'ve sent a verification link to your email address. Please check your inbox (and spam folder) and click the link to verify your account before signing in.',
        [{ text: 'OK' }]
      );

      // Don't load the profile yet since email is not verified
      // The user will need to verify their email and then sign in
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
      // Verify we have an active session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log('Session error in updateProfile:', sessionError);
        throw new Error('Failed to verify session. Please try logging in again.');
      }

      if (!currentSession) {
        console.log('No active session in updateProfile');
        throw new Error('Your session has expired. Please log in again.');
      }

      if (!user) {
        throw new Error('No user data available');
      }
      
      console.log('Updating profile for user:', currentSession.user.id, updates);
      
      const profileUpdates: any = {};
      if (updates.fullName !== undefined) profileUpdates.full_name = updates.fullName;
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
      if (updates.userType !== undefined) profileUpdates.user_type = updates.userType;
      if (updates.subscriptionPlan !== undefined) profileUpdates.subscription_plan = updates.subscriptionPlan;
      if (updates.businessListingCount !== undefined) profileUpdates.business_listing_count = updates.businessListingCount;

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('user_id', currentSession.user.id);

      if (error) {
        console.log('Update profile error:', error);
        throw error;
      }

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      console.log('Profile updated successfully');
    } catch (error: any) {
      console.log('Update profile error:', error);
      throw error;
    }
  };

  const upgradeSubscription = async (plan: SubscriptionPlan) => {
    try {
      // Verify we have an active session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !currentSession) {
        throw new Error('Session expired. Please log in again.');
      }

      if (!user) {
        throw new Error('No user data available');
      }
      
      console.log('Upgrading subscription to:', plan);
      
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_plan: plan })
        .eq('user_id', currentSession.user.id);

      if (error) {
        console.log('Upgrade subscription error:', error);
        throw error;
      }

      const updatedUser = { ...user, subscriptionPlan: plan };
      setUser(updatedUser);
    } catch (error) {
      console.log('Upgrade subscription error:', error);
      throw error;
    }
  };

  const canAddBusiness = (): boolean => {
    if (!user) return false;
    
    // Admin users can always add businesses
    if (user.userType === 'admin') return true;
    
    // Business users need to check their limit
    if (user.userType !== 'business_user') return false;
    
    const limit = getBusinessLimit();
    const currentCount = user.businessListingCount || 0;
    
    return currentCount < limit;
  };

  const getBusinessLimit = (): number => {
    if (!user) return 0;
    
    // Admin users have unlimited businesses
    if (user.userType === 'admin') return 999;
    
    // Business users have limits based on their plan
    if (user.userType !== 'business_user') return 0;
    
    const plan = user.subscriptionPlan || 'free';
    return plan === 'pro' ? 5 : 2;
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
