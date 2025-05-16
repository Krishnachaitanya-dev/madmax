import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Clock, Truck, Package, CheckCircle2, User, Phone, MapPin, Edit2, ChevronDown } from "lucide-react-native";
import { formatInr } from "@/utils/format";
import { Order, OrderStatus } from "@/types";

export default function AdminOrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { profile } = useAuthStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("AdminOrderDetailsScreen mounted");
    console.log("Order ID from params:", id);
    return () => {
      console.log("AdminOrderDetailsScreen unmounted");
    };
  }, []);

  // Redirect if not admin
  useEffect(() => {
    console.log("Checking admin status:", profile?.is_admin);
    if (profile && !profile.is_admin) {
      console.log("Not an admin, redirecting");
      router.replace("/(app)/(tabs)");
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.is_admin) {
      console.log("Admin confirmed, fetching order details");
      fetchOrderDetails();
    }
  }, [id, profile?.is_admin]);

  const fetchOrderDetails = async () => {
    console.log("Fetching order details for ID:", id);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, profiles(*)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching order details:", error);
        throw error;
      }
      
      console.log("Order data received:", data);
      setOrder(data as Order);
      setCustomer(data.profiles);
      setAdminNote(data.admin_notes || "");
      setSelectedStatus(data.status as OrderStatus);
      
      console.log("Order status set to:", data.status);
    } catch (error) {
      console.error("Error in fetchOrderDetails:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: OrderStatus) => {
    console.log("Updating order status to:", newStatus);
    console.log("Order ID:", id);
    
    setUpdatingStatus(true);
    try {
      // Convert id to string if it's not already
      const orderId = typeof id === 'object' ? String(id) : id;
      console.log("Formatted order ID for update:", orderId);
      
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
      if (order) {
        const updatedOrder = { ...order, status: newStatus };
        console.log("Updating local order state:", updatedOrder);
        setOrder(updatedOrder);
      }
      
      Alert.alert("Success", `Order status updated to ${newStatus.replace("_", " ")}`);
    } catch (error: any) {
      console.error("Error in updateOrderStatus:", error.message || error);
      Alert.alert("Error", "Failed to update order status: " + (error.message || "Unknown error"));
    } finally {
      setUpdatingStatus(false);
      setShowStatusDropdown(false);
    }
  };

  const saveAdminNote = async () => {
    console.log("Saving admin note:", adminNote);
    console.log("For order ID:", id);
    
    setSavingNote(true);
    try {
      // Convert id to string if it's not already
      const orderId = typeof id === 'object' ? String(id) : id;
      console.log("Formatted order ID for note update:", orderId);
      
      const { data, error } = await supabase
        .from("orders")
        .update({ admin_notes: adminNote })
        .eq("id", orderId)
        .select();

      if (error) {
        console.error("Error saving admin notes:", error);
        throw error;
      }
      
      console.log("Admin note update response:", data);
      Alert.alert("Success", "Notes saved successfully");
    } catch (error: any) {
      console.error("Error saving admin notes:", error.message || error);
      Alert.alert("Error", "Failed to save notes: " + (error.message || "Unknown error"));
    } finally {
      setSavingNote(false);
    }
  };

  // Status options for dropdown
  const statusOptions: OrderStatus[] = ["pending", "picked_up", "processing", "ready", "delivered"];

  // Get display text for status
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order || !profile?.is_admin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {!profile?.is_admin ? "Unauthorized access" : "Order not found"}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Order Management",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#1E293B" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>Order ID</Text>
          <Text style={styles.orderId}>{String(order.id).substring(0, 8).toUpperCase()}</Text>
          <View style={[styles.statusBadge, getStatusBadgeStyle(order.status)]}>
            <Text style={styles.statusBadgeText}>{getStatusDisplayText(order.status)}</Text>
          </View>
        </View>

        <View style={styles.customerContainer}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          
          <View style={styles.customerCard}>
            <View style={styles.customerInfo}>
              <User size={20} color="#64748B" style={styles.infoIcon} />
              <Text style={styles.infoText}>{customer?.full_name}</Text>
            </View>
            
            <View style={styles.customerInfo}>
              <Phone size={20} color="#64748B" style={styles.infoIcon} />
              <Text style={styles.infoText}>{customer?.phone_number}</Text>
            </View>
            
            {customer?.address && (
              <View style={styles.customerInfo}>
                <MapPin size={20} color="#64748B" style={styles.infoIcon} />
                <Text style={styles.infoText}>{customer?.address}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service Type</Text>
            <Text style={styles.detailValue}>
              {order.laundry_type === "regular" ? "Regular Wash" : 
               order.laundry_type === "dry_clean" ? "Dry Cleaning" : "Express"}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weight</Text>
            <Text style={styles.detailValue}>{order.weight_estimate} kg</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pickup Date</Text>
            <Text style={styles.detailValue}>
              {new Date(order.pickup_date).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pickup Time</Text>
            <Text style={styles.detailValue}>
              {order.pickup_time.substring(0, 5)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Date</Text>
            <Text style={styles.detailValue}>
              {new Date(order.created_at).toLocaleDateString()}
            </Text>
          </View>
          
          {order.special_instructions && (
            <View style={styles.specialInstructions}>
              <Text style={styles.detailLabel}>Special Instructions</Text>
              <Text style={styles.instructionsText}>{order.special_instructions}</Text>
            </View>
          )}
        </View>

        <View style={styles.notesContainer}>
          <View style={styles.notesHeader}>
            <Text style={styles.sectionTitle}>Admin Notes</Text>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveAdminNote}
              disabled={savingNote}
            >
              {savingNote ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <View style={styles.saveButtonContent}>
                  <Edit2 size={16} color="#3B82F6" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.notesInput}
            value={adminNote}
            onChangeText={setAdminNote}
            placeholder="Add notes about this order..."
            multiline
          />
        </View>

        <View style={styles.statusUpdateContainer}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          
          <TouchableOpacity 
            style={styles.statusSelector}
            onPress={() => setShowStatusDropdown(!showStatusDropdown)}
            disabled={updatingStatus}
          >
            <Text style={styles.statusSelectorText}>
              {selectedStatus ? getStatusDisplayText(selectedStatus) : "Select Status"}
            </Text>
            <ChevronDown size={20} color="#64748B" />
          </TouchableOpacity>
          
          {showStatusDropdown && (
            <View style={styles.dropdownContainer}>
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.dropdownItem,
                    selectedStatus === status && styles.selectedDropdownItem
                  ]}
                  onPress={() => {
                    setSelectedStatus(status);
                    setShowStatusDropdown(false);
                  }}
                >
                  <Text 
                    style={[
                      styles.dropdownItemText,
                      selectedStatus === status && styles.selectedDropdownItemText
                    ]}
                  >
                    {getStatusDisplayText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <TouchableOpacity
            style={styles.updateStatusButton}
            onPress={() => {
              if (selectedStatus && selectedStatus !== order.status) {
                updateOrderStatus(selectedStatus);
              } else if (selectedStatus === order.status) {
                Alert.alert("Info", "Order is already in this status");
              } else {
                Alert.alert("Error", "Please select a status");
              }
            }}
            disabled={updatingStatus || !selectedStatus || selectedStatus === order.status}
          >
            {updatingStatus ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.updateStatusText}>
                Update Status
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.paymentContainer}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Service Cost</Text>
            <Text style={styles.paymentValue}>
              {formatInr(order.total_cost)}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatInr(order.total_cost)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusBadgeStyle = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return { backgroundColor: "#FEF3C7" };
    case "picked_up":
      return { backgroundColor: "#DBEAFE" };
    case "processing":
      return { backgroundColor: "#EDE9FE" };
    case "ready":
      return { backgroundColor: "#D1FAE5" };
    case "delivered":
      return { backgroundColor: "#D1FAE5" };
    default:
      return { backgroundColor: "#F1F5F9" };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#64748B",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  orderIdContainer: {
    padding: 20,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
  },
  orderIdLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  customerContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 16,
  },
  customerCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#334155",
    flex: 1,
  },
  detailsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: "#64748B",
  },
  detailValue: {
    fontSize: 16,
    color: "#334155",
    fontWeight: "500",
  },
  specialInstructions: {
    marginTop: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: "#334155",
    marginTop: 8,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  notesContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#3B82F6",
    fontWeight: "600",
    marginLeft: 4,
  },
  notesInput: {
    height: 120,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: "top",
  },
  statusUpdateContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  statusSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statusSelectorText: {
    fontSize: 16,
    color: "#334155",
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#fff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  selectedDropdownItem: {
    backgroundColor: "#EFF6FF",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#334155",
  },
  selectedDropdownItemText: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  updateStatusButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  updateStatusText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  paymentContainer: {
    padding: 20,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 16,
    color: "#64748B",
  },
  paymentValue: {
    fontSize: 16,
    color: "#334155",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3B82F6",
  },
});