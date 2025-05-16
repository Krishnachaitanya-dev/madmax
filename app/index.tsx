import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Redirect, router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth";

export default function Index() {
  const { session, profile, setSession } = useAuthStore();

  useEffect(() => {
    console.log("Root index - Checking auth state");
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
      }
    );

    // Check current session
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log("Current session:", currentSession ? "exists" : "none");
      setSession(currentSession);
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // If we have a session but no profile yet, show loading
  if (session && !profile) {
    console.log("Session exists but profile not loaded yet");
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // If we have a profile, redirect based on admin status
  if (profile) {
    console.log("Profile loaded, is_admin:", profile.is_admin);
    if (profile.is_admin) {
      console.log("Redirecting to admin dashboard");
      return <Redirect href="/(admin)" />;
    } else {
      console.log("Redirecting to customer dashboard");
      return <Redirect href="/(customer)/(tabs)" />;
    }
  }

  // If no session, redirect to login
  if (!session) {
    console.log("No session, redirecting to login");
    return <Redirect href="/(auth)/login" />;
  }

  // Fallback loading state
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});