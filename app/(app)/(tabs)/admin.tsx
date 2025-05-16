import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView as RNScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Clock, Truck, Package, CheckCircle2, Search, Filter } from "lucide-react-native";
import { formatCurrency } from "@/utils/format";
import { Order, OrderStatus } from "@/types";

export default function AdminScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>("pending");

  // Debug logging
  useEffect(() => {
    console.log("AdminScreen mounted");
    return () => {
      console.log("AdminScreen unmounted");
    };
  }, []);

  // Redirect if not admin
  useEffect(() => {
    console.log("Checking admin status:", profile?.is_admin);
    if (profile && !profile.is_admin) {
      console.log("Not an admin, showing alert");
      Alert.alert(
        "Access Denied",
        "You don't have admin privileges. Please log in with an admin account.",
        [
          {
            text: "OK",
            onPress: () => {
              console.log("Redirecting to tabs");
              router.replace("/(app)/(tabs)");
            },
          },
        ]
      );
    }
  }, [profile]);

  const fetchOrders = async () => {
    if (!profile?.is_admin) {
      console.log("Not an admin, skipping fetch");
      return;
    }
    
    try {
      console.log("Fetching orders with status:", activeTab);
      setLoading(true);
      
      let query = supabase
        .from("orders")
        .select("*, profiles(full_name, phone_number)")
        .order("created_at", { ascending: false });

      if (activeTab !== "all") {
        query = query.eq("status", activeTab);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} orders for status: ${activeTab}`);
      setOrders(data as Order[] || []);
    } catch (error: any) {
      console.error("Error in fetchOrders:", error.message || error);
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.is_admin) {
      console.log("Admin confirmed, fetching orders");
      fetchOrders();
    }
  }, [profile?.is_admin, activeTab]);

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

  const getStatusDisplayText = (status: OrderStatus): string => {
    switch (status) {
      case "pending": return "Pending";
      case "picked_up": return "Picked Up";
      case "processing": return "Processing";
      case "ready": return "Ready";
      case "delivered": return "Delivered";
      default: return status;
    }
  };

  const updateOrderStatus = async (orderId: string | number, newStatus: OrderStatus) => {
    console.log("Updating order status:", { orderId, newStatus });
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId)
        .select();

      if (error) {
        console.error("Error updating order status:", error);
        throw error;
      }
      
      console.log("Status update response:", data);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      Alert.alert("Success", "Order status updated successfully");
    } catch (error: any) {
      console.error("Error in updateOrderStatus:", error.message || error);
      Alert.alert("Error", "Failed to update order status: " + (error.message || "Unknown error"));
    }
  };

  const handleStatusChange = (orderId: string | number, currentStatus: OrderStatus) => {
    console.log("Handle status change for order:", orderId);
    console.log("Current status:", currentStatus);
    
    const statusOptions: Record<OrderStatus, OrderStatus | undefined> = {
      pending: "picked_up",
      picked_up: "processing",
      processing: "ready",
      ready: "delivered",
      delivered: undefined
    };

    const nextStatus = statusOptions[currentStatus];
    
    if (!nextStatus) {
      Alert.alert("Status Update", "This order is already completed.");
      return;
    }

    Alert.alert(
      "Update Status",
      `Change status to "${getStatusDisplayText(nextStatus)}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Update", 
          onPress: () => {
            console.log("Confirmed status update to:", nextStatus);
            updateOrderStatus(orderId, nextStatus);
          }
        },
      ]
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => {
        console.log("Navigating to order details for ID:", item.id);
        router.push({
          pathname: "/(app)/admin-order-details",
          params: { id: item.id }
        });
      }}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderStatus}>
          {getStatusIcon(item.status)}
          <Text style={styles.orderStatusText}>{getStatusDisplayText(item.status)}</Text>
        </View>
        <Text style={styles.orderDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{item.profiles?.full_name}</Text>
        <Text style={styles.customerPhone}>{item.profiles?.phone_number}</Text>
      </View>
      
      <View style={styles.orderDetails}>
        <View>
          <Text style={styles.orderType}>
            {item.laundry_type === "regular" ? "Regular Wash" : 
             item.laundry_type === "dry_clean" ? "Dry Cleaning" : "Express"}
          </Text>
          <Text style={styles.orderWeight}>{item.weight_estimate} kg</Text>
        </View>
        <View style={styles.orderPriceContainer}>
          <Text style={styles.orderPrice}>{formatCurrency(item.total_cost)}</Text>
          <ArrowRight size={16} color="#64748B" />
        </View>
      </View>
      
      {item.status !== "delivered" && (
        <TouchableOpacity
          style={styles.updateStatusButton}
          onPress={() => handleStatusChange(item.id, item.status)}
        >
          <Text style={styles.updateStatusText}>Update Status</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No orders found</Text>
    </View>
  );

  if (!profile?.is_admin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Unauthorized access</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={20} color="#334155" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Filter size={20} color="#334155" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {orders.filter(o => o.status === "pending").length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {orders.filter(o => o.status === "processing").length}
          </Text>
          <Text style={styles.statLabel}>Processing</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {orders.filter(o => o.status === "ready").length}
          </Text>
          <Text style={styles.statLabel}>Ready</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <RNScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "pending" && styles.activeTab]}
            onPress={() => setActiveTab("pending")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pending" && styles.activeTabText,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "picked_up" && styles.activeTab]}
            onPress={() => setActiveTab("picked_up")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "picked_up" && styles.activeTabText,
              ]}
            >
              Picked Up
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "processing" && styles.activeTab]}
            onPress={() => setActiveTab("processing")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "processing" && styles.activeTabText,
              ]}
            >
              Processing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "ready" && styles.activeTab]}
            onPress={() => setActiveTab("ready")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "ready" && styles.activeTabText,
              ]}
            >
              Ready
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "delivered" && styles.activeTab]}
            onPress={() => setActiveTab("delivered")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "delivered" && styles.activeTabText,
              ]}
            >
              Delivered
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.activeTab]}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.activeTabText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
        </RNScrollView>
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
  headerButtons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#F8FAFC",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#3B82F6",
  },
  tabText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
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
    textTransform: "capitalize",
  },
  orderDate: {
    fontSize: 12,
    color: "#64748B",
  },
  customerInfo: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  customerPhone: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
  updateStatusButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  updateStatusText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
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
  },
});