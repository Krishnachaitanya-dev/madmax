import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Clock, Truck, Package, CheckCircle2, Save, Edit2, MapPin } from "lucide-react-native";
import { formatInr } from "@/utils/format";
import { Order, OrderStatus, SERVICES } from "@/types";

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [editingStatus, setEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pending");
  const [editingWeight, setEditingWeight] = useState(false);
  const [weight, setWeight] = useState("");
  const [cost, setCost] = useState("");

  // Debug logging
  useEffect(() => {
    console.log("OrderDetailsScreen mounted with id:", id);
    return () => {
      console.log("OrderDetailsScreen unmounted");
    };
  }, [id]);

  // Redirect if not admin
  useEffect(() => {
    console.log("Checking admin status:", profile?.is_admin);
    if (profile && !profile.is_admin) {
      console.log("Not an admin, redirecting");
      router.replace("/(customer)/(tabs)");
    }
  }, [profile]);

  const fetchOrder = async () => {
    if (!id || !profile?.is_admin) {
      console.log("No id or not admin, skipping fetch");
      return;
    }
    
    try {
      console.log("Fetching order details for id:", id);
      setLoading(true);
      
      const { data, error } = await supabase
        .from("orders")
        .select("*, profiles(full_name, phone_number, email, address)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching order:", error);
        throw error;
      }
      
      console.log("Order fetched:", data);
      setOrder(data as Order);
      setAdminNotes(data.admin_notes || "");
      setSelectedStatus(data.status);
      setWeight(String(data.weight_kg || data.weight_estimate || 0));
      setCost(String(data.cost_inr || data.total_cost || 0));
    } catch (error: any) {
      console.error("Error in fetchOrder:", error.message || error);
      Alert.alert("Error", "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.is_admin) {
      console.log("Admin confirmed, fetching order");
      fetchOrder();
    }
  }, [id, profile?.is_admin]);

  const saveAdminNotes = async () => {
    if (!id || !order) return;
    
    try {
      console.log("Saving admin notes for order:", id);
      setSaving(true);
      
      const { data, error } = await supabase
        .from("orders")
        .update({ admin_notes: adminNotes })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error updating admin notes:", error);
        throw error;
      }
      
      console.log("Admin notes updated:", data);
      setOrder({ ...order, admin_notes: adminNotes });
      setEditingNotes(false);
      Alert.alert("Success", "Admin notes updated successfully");
    } catch (error: any) {
      console.error("Error saving admin notes:", error.message || error);
      Alert.alert("Error", "Failed to update admin notes");
    } finally {
      setSaving(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!id || !order) return;
    
    try {
      console.log("Updating order status for id:", id, "to:", selectedStatus);
      setSaving(true);
      
      const { data, error } = await supabase
        .from("orders")
        .update({ status: selectedStatus })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error updating order status:", error);
        throw error;
      }
      
      console.log("Order status updated:", data);
      setOrder({ ...order, status: selectedStatus });
      setEditingStatus(false);
      Alert.alert("Success", "Order status updated successfully");
    } catch (error: any) {
      console.error("Error updating order status:", error.message || error);
      Alert.alert("Error", "Failed to update order status");
    } finally {
      setSaving(false);
    }
  };

  const saveWeightAndCost = async () => {
    if (!id || !order) return;
    
    try {
      console.log("Saving weight and cost for order:", id);
      setSaving(true);
      
      const weightValue = parseFloat(weight) || 0;
      const costValue = parseFloat(cost) || 0;
      
      const { data, error } = await supabase
        .from("orders")
        .update({ 
          weight_kg: weightValue,
          cost_inr: costValue
        })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Error updating weight and cost:", error);
        throw error;
      }
      
      console.log("Weight and cost updated:", data);
      setOrder({ ...order, weight_kg: weightValue, cost_inr: costValue });
      setEditingWeight(false);
      Alert.alert("Success", "Weight and cost updated successfully");
    } catch (error: any) {
      console.error("Error saving weight and cost:", error.message || error);
      Alert.alert("Error", "Failed to update weight and cost");
    } finally {
      setSaving(false);
    }
  };

  const handleWeightChange = (value: string) => {
    setWeight(value);
    
    // Auto-calculate cost based on weight and service type
    if (order) {
      const weightValue = parseFloat(value) || 0;
      const servicePrice = getServicePrice(order.laundry_type);
      const newCost = weightValue * servicePrice;
      setCost(String(newCost));
    }
  };

  const getStatusIcon = (status: OrderStatus, size = 20) => {
    switch (status) {
      case "pending":
        return <Clock size={size} color="#F59E0B" />;
      case "picked_up":
        return <Truck size={size} color="#3B82F6" />;
      case "processing":
        return <Package size={size} color="#8B5CF6" />;
      case "ready":
        return <CheckCircle2 size={size} color="#10B981" />;
      case "delivered":
        return <CheckCircle2 size={size} color="#10B981" />;
      default:
        return <Clock size={size} color="#F59E0B" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "#FEF3C7";
      case "picked_up":
        return "#DBEAFE";
      case "processing":
        return "#EDE9FE";
      case "ready":
        return "#D1FAE5";
      case "delivered":
        return "#D1FAE5";
      default:
        return "#F1F5F9";
    }
  };

  const getStatusTextColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "#D97706";
      case "picked_up":
        return "#3B82F6";
      case "processing":
        return "#8B5CF6";
      case "ready":
        return "#10B981";
      case "delivered":
        return "#10B981";
      default:
        return "#64748B";
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

  const getServicePrice = (laundryType: string): number => {
    const service = SERVICES.find(s => s.service_type === laundryType);
    if (service) return service.price;
    
    // Legacy service types
    switch (laundryType) {
      case "regular": return 100;
      case "dry_clean": return 150;
      case "express": return 200;
      default: return 100;
    }
  };

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
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : order ? (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderId}>Order #{String(order.id).substring(0, 8).toUpperCase()}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.created_at).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            {editingStatus ? (
              <View style={styles.statusEditContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusOptions}>
                  {(['pending', 'picked_up', 'processing', 'ready', 'delivered'] as const).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        { backgroundColor: getStatusColor(status) },
                        selectedStatus === status && styles.selectedStatusOption
                      ]}
                      onPress={() => setSelectedStatus(status)}
                    >
                      <View style={styles.statusOptionContent}>
                        {getStatusIcon(status)}
                        <Text
                          style={[
                            styles.statusOptionText,
                            { color: getStatusTextColor(status) }
                          ]}
                        >
                          {getStatusDisplayText(status)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.statusActions}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={updateOrderStatus}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Save size={16} color="#fff" />
                        <Text style={styles.saveButtonText}>Save Status</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditingStatus(false);
                      setSelectedStatus(order.status);
                    }}
                    disabled={saving}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}
                onPress={() => setEditingStatus(true)}
              >
                <View style={styles.statusContent}>
                  {getStatusIcon(order.status)}
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusTextColor(order.status) }
                    ]}
                  >
                    {getStatusDisplayText(order.status)}
                  </Text>
                </View>
                <View style={styles.editIconContainer}>
                  <Edit2 size={16} color={getStatusTextColor(order.status)} />
                </View>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.customerCard}>
              <Text style={styles.customerName}>{order.profiles?.full_name}</Text>
              <Text style={styles.customerDetail}>{order.profiles?.phone_number}</Text>
              <Text style={styles.customerDetail}>{order.profiles?.email}</Text>
              {order.profiles?.address && (
                <View style={styles.addressContainer}>
                  <MapPin size={16} color="#64748B" style={styles.addressIcon} />
                  <Text style={styles.customerAddress}>{order.profiles.address}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service Type:</Text>
              <Text style={styles.detailValue}>{getServiceName(order.laundry_type)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price per kg:</Text>
              <Text style={styles.detailValue}>{formatInr(getServicePrice(order.laundry_type))}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Weight & Cost</Text>
              {!editingWeight && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditingWeight(true)}
                >
                  <View style={styles.editButtonContent}>
                    <Edit2 size={16} color="#3B82F6" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            
            {editingWeight ? (
              <View style={styles.editContainer}>
                <View style={styles.editRow}>
                  <Text style={styles.editLabel}>Weight (kg):</Text>
                  <TextInput
                    style={styles.editInput}
                    value={weight}
                    onChangeText={handleWeightChange}
                    keyboardType="decimal-pad"
                    placeholder="Enter actual weight"
                  />
                </View>
                <View style={styles.editRow}>
                  <Text style={styles.editLabel}>Cost (₹):</Text>
                  <TextInput
                    style={styles.editInput}
                    value={cost}
                    onChangeText={setCost}
                    keyboardType="decimal-pad"
                    placeholder="Enter final cost"
                  />
                </View>
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveWeightAndCost}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Save size={16} color="#fff" />
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditingWeight(false);
                      setWeight(String(order.weight_kg || order.weight_estimate || 0));
                      setCost(String(order.cost_inr || order.total_cost || 0));
                    }}
                    disabled={saving}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Weight:</Text>
                  <Text style={styles.detailValue}>
                    {order.weight_kg ? `${order.weight_kg} kg (Actual)` : `${order.weight_estimate} kg (Est.)`}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cost:</Text>
                  <Text style={styles.detailValue}>
                    {order.cost_inr ? formatInr(order.cost_inr) : formatInr(order.total_cost)}
                    {order.cost_inr ? " (Final)" : " (Est.)"}
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup & Delivery</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address:</Text>
              <Text style={styles.detailValue}>{order.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pickup Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(order.pickup_date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Pickup Time:</Text>
              <Text style={styles.detailValue}>{order.pickup_time}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                {order.special_instructions || "No special instructions provided."}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Admin Notes</Text>
              {!editingNotes && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditingNotes(true)}
                >
                  <View style={styles.editButtonContent}>
                    <Edit2 size={16} color="#3B82F6" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            
            {editingNotes ? (
              <View style={styles.notesEditContainer}>
                <TextInput
                  style={styles.notesInput}
                  value={adminNotes}
                  onChangeText={setAdminNotes}
                  placeholder="Add notes for admin reference"
                  multiline
                />
                <View style={styles.notesActions}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveAdminNotes}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <View style={styles.buttonContent}>
                        <Save size={16} color="#fff" />
                        <Text style={styles.saveButtonText}>Save Notes</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setEditingNotes(false);
                      setAdminNotes(order.admin_notes || "");
                    }}
                    disabled={saving}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>
                  {order.admin_notes || "No admin notes added yet."}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Order not found</Text>
        </View>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  orderHeader: {
    marginBottom: 20,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#64748B",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  editIconContainer: {
    padding: 4,
  },
  statusEditContainer: {
    marginBottom: 16,
  },
  statusOptions: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedStatusOption: {
    borderColor: "#3B82F6",
  },
  statusOptionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusOptionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  statusActions: {
    flexDirection: "row",
  },
  customerCard: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  customerDetail: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  addressIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  customerAddress: {
    flex: 1,
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    width: 100,
    fontSize: 14,
    color: "#64748B",
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  instructionsContainer: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  notesContainer: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 8,
  },
  notesText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  notesEditContainer: {
    marginBottom: 16,
  },
  notesInput: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 14,
    color: "#334155",
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  notesActions: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#EFF6FF",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  editButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginRight: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
  },
  editContainer: {
    marginBottom: 16,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  editLabel: {
    width: 100,
    fontSize: 14,
    color: "#64748B",
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
  },
  editActions: {
    flexDirection: "row",
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
  },
});