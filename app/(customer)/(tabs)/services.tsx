import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Check } from "lucide-react-native";
import { SERVICES } from "@/types";
import { formatInr } from "@/utils/format";

export default function ServicesScreen() {
  const router = useRouter();

  const serviceImages = {
    wash_fold: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?q=80&w=2070&auto=format&fit=crop",
    wash_iron: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=2070&auto=format&fit=crop",
    bedsheets: "https://images.unsplash.com/photo-1521656693074-0ef32e80a5d5?q=80&w=2070&auto=format&fit=crop",
    quilts: "https://images.unsplash.com/photo-1584470179492-202c7c8a44a5?q=80&w=2070&auto=format&fit=crop",
    curtains: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069&auto=format&fit=crop",
    shoes: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?q=80&w=2079&auto=format&fit=crop"
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Services</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.servicesContainer}>
          {SERVICES.map((service) => (
            <TouchableOpacity
              key={service.service_type}
              style={[
                styles.serviceCard,
                service.popular && styles.popularServiceCard
              ]}
              onPress={() => router.push({
                pathname: "/(customer)/new-order",
                params: { type: service.service_type }
              })}
            >
              {service.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Most Popular</Text>
                </View>
              )}
              
              <View style={styles.serviceImageContainer}>
                <Image
                  source={{ uri: serviceImages[service.service_type as keyof typeof serviceImages] }}
                  style={styles.serviceImage}
                  contentFit="cover"
                />
              </View>
              
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>{service.name}</Text>
                <Text style={styles.servicePrice}>
                  {formatInr(service.price)}{service.unit}
                </Text>
                <Text style={styles.serviceDescription}>
                  {service.description}
                </Text>
                
                <View style={styles.featuresContainer}>
                  <View style={styles.featureItem}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.featureText}>Free Pickup & Delivery</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Check size={16} color="#10B981" />
                    <Text style={styles.featureText}>24-48 Hour Turnaround</Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => router.push({
                    pathname: "/(customer)/new-order",
                    params: { type: service.service_type }
                  })}
                >
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
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
  header: {
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
  scrollView: {
    flex: 1,
  },
  servicesContainer: {
    padding: 16,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  popularServiceCard: {
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  popularBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#3B82F6",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    zIndex: 1,
  },
  popularBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  serviceImageContainer: {
    height: 160,
    width: "100%",
  },
  serviceImage: {
    width: "100%",
    height: "100%",
  },
  serviceContent: {
    padding: 16,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#334155",
  },
  bookButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});