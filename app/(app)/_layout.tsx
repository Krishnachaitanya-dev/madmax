import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function AppLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        // Fix for Android navigation - use conditional for animation
        ...(Platform.OS === 'android' ? { animation: "none" as const } : {})
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="new-order" options={{ headerShown: false }} />
      <Stack.Screen name="order-details" options={{ headerShown: false }} />
      <Stack.Screen name="admin-order-details" options={{ headerShown: false }} />
      <Stack.Screen name="change-password" options={{ headerShown: false }} />
    </Stack>
  );
}