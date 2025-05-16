import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { router } from "expo-router";
import { LogOut } from "lucide-react-native";

export default function AdminLayout() {
  const { profile, signOut } = useAuthStore();

  // Redirect non-admin users to customer dashboard
  useEffect(() => {
    console.log("AdminLayout - Checking if user is admin:", profile?.is_admin);
    if (profile && !profile.is_admin) {
      console.log("User is not admin, redirecting to customer dashboard");
      router.replace("/(customer)/(tabs)");
    }
  }, [profile]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTitleStyle: {
          fontWeight: "bold",
          color: "#1E293B",
        },
        headerRight: () => (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleSignOut}
          >
            <LogOut size={20} color="#64748B" />
          </TouchableOpacity>
        ),
        headerTitle: () => (
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          </View>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: true }} />
      <Stack.Screen name="pending" options={{ headerShown: true, title: "Pending Orders" }} />
      <Stack.Screen name="picked-up" options={{ headerShown: true, title: "Picked Up Orders" }} />
      <Stack.Screen name="processing" options={{ headerShown: true, title: "Processing Orders" }} />
      <Stack.Screen name="ready" options={{ headerShown: true, title: "Ready Orders" }} />
      <Stack.Screen name="delivered" options={{ headerShown: true, title: "Delivered Orders" }} />
      <Stack.Screen name="all" options={{ headerShown: true, title: "All Orders" }} />
      <Stack.Screen name="order-details" options={{ headerShown: true, title: "Order Details" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  adminBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  adminBadgeText: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "600",
  },
});