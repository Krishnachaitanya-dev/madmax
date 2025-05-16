import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { Image } from "expo-image";
import { Plus, ArrowRight, Truck, Package, Clock } from "lucide-react-native";
import { formatInr } from "@/utils/format";
import { Order, OrderStatus, SERVICES } from "@/types";

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", profile?.id)
        .in("status", ["pending", "picked_up", "processing"])
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setActiveOrders(data as Order[] || []);
    } catch (error) {
      console.error("Error fetching active orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchActiveOrders();
    }
  }, [profile?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActiveOrders();
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock size={20} color="#F59E0B" />;
      case "picked_up":
        return <Truck size={20} color="#3B82F6" />;
      case "processing":
        return <Package size={20} color="#8B5CF6" />;
      default:
        return <Clock size={20} color="#F59E0B" />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Waiting for pickup";
      case "picked_up":
        return "In transit";
      case "processing":
        return "Being processed";
      default:
        return status;
    }
  };

  const getServiceName = (laundryType: string): string => {
    const service = SERVICES.find(s => s.service_type === laundryType);
    if (service) return service.name;
    
    // Legacy service types
    switch (laundryType) {
      case "regular": return "Normal Clothes Wash & Fold";
      case "dry_clean": return "Dry Cleaning";
      case "express": return "Express Service";
      default: return laundryType;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {profile?.full_name?.split(" ")[0] || "there"}!</Text>
            <Text style={styles.subGreeting}>What would you like to do today?</Text>
          </View>
        </View>

        <View style={styles.heroContainer}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?q=80&w=2070&auto=format&fit=crop" }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Quick & Easy Laundry Service</Text>
            <Text style={styles.heroSubtitle}>Schedule a pickup in minutes</Text>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => router.push("/(customer)/new-order")}
            >
              <Text style={styles.heroButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.servicesGrid}>
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => router.push({
                pathname: "/(customer)/new-order",
                params: { type: "wash_fold" }
              })}
            >
              <View style={[styles.serviceIconContainer, { backgroundColor: "#EFF6FF" }]}>
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?q=80&w=2070&auto=format&fit=crop" }}
                  style={styles.serviceIcon}
                  contentFit="cover"
                />
              </View>
              <Text style={styles.serviceTitle}>Wash & Fold</Text>
              <Text style={styles.servicePrice}>From {formatInr(100)}/kg</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => router.push({
                pathname: "/(customer)/new-order",
                params: { type: "wash_iron" }
              })}
            >
              <View style={[styles.serviceIconContainer, { backgroundColor: "#F0FDF4" }]}>
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=2070&auto=format&fit=crop" }}
                  style={styles.serviceIcon}
                  contentFit="cover"
                />
              </View>
              <Text style={styles.serviceTitle}>Wash & Iron</Text>
              <Text style={styles.servicePrice}>From {formatInr(150)}/kg</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => router.push({
                pathname: "/(customer)/new-order",
                params: { type: "bedsheets" }
              })}
            >
              <View style={[styles.serviceIconContainer, { backgroundColor: "#FEF2F2" }]}>
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?q=80&w=2070&auto=format&fit=crop" }}
                  style={styles.serviceIcon}
                  contentFit="cover"
                />
              </View>
              <Text style={styles.serviceTitle}>Bedsheets</Text>
              <Text style={styles.servicePrice}>From {formatInr(130)}/kg</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.activeOrdersContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Orders</Text>
            <TouchableOpacity onPress={() => router.push("/(customer)/(tabs)/orders")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {activeOrders.length > 0 ? (
            activeOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push({
                  pathname: "/(customer)/order-details",
                  params: { id: order.id }
                })}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderStatus}>
                    {getStatusIcon(order.status as OrderStatus)}
                    <Text style={styles.orderStatusText}>{getStatusText(order.status as OrderStatus)}</Text>
                  </View>
                  <Text style={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.orderDetails}>
                  <View>
                    <Text style={styles.orderType}>
                      {getServiceName(order.laundry_type)}
                    </Text>
                    <Text style={styles.orderWeight}>
                      {order.weight_kg ? `${order.weight_kg} kg (Actual)` : `${order.weight_estimate} kg (Est.)`}
                    </Text>
                  </View>
                  <View style={styles.orderPriceContainer}>
                    <Text style={styles.orderPrice}>
                      {order.cost_inr ? formatInr(order.cost_inr) : formatInr(order.total_cost)}
                    </Text>
                    <ArrowRight size={16} color="#64748B" />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyOrdersContainer}>
              <Text style={styles.emptyOrdersText}>No active orders</Text>
              <TouchableOpacity
                style={styles.newOrderButton}
                onPress={() => router.push("/(customer)/new-order")}
              >
                <Plus size={16} color="#fff" />
                <Text style={styles.newOrderButtonText}>New Order</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },
  subGreeting: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 4,
  },
  heroContainer: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    height: 180,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    padding: 20,
    justifyContent: "flex-end",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#E2E8F0",
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  heroButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  servicesContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceCard: {
    width: "30%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  serviceIcon: {
    width: "100%",
    height: "100%",
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 12,
    color: "#64748B",
  },
  activeOrdersContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderStatusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
  },
  orderDate: {
    fontSize: 12,
    color: "#64748B",
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  orderWeight: {
    fontSize: 14,
    color: "#64748B",
  },
  orderPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E293B",
    marginRight: 8,
  },
  emptyOrdersContainer: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  emptyOrdersText: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 16,
  },
  newOrderButton: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  newOrderButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
});