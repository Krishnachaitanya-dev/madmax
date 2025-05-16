import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Clock, Truck, Package, CheckCircle2 } from "lucide-react-native";
import { formatInr } from "@/utils/format";
import { Order, OrderStatus, SERVICES } from "@/types";

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { profile } = useAuthStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .eq("user_id", profile?.id)
        .single();

      if (error) throw error;
      setOrder(data as Order);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: OrderStatus, size = 24) => {
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

  const getStatusDescription = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Your order has been received and is waiting for pickup.";
      case "picked_up":
        return "Your laundry has been picked up and is on its way to our facility.";
      case "processing":
        return "Your laundry is currently being washed and processed.";
      case "ready":
        return "Your laundry is clean and ready for delivery.";
      case "delivered":
        return "Your laundry has been delivered. Thank you for using our service!";
      default:
        return "";
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Order not found</Text>
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
          title: "Order Details",
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
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.currentStatusContainer}>
            {getStatusIcon(order.status)}
            <View style={styles.statusTextContainer}>
              <Text style={styles.currentStatusText}>{getStatusText(order.status)}</Text>
              <Text style={styles.statusDescription}>{getStatusDescription(order.status)}</Text>
            </View>
          </View>

          <View style={styles.statusTimeline}>
            <View style={[styles.statusStep, styles.completedStep]}>
              <View style={styles.statusDot}>
                <CheckCircle2 size={20} color="#fff" />
              </View>
              <Text style={styles.statusStepText}>Order Placed</Text>
            </View>
            
            <View style={[
              styles.statusConnector,
              order.status !== "pending" && styles.completedConnector
            ]} />
            
            <View style={[
              styles.statusStep,
              order.status !== "pending" && styles.completedStep
            ]}>
              <View style={styles.statusDot}>
                {order.status !== "pending" ? (
                  <CheckCircle2 size={20} color="#fff" />
                ) : (
                  <Truck size={20} color="#94A3B8" />
                )}
              </View>
              <Text style={styles.statusStepText}>Picked Up</Text>
            </View>
            
            <View style={[
              styles.statusConnector,
              (order.status !== "pending" && order.status !== "picked_up") && styles.completedConnector
            ]} />
            
            <View style={[
              styles.statusStep,
              (order.status !== "pending" && order.status !== "picked_up") && styles.completedStep
            ]}>
              <View style={styles.statusDot}>
                {(order.status !== "pending" && order.status !== "picked_up") ? (
                  <CheckCircle2 size={20} color="#fff" />
                ) : (
                  <Package size={20} color="#94A3B8" />
                )}
              </View>
              <Text style={styles.statusStepText}>Processing</Text>
            </View>
            
            <View style={[
              styles.statusConnector,
              (order.status === "ready" || order.status === "delivered") && styles.completedConnector
            ]} />
            
            <View style={[
              styles.statusStep,
              (order.status === "ready" || order.status === "delivered") && styles.completedStep
            ]}>
              <View style={styles.statusDot}>
                {(order.status === "ready" || order.status === "delivered") ? (
                  <CheckCircle2 size={20} color="#fff" />
                ) : (
                  <CheckCircle2 size={20} color="#94A3B8" />
                )}
              </View>
              <Text style={styles.statusStepText}>Ready</Text>
            </View>
            
            <View style={[
              styles.statusConnector,
              order.status === "delivered" && styles.completedConnector
            ]} />
            
            <View style={[
              styles.statusStep,
              order.status === "delivered" && styles.completedStep
            ]}>
              <View style={styles.statusDot}>
                {order.status === "delivered" ? (
                  <CheckCircle2 size={20} color="#fff" />
                ) : (
                  <CheckCircle2 size={20} color="#94A3B8" />
                )}
              </View>
              <Text style={styles.statusStepText}>Delivered</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service Type</Text>
            <Text style={styles.detailValue}>
              {getServiceName(order.laundry_type)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estimated Weight</Text>
            <Text style={styles.detailValue}>{order.weight_estimate} kg</Text>
          </View>
          
          {order.weight_kg && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Actual Weight</Text>
              <Text style={styles.detailValue}>{order.weight_kg} kg</Text>
            </View>
          )}
          
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

        <View style={styles.paymentContainer}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Estimated Cost</Text>
            <Text style={styles.paymentValue}>
              {formatInr(order.total_cost)}
            </Text>
          </View>
          
          {order.cost_inr && (
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Final Cost</Text>
              <Text style={styles.paymentValue}>
                {formatInr(order.cost_inr)}
              </Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {order.cost_inr ? formatInr(order.cost_inr) : formatInr(order.total_cost)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => {
            // In a real app, this would open a support chat or contact form
            alert("Support feature would be implemented here");
          }}
        >
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
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
  },
  statusContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  currentStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  statusTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  currentStatusText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  statusTimeline: {
    marginTop: 8,
  },
  statusStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  completedStep: {
    opacity: 1,
  },
  statusDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusStepText: {
    fontSize: 16,
    color: "#64748B",
  },
  statusConnector: {
    width: 2,
    height: 24,
    backgroundColor: "#E2E8F0",
    marginLeft: 15,
    marginBottom: 8,
  },
  completedConnector: {
    backgroundColor: "#3B82F6",
  },
  detailsContainer: {
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  supportButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  supportButtonText: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "600",
  },
});