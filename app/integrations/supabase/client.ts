
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://ycbssfdiqpouxfjstcqp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljYnNzZmRpcXBvdXhmanN0Y3FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NjcxNjQsImV4cCI6MjA3NDE0MzE2NH0.owVwANjF0XfO83jQAu8FPo3uslkr4S6kar2sHLIK5qI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
