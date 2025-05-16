import { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react-native";
import { formatInr } from "@/utils/format";
import { Order, OrderStatus, SERVICES } from "@/types";

export default function ReadyOrdersScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug logging
  useEffect(() => {
    console.log("ReadyOrdersScreen mounted");
    return () => {
      console.log("ReadyOrdersScreen unmounted");
    };
  }, []);

  // Redirect if not admin
  useEffect(() => {
    console.log("Checking admin status:", profile?.is_admin);
    if (profile && !profile.is_admin) {
      console.log("Not an admin, redirecting");
      router.replace("/(customer)/(tabs)");
    }
  }, [profile]);

  const fetchOrders = async () => {
    if (!profile?.is_admin) {
      console.log("Not an admin, skipping fetch");
      return;
    }
    
    try {
      console.log("Fetching ready orders");
      setLoading(true);
      
      const { data, error } = await supabase
        .from("orders")
        .select("*, profiles(full_name, phone_number)")
        .eq("status", "ready")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} ready orders`);
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
  }, [profile?.is_admin]);

  const getStatusIcon = (status: OrderStatus) => {
    return <CheckCircle2 size={20} color="#10B981" />;
  };

  const getStatusDisplayText = (status: OrderStatus): string => {
    return "Ready";
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

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
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
      setOrders(orders.filter(order => String(order.id) !== orderId));
      
      Alert.alert("Success", "Order status updated successfully");
    } catch (error: any) {
      console.error("Error in updateOrderStatus:", error.message || error);
      Alert.alert("Error", "Failed to update order status: " + (error.message || "Unknown error"));
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderStatus}>
            {getStatusIcon(item.status)}
            <Text style={styles.orderStatusText}>{getStatusDisplayText(item.status)}</Text>
          </View>
          <Text style={styles.orderDate}>
            Order #{String(item.id).substring(0, 8).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.profiles?.full_name}</Text>
          <Text style={styles.customerPhone}>{item.profiles?.phone_number}</Text>
        </View>
        
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceLabel}>Service:</Text>
          <Text style={styles.serviceValue}>{getServiceName(item.laundry_type)}</Text>
        </View>
        
        <View style={styles.weightContainer}>
          <Text style={styles.weightLabel}>Weight:</Text>
          <Text style={styles.weightValue}>
            {item.weight_kg ? `${item.weight_kg} kg (Actual)` : `${item.weight_estimate} kg (Est.)`}
          </Text>
        </View>
        
        <View style={styles.costContainer}>
          <Text style={styles.costLabel}>Cost:</Text>
          <Text style={styles.costValue}>
            {item.cost_inr ? formatInr(item.cost_inr) : formatInr(item.total_cost)}
            {item.cost_inr ? " (Final)" : " (Est.)"}
          </Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.statusButton}
            onPress={() => {
              Alert.alert(
                "Update Status",
                "Mark this order as Delivered?",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Update", onPress: () => updateOrderStatus(String(item.id), "delivered") }
                ]
              );
            }}
          >
            <Text style={styles.statusButtonText}>Mark as Delivered</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => {
            router.push({
              pathname: "/(admin)/order-details",
              params: { id: item.id }
            });
          }}
        >
          <Text style={styles.detailsButtonText}>View Full Details</Text>
          <ArrowRight size={16} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No ready orders found</Text>
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push("/(admin)")}
        >
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ready Orders</Text>
        <View style={styles.placeholder} />
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  placeholder: {
    width: 36,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    backgroundColor: "#D1FAE5",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  orderStatusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#10B981",
  },
  orderDate: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  customerInfo: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  customerPhone: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  serviceInfo: {
    flexDirection: "row",
    marginBottom: 12,
  },
  serviceLabel: {
    fontSize: 15,
    color: "#64748B",
    width: 80,
  },
  serviceValue: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
    flex: 1,
  },
  weightContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  weightLabel: {
    fontSize: 15,
    color: "#64748B",
    width: 80,
  },
  weightValue: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
  },
  costContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  costLabel: {
    fontSize: 15,
    color: "#64748B",
    width: 80,
  },
  costValue: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "600",
  },
  actionButtons: {
    marginBottom: 12,
  },
  statusButton: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  statusButtonText: {
    color: "#10B981",
    fontWeight: "600",
    fontSize: 14,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  detailsButtonText: {
    color: "#3B82F6",
    fontSize: 14,
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
  },
});