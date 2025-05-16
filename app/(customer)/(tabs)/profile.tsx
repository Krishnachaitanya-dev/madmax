import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { supabase } from "@/lib/supabase";
import { LogOut, User, MapPin, Phone, Mail, Edit2, CheckCircle2, ArrowLeft } from "lucide-react-native";
import { Profile } from "@/types";

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, setProfile, signOut } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone_number: profile?.phone_number || "",
    address: profile?.address || "",
  });

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      console.log("Signing out...");
      await signOut();
      console.log("Sign out successful");
      // Navigation is now handled in the signOut function in the auth store
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!formData.full_name || !formData.phone_number) {
      Alert.alert("Error", "Name and phone number are required");
      return;
    }

    if (!profile?.id) {
      Alert.alert("Error", "User profile not found");
      return;
    }

    setLoading(true);

    try {
      console.log("Updating profile for user:", profile.id);
      console.log("Update data:", formData);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          address: formData.address,
        })
        .eq("id", profile.id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }

      // Update local state with the new profile data
      if (profile) {
        const updatedProfile: Profile = {
          ...profile,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          address: formData.address,
        };
        setProfile(updatedProfile);
      }

      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error.message || error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", onPress: handleSignOut, style: "destructive" },
      ]
    );
  };

  const goToLogin = () => {
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Profile</Text>
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Edit2 size={18} color="#3B82F6" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={40} color="#3B82F6" />
            </View>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.full_name}
                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                placeholder="Enter your full name"
              />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone_number}
                onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.addressInput]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Enter your address"
                multiline
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditing(false);
                    setFormData({
                      full_name: profile?.full_name || "",
                      phone_number: profile?.phone_number || "",
                      address: profile?.address || "",
                    });
                  }}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <View style={styles.saveButtonContent}>
                      <CheckCircle2 size={18} color="#fff" />
                      <Text style={styles.saveButtonText}>Save</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{profile?.full_name || "No name set"}</Text>
              <Text style={styles.userEmail}>{profile?.email || ""}</Text>

              <View style={styles.infoItem}>
                <Phone size={20} color="#64748B" style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  {profile?.phone_number || "No phone number added"}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <MapPin size={20} color="#64748B" style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  {profile?.address || "No address added"}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Mail size={20} color="#64748B" style={styles.infoIcon} />
                <Text style={styles.infoText}>{profile?.email || ""}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push("/(customer)/(tabs)/orders")}
          >
            <Text style={styles.settingsItemText}>Order History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => router.push("/(customer)/change-password")}
          >
            <Text style={styles.settingsItemText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsItem, styles.backToLoginButton]}
            onPress={goToLogin}
          >
            <ArrowLeft size={20} color="#3B82F6" style={styles.backIcon} />
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingsItem, styles.signOutButton]}
            onPress={confirmSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <ActivityIndicator size="small" color="#FF3B30" style={styles.signOutIcon} />
            ) : (
              <LogOut size={20} color="#FF3B30" style={styles.signOutIcon} />
            )}
            <Text style={styles.signOutText}>
              {signingOut ? "Signing Out..." : "Sign Out"}
            </Text>
          </TouchableOpacity>
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
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButtonText: {
    color: "#3B82F6",
    fontWeight: "600",
    marginLeft: 4,
  },
  profileSection: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0E7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#334155",
    flex: 1,
  },
  settingsSection: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 16,
  },
  settingsItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  settingsItemText: {
    fontSize: 16,
    color: "#334155",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0,
  },
  signOutIcon: {
    marginRight: 12,
  },
  signOutText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "600",
  },
  backToLoginButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backIcon: {
    marginRight: 12,
  },
  backToLoginText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
  },
  editForm: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  addressInput: {
    height: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#64748B",
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
});