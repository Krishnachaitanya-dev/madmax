import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Home, Package, User, Settings } from "lucide-react-native";
import { useAuthStore } from "@/stores/auth";
import { router } from "expo-router";

export default function TabsLayout() {
  const { profile } = useAuthStore();

  // Redirect admin users to admin dashboard
  useEffect(() => {
    console.log("TabsLayout - Checking if user is admin:", profile?.is_admin);
    if (profile?.is_admin) {
      console.log("User is admin, redirecting to admin dashboard");
      router.replace("/(admin)");
    }
  }, [profile]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          borderTopColor: "#F1F5F9",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "My Orders",
          tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}