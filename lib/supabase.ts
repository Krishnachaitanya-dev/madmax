import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Supabase configuration with provided URL and anon key
const supabaseUrl = 'https://rnsowdfcpdmwruzxwgct.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuc293ZGZjcGRtd3J1enh3Z2N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTg5MTcsImV4cCI6MjA2MjI5NDkxN30.uQySsy3iKhc7y-HMdRMXJGTnY0-j4hkVyEugMNOnpyk';

// Configure storage options with platform-specific settings
const storageOptions = {
  storage: AsyncStorage,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
};

// Add platform-specific settings
const clientOptions = Platform.select({
  android: {
    auth: {
      ...storageOptions,
      // Use proper enum value for PKCE flow
      flowType: 'pkce',
    },
  },
  ios: {
    auth: storageOptions,
  },
  web: {
    auth: storageOptions,
  },
  default: {
    auth: storageOptions,
  },
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, clientOptions);

// Log platform info for debugging
console.log(`Supabase client initialized for platform: ${Platform.OS}`);