import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth";

export default function CustomerLayout() {
  const router = useRouter();
  const { profile } = useAuthStore();

  // Debug logging
  useEffect(() => {
    console.log("CustomerLayout mounted");
    return () => {
      console.log("CustomerLayout unmounted");
    };
  }, []);

  // Redirect if admin
  useEffect(() => {
    console.log("Checking customer status in CustomerLayout:", !profile?.is_admin);
    if (profile?.is_admin) {
      console.log("User is admin, redirecting to admin interface");
      router.replace("/(admin)");
    }
  }, [profile]);

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        // Fix for Android navigation
        ...(Platform.OS === 'android' ? { animation: "none" as const } : {})
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="new-order" options={{ headerShown: false }} />
      <Stack.Screen name="order-details" options={{ headerShown: false }} />
      <Stack.Screen name="change-password" options={{ headerShown: false }} />
    </Stack>
  );
}