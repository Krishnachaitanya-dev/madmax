import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Clock, Truck, Package, CheckCircle2, Plus } from "lucide-react-native";
import { formatInr } from "@/utils/format";
import { Order, OrderStatus, SERVICES } from "@/types";

export default function OrdersScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from("orders")
        .select("*")
        .eq("user_id", profile?.id)
        .order("created_at", { ascending: false });

      if (activeTab === "active") {
        query = query.in("status", ["pending", "picked_up", "processing"]);
      } else {
        query = query.in("status", ["ready", "delivered"]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data as Order[] || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchOrders();
    }
  }, [profile?.id, activeTab]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock size={20} color="#F59E0B" />;
      case "picked_up":
        return <Truck size={20} color="#3B82F6" />;
      case "processing":
        return <Package size={20} color="#8B5CF6" />;
      case "ready":
        return <CheckCircle2 size={20} color="#10B981" />;
      case "delivered":
        return <CheckCircle2 size={20} color="#10B981" />;
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
      case "ready":
        return "Ready for delivery";
      case "delivered":
        return "Delivered";
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

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push({
        pathname: "/(customer)/order-details",
        params: { id: item.id }
      })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderStatus}>
          {getStatusIcon(item.status)}
          <Text style={styles.orderStatusText}>{getStatusText(item.status)}</Text>
        </View>
        <Text style={styles.orderDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.orderDetails}>
        <View>
          <Text style={styles.orderType}>
            {getServiceName(item.laundry_type)}
          </Text>
          <Text style={styles.orderWeight}>
            {item.weight_kg ? `${item.weight_kg} kg (Actual)` : `${item.weight_estimate} kg (Est.)`}
          </Text>
        </View>
        <View style={styles.orderPriceContainer}>
          <Text style={styles.orderPrice}>
            {item.cost_inr ? formatInr(item.cost_inr) : formatInr(item.total_cost)}
          </Text>
          <ArrowRight size={16} color="#64748B" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {activeTab === "active" ? "No active orders" : "No completed orders"}
      </Text>
      {activeTab === "active" && (
        <TouchableOpacity
          style={styles.newOrderButton}
          onPress={() => router.push("/(customer)/new-order")}
        >
          <Plus size={16} color="#fff" />
          <Text style={styles.newOrderButtonText}>New Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity
          style={styles.newOrderBtn}
          onPress={() => router.push("/(customer)/new-order")}
        >
          <Plus size={18} color="#fff" />
          <Text style={styles.newOrderBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.activeTabText,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "completed" && styles.activeTabText,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  newOrderBtn: {
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  newOrderBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#3B82F6",
  },
  tabText: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
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