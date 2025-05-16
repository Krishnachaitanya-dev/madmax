import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, Clock, Info } from "lucide-react-native";
import { formatCurrency } from "@/utils/format";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LaundryType } from "@/types";

export default function NewOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { profile } = useAuthStore();
  const initialType = (params.type as LaundryType) || "regular";

  const [loading, setLoading] = useState(false);
  const [laundryType, setLaundryType] = useState<LaundryType>(initialType);
  const [weightEstimate, setWeightEstimate] = useState("3");
  const [specialInstructions, setSpecialInstructions] = useState("");
  
  // Date and time selection
  const [pickupDate, setPickupDate] = useState(new Date());
  const [pickupTime, setPickupTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Initialize pickup date to tomorrow
  useEffect(() => {
    setPickupDate(new Date(tomorrow));
  }, []);

  // Calculate price based on laundry type and weight
  const calculatePrice = () => {
    const weight = parseFloat(weightEstimate) || 0;
    let pricePerKg = 0;

    switch (laundryType) {
      case "regular":
        pricePerKg = 5.99;
        break;
      case "dry_clean":
        pricePerKg = 9.99;
        break;
      case "express":
        pricePerKg = 12.99;
        break;
      default:
        pricePerKg = 5.99;
    }

    return weight * pricePerKg;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || pickupDate;
    setShowDatePicker(Platform.OS === "ios");
    
    // Ensure the date is not in the past
    if (currentDate >= tomorrow) {
      setPickupDate(currentDate);
    } else {
      Alert.alert("Invalid Date", "Please select a future date for pickup.");
      setPickupDate(tomorrow);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || pickupTime;
    setShowTimePicker(Platform.OS === "ios");
    setPickupTime(currentTime);
  };

  const handleSubmitOrder = async () => {
    if (!profile?.id) {
      Alert.alert("Error", "You must be logged in to place an order");
      return;
    }

    if (!weightEstimate || parseFloat(weightEstimate) <= 0) {
      Alert.alert("Error", "Please enter a valid weight estimate");
      return;
    }

    // Check if pickup date is valid
    if (pickupDate < tomorrow) {
      Alert.alert("Error", "Pickup date must be in the future");
      return;
    }

    setLoading(true);

    try {
      // Combine date and time
      const combinedDateTime = new Date(pickupDate);
      combinedDateTime.setHours(
        pickupTime.getHours(),
        pickupTime.getMinutes(),
        0,
        0
      );

      // Format date and time for database
      const formattedDate = combinedDateTime.toISOString().split("T")[0];
      const formattedTime = `${String(combinedDateTime.getHours()).padStart(2, '0')}:${String(combinedDateTime.getMinutes()).padStart(2, '0')}:00`;

      const totalCost = calculatePrice();

      console.log("Submitting order with data:", {
        user_id: profile.id,
        pickup_date: formattedDate,
        pickup_time: formattedTime,
        laundry_type: laundryType,
        weight_estimate: parseFloat(weightEstimate),
        special_instructions: specialInstructions,
        total_cost: totalCost,
      });

      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            user_id: profile.id,
            pickup_date: formattedDate,
            pickup_time: formattedTime,
            laundry_type: laundryType,
            weight_estimate: parseFloat(weightEstimate),
            special_instructions: specialInstructions,
            status: "pending",
            total_cost: totalCost,
          },
        ])
        .select();

      if (error) {
        console.error("Order creation error:", error);
        throw error;
      }

      console.log("Order created successfully:", data);

      Alert.alert(
        "Order Placed",
        "Your laundry order has been successfully placed!",
        [
          {
            text: "View Order",
            onPress: () => {
              if (data && data[0]) {
                router.push({
                  pathname: "/(app)/order-details",
                  params: { id: data[0].id }
                });
              } else {
                router.push("/(app)/(tabs)");
              }
            },
          },
          {
            text: "Back to Home",
            onPress: () => router.push("/(app)/(tabs)"),
          },
        ]
      );
    } catch (error: any) {
      console.error("Error creating order:", error.message || error);
      Alert.alert("Error", "Failed to create order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "New Order",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push("/(app)/(tabs)")}>
              <ArrowLeft size={24} color="#1E293B" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Type</Text>
          <View style={styles.serviceTypeContainer}>
            <TouchableOpacity
              style={[
                styles.serviceTypeButton,
                laundryType === "regular" && styles.selectedServiceType,
              ]}
              onPress={() => setLaundryType("regular")}
            >
              <Text
                style={[
                  styles.serviceTypeText,
                  laundryType === "regular" && styles.selectedServiceTypeText,
                ]}
              >
                Regular Wash
              </Text>
              <Text
                style={[
                  styles.serviceTypePrice,
                  laundryType === "regular" && styles.selectedServiceTypeText,
                ]}
              >
                {formatCurrency(5.99)}/kg
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.serviceTypeButton,
                laundryType === "dry_clean" && styles.selectedServiceType,
              ]}
              onPress={() => setLaundryType("dry_clean")}
            >
              <Text
                style={[
                  styles.serviceTypeText,
                  laundryType === "dry_clean" && styles.selectedServiceTypeText,
                ]}
              >
                Dry Cleaning
              </Text>
              <Text
                style={[
                  styles.serviceTypePrice,
                  laundryType === "dry_clean" && styles.selectedServiceTypeText,
                ]}
              >
                {formatCurrency(9.99)}/kg
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.serviceTypeButton,
                laundryType === "express" && styles.selectedServiceType,
              ]}
              onPress={() => setLaundryType("express")}
            >
              <Text
                style={[
                  styles.serviceTypeText,
                  laundryType === "express" && styles.selectedServiceTypeText,
                ]}
              >
                Express
              </Text>
              <Text
                style={[
                  styles.serviceTypePrice,
                  laundryType === "express" && styles.selectedServiceTypeText,
                ]}
              >
                {formatCurrency(12.99)}/kg
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Details</Text>
          
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color="#64748B" />
            <Text style={styles.dateTimeButtonText}>
              {pickupDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Clock size={20} color="#64748B" />
            <Text style={styles.dateTimeButtonText}>
              {pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={pickupDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={tomorrow}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={pickupTime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
              minuteInterval={30}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight Estimate (kg)</Text>
          <TextInput
            style={styles.weightInput}
            value={weightEstimate}
            onChangeText={(text) => {
              // Allow only numbers and decimal point
              const filtered = text.replace(/[^0-9.]/g, "");
              setWeightEstimate(filtered);
            }}
            keyboardType="decimal-pad"
            placeholder="Enter estimated weight"
          />
          <View style={styles.infoBox}>
            <Info size={16} color="#64748B" />
            <Text style={styles.infoText}>
              Don't worry if you're not sure about the exact weight. We'll weigh your items when we pick them up and adjust the final price accordingly.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
          <TextInput
            style={styles.instructionsInput}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            placeholder="Any special instructions for handling your laundry"
            multiline
          />
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summarySectionTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service Type</Text>
            <Text style={styles.summaryValue}>
              {laundryType === "regular" ? "Regular Wash" : 
               laundryType === "dry_clean" ? "Dry Cleaning" : "Express"}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated Weight</Text>
            <Text style={styles.summaryValue}>{weightEstimate} kg</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pickup Date</Text>
            <Text style={styles.summaryValue}>{pickupDate.toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pickup Time</Text>
            <Text style={styles.summaryValue}>
              {pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Estimated Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(calculatePrice())}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Place Order</Text>
          )}
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
  section: {
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
  serviceTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    marginHorizontal: 4,
  },
  selectedServiceType: {
    borderColor: "#3B82F6",
    backgroundColor: "#EFF6FF",
  },
  serviceTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  serviceTypePrice: {
    fontSize: 12,
    color: "#64748B",
  },
  selectedServiceTypeText: {
    color: "#3B82F6",
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 12,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: "#334155",
    marginLeft: 12,
  },
  weightInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 8,
    flex: 1,
  },
  instructionsInput: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: "top",
  },
  summarySection: {
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
  summarySectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#64748B",
  },
  summaryValue: {
    fontSize: 16,
    color: "#334155",
    fontWeight: "500",
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
  submitButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});