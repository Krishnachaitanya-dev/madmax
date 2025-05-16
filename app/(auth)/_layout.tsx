import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function AuthLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        // Fix for Android navigation
        animation: Platform.OS === 'android' ? 'none' : 'default',
      }}
    />
  );
}