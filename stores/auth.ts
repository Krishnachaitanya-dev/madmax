import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import { router } from 'expo-router';

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      profile: null,
      loading: false,
      
      setSession: (session) => {
        set({ session });
        if (session) {
          get().loadProfile();
        }
      },
      
      setProfile: (profile) => {
        set({ profile });
      },
      
      signOut: async () => {
        try {
          console.log("Starting sign out process...");
          set({ loading: true });
          
          // Call Supabase signOut first
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error("Error signing out from Supabase:", error.message);
            throw error;
          }
          
          console.log("Supabase sign out successful, clearing local state");
          
          // Then clear local state
          set({ session: null, profile: null, loading: false });
          
          // Force clear AsyncStorage auth data to ensure complete sign out
          await AsyncStorage.removeItem('auth-storage');
          console.log("AsyncStorage auth data cleared");
          
          // Navigate to login screen
          router.replace("/(auth)/login");
          
          return Promise.resolve();
        } catch (error) {
          console.error("Error during sign out:", error);
          // Still clear local state even if Supabase call fails
          set({ session: null, profile: null, loading: false });
          await AsyncStorage.removeItem('auth-storage');
          
          // Navigate to login screen even if there was an error
          router.replace("/(auth)/login");
          
          return Promise.reject(error);
        }
      },
      
      loadProfile: async () => {
        const { session } = get();
        if (!session?.user) return;
        
        set({ loading: true });
        
        try {
          console.log("Loading profile for user:", session.user.id);
          
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error('Error loading profile:', error.message);
            throw error;
          }
          
          if (data) {
            console.log("Profile loaded successfully:", data);
            set({ profile: data as Profile });
          } else {
            console.warn('No profile found for user:', session.user.id);
            // Create a default profile if none exists
            await createDefaultProfile(session.user.id, session.user.email || '');
            // Try loading again
            await get().loadProfile();
          }
        } catch (error: any) {
          console.error('Error loading profile:', error.message || error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ session: state.session }),
    }
  )
);

// Helper function to create a default profile if none exists
async function createDefaultProfile(userId: string, email: string) {
  try {
    console.log("Creating default profile for user:", userId);
    
    const { error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email: email,
          full_name: '',
          phone_number: '',
          is_admin: false,
        },
      ]);
      
    if (error) {
      console.error('Error creating default profile:', error.message);
      throw error;
    }
    
    console.log('Created default profile for user:', userId);
  } catch (error: any) {
    console.error('Error in createDefaultProfile:', error.message || error);
  }
}