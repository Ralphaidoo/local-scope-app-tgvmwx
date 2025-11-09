
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

const SUPABASE_URL = "https://ycbssfdiqpouxfjstcqp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljYnNzZmRpcXBvdXhmanN0Y3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NjcxNjQsImV4cCI6MjA3NDE0MzE2NH0.owVwANjF0XfO83jQAu8FPo3uslkr4S6kar2sHLIK5qI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Handle deep links for email confirmation
Linking.addEventListener('url', async ({ url }) => {
  console.log('Deep link received:', url);
  
  // Check if this is an auth callback
  if (url.includes('#access_token=') || url.includes('?access_token=')) {
    try {
      // Extract the URL fragment/query
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.hash.substring(1) || urlObj.search);
      
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      
      console.log('Auth callback type:', type);
      
      if (accessToken && refreshToken) {
        // Set the session with the tokens from the URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) {
          console.error('Error setting session:', error);
        } else {
          console.log('Session set successfully:', data.user?.id);
        }
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  }
});
