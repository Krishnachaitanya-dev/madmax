import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { Clock, Truck, Package, CheckCircle2, CheckCheck, List } from "lucide-react-native";

export default function AdminDashboard() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    pending: 0,
    picked_up: 0,
    processing: 0,
    ready: 0,
    delivered: 0,
    total: 0
  });

  useEffect(() => {
    console.log("AdminDashboard - Component mounted");
    if (profile?.is_admin) {
      fetchOrderCounts();
    }
  }, [profile]);

  const fetchOrderCounts = async () => {
    try {
      console.log("Fetching order counts");
      setLoading(true);

      // First, let's check if we can get any orders at all
      const { data: allOrders, error: allOrdersError } = await supabase
        .from("orders")
        .select("id");

      if (allOrdersError) {
        console.error("Error fetching all orders:", allOrdersError.message);
        throw allOrdersError;
      }

      console.log("Total orders found:", allOrders?.length || 0);

      // Now fetch counts for each status
      const pendingPromise = supabase
        .from("orders")
        .select("id")
        .eq("status", "pending");

      const pickedUpPromise = supabase
        .from("orders")
        .select("id")
        .eq("status", "picked_up");

      const processingPromise = supabase
        .from("orders")
        .select("id")
        .eq("status", "processing");

      const readyPromise = supabase
        .from("orders")
        .select("id")
        .eq("status", "ready");

      const deliveredPromise = supabase
        .from("orders")
        .select("id")
        .eq("status", "delivered");

      // Execute all queries in parallel
      const [
        pendingResult,
        pickedUpResult,
        processingResult,
        readyResult,
        deliveredResult
      ] = await Promise.all([
        pendingPromise,
        pickedUpPromise,
        processingPromise,
        readyPromise,
        deliveredPromise
      ]);

      // Check for errors
      if (pendingResult.error) console.error("Error fetching pending orders:", pendingResult.error);
      if (pickedUpResult.error) console.error("Error fetching picked up orders:", pickedUpResult.error);
      if (processingResult.error) console.error("Error fetching processing orders:", processingResult.error);
      if (readyResult.error) console.error("Error fetching ready orders:", readyResult.error);
      if (deliveredResult.error) console.error("Error fetching delivered orders:", deliveredResult.error);

      // Get counts from results
      const pendingCount = pendingResult.data?.length || 0;
      const pickedUpCount = pickedUpResult.data?.length || 0;
      const processingCount = processingResult.data?.length || 0;
      const readyCount = readyResult.data?.length || 0;
      const deliveredCount = deliveredResult.data?.length || 0;
      const totalCount = allOrders?.length || 0;

      console.log("Order counts calculated:", {
        pending: pendingCount,
        picked_up: pickedUpCount,
        processing: processingCount,
        ready: readyCount,
        delivered: deliveredCount,
        total: totalCount
      });

      setCounts({
        pending: pendingCount,
        picked_up: pickedUpCount,
        processing: processingCount,
        ready: readyCount,
        delivered: deliveredCount,
        total: totalCount
      });
    } catch (error) {
      console.error("Error fetching order counts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile?.is_admin) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unauthorized access</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statusCardsContainer}
          >
            <TouchableOpacity
              style={styles.statusCard}
              onPress={() => router.push("/(admin)/pending")}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#FEF3C7" }]}>
                <Clock size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statusCount}>{counts.pending}</Text>
              <Text style={styles.statusLabel}>Pending</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statusCard}
              onPress={() => router.push("/(admin)/picked-up")}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#DBEAFE" }]}>
                <Truck size={24} color="#3B82F6" />
              </View>
              <Text style={styles.statusCount}>{counts.picked_up}</Text>
              <Text style={styles.statusLabel}>Picked Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statusCard}
              onPress={() => router.push("/(admin)/processing")}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#EDE9FE" }]}>
                <Package size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.statusCount}>{counts.processing}</Text>
              <Text style={styles.statusLabel}>Processing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statusCard}
              onPress={() => router.push("/(admin)/ready")}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#D1FAE5" }]}>
                <CheckCircle2 size={24} color="#10B981" />
              </View>
              <Text style={styles.statusCount}>{counts.ready}</Text>
              <Text style={styles.statusLabel}>Ready</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statusCard}
              onPress={() => router.push("/(admin)/delivered")}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#ECFCCB" }]}>
                <CheckCheck size={24} color="#84CC16" />
              </View>
              <Text style={styles.statusCount}>{counts.delivered}</Text>
              <Text style={styles.statusLabel}>Delivered</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push("/(admin)/pending")}
              >
                <Clock size={24} color="#F59E0B" />
                <Text style={styles.actionTitle}>Pending Orders</Text>
                <Text style={styles.actionCount}>{counts.pending} orders</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push("/(admin)/picked-up")}
              >
                <Truck size={24} color="#3B82F6" />
                <Text style={styles.actionTitle}>Picked Up Orders</Text>
                <Text style={styles.actionCount}>{counts.picked_up} orders</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push("/(admin)/processing")}
              >
                <Package size={24} color="#8B5CF6" />
                <Text style={styles.actionTitle}>Processing Orders</Text>
                <Text style={styles.actionCount}>{counts.processing} orders</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => router.push("/(admin)/all")}
              >
                <List size={24} color="#64748B" />
                <Text style={styles.actionTitle}>All Orders</Text>
                <Text style={styles.actionCount}>{counts.total} total</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 20,
  },
  statusCardsContainer: {
    padding: 16,
    gap: 12,
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    height: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statusCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  quickActionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginTop: 12,
    marginBottom: 4,
  },
  actionCount: {
    fontSize: 14,
    color: "#64748B",
  },
});