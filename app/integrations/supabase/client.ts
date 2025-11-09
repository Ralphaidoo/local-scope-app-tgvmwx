
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

const SUPABASE_URL = "https://vkdbdhiygizgdevnszuy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZGJkaGl5Z2l6Z2Rldm5zenV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTgyMDQsImV4cCI6MjA3ODI3NDIwNH0.fEgnbLSvK2k096X8SR887Be5diuDCeldofHMc2LNn38";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Handle deep links for email verification
Linking.addEventListener('url', ({ url }) => {
  console.log('Deep link received:', url);
  
  // Check if this is an auth callback
  if (url.includes('/email-confirmed')) {
    // Extract the token from the URL
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token');
    const type = urlObj.searchParams.get('type');
    
    console.log('Auth callback detected:', { token: token ? 'present' : 'missing', type });
    
    // The session will be automatically handled by Supabase
    // We just need to ensure the app navigates to the right screen
  }
});
