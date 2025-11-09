
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserType, SubscriptionPlan } from '@/types';
import { supabase } from '@/app/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.id);
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.id);
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('Loading user profile for:', userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.log('Error loading profile:', error);
        throw error;
      }

      if (profile) {
        console.log('Profile loaded:', profile);
        const userData: User = {
          id: profile.id,
          email: profile.email || '',
          fullName: profile.full_name || '',
          userType: (profile.user_type as UserType) || 'customer',
          phone: profile.phone || undefined,
          createdAt: profile.created_at || new Date().toISOString(),
          subscriptionPlan: (profile.subscription_plan as SubscriptionPlan) || 'free',
          businessListingCount: profile.business_listing_count || 0,
        };
        setUser(userData);
      }
    } catch (error) {
      console.log('Error in loadUserProfile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (session?.user?.id) {
      await loadUserProfile(session.user.id);
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
        throw error;
      }

      console.log('Login successful:', data.user?.id);
      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error) {
      console.log('Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, fullName: string, userType: UserType) => {
    try {
      console.log('Attempting signup for:', email, userType);
      
      // Sign up the user
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
        throw authError;
      }

      console.log('Signup successful:', authData.user?.id);

      // Create profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            email: email,
            full_name: fullName,
            user_type: userType,
            subscription_plan: 'free',
            business_listing_count: 0,
            has_completed_onboarding: false,
          });

        if (profileError) {
          console.log('Profile creation error:', profileError);
          throw profileError;
        }

        await loadUserProfile(authData.user.id);
      }
    } catch (error) {
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
      if (!user || !session?.user?.id) return;
      
      console.log('Updating profile:', updates);
      
      const profileUpdates: any = {};
      if (updates.fullName !== undefined) profileUpdates.full_name = updates.fullName;
      if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
      if (updates.userType !== undefined) profileUpdates.user_type = updates.userType;
      if (updates.subscriptionPlan !== undefined) profileUpdates.subscription_plan = updates.subscriptionPlan;
      if (updates.businessListingCount !== undefined) profileUpdates.business_listing_count = updates.businessListingCount;

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('user_id', session.user.id);

      if (error) {
        console.log('Update profile error:', error);
        throw error;
      }

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    } catch (error) {
      console.log('Update profile error:', error);
      throw error;
    }
  };

  const upgradeSubscription = async (plan: SubscriptionPlan) => {
    try {
      if (!user || !session?.user?.id) return;
      
      console.log('Upgrading subscription to:', plan);
      
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_plan: plan })
        .eq('user_id', session.user.id);

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
    if (!user || user.userType !== 'business') return false;
    
    const limit = getBusinessLimit();
    const currentCount = user.businessListingCount || 0;
    
    return currentCount < limit;
  };

  const getBusinessLimit = (): number => {
    if (!user || user.userType !== 'business') return 0;
    
    const plan = user.subscriptionPlan || 'free';
    return plan === 'pro' ? 5 : 2;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
