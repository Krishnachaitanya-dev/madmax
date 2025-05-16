import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/lib/supabase';
import ErrorBoundary from './error-boundary';

export default function RootLayout() {
  const { setSession, profile } = useAuthStore();

  // Debug logging
  useEffect(() => {
    console.log("RootLayout mounted");
    return () => {
      console.log("RootLayout unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("Setting up auth in RootLayout");
    
    // Initialize auth state from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "Session exists" : "No session");
      setSession(session);
    }).catch(error => {
      console.error("Error getting initial session:", error);
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change in RootLayout:", event, session ? "Session exists" : "No session");
        setSession(session);
      }
    );

    return () => {
      console.log("Cleaning up auth listener in RootLayout");
      subscription.unsubscribe();
    };
  }, []);

  // Use ErrorBoundary to catch and display errors
  return (
    <ErrorBoundary>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          // Fix for Android navigation - use conditional for animation
          ...(Platform.OS === 'android' ? { animation: "none" as const } : {})
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(customer)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ErrorBoundary>
  );
}