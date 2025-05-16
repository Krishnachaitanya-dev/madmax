import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Bell, HelpCircle, Shield, Mail, Star, ChevronRight } from "lucide-react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdatesEnabled, setEmailUpdatesEnabled] = useState(true);

  const handleContactSupport = () => {
    Alert.alert(
      "Contact Support",
      "Our support team is available 24/7 to assist you.",
      [
        {
          text: "Call Support",
          onPress: () => console.log("Call support pressed"),
        },
        {
          text: "Email",
          onPress: () => console.log("Email support pressed"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      "Rate Our App",
      "Thank you for using WashMate! Would you like to rate our app?",
      [
        {
          text: "Not Now",
          style: "cancel",
        },
        {
          text: "Rate Now",
          onPress: () => console.log("Rate app pressed"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Bell size={20} color="#64748B" style={styles.settingIcon} />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
              thumbColor={notificationsEnabled ? "#3B82F6" : "#F1F5F9"}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Mail size={20} color="#64748B" style={styles.settingIcon} />
              <Text style={styles.settingText}>Email Updates</Text>
            </View>
            <Switch
              value={emailUpdatesEnabled}
              onValueChange={setEmailUpdatesEnabled}
              trackColor={{ false: "#E2E8F0", true: "#BFDBFE" }}
              thumbColor={emailUpdatesEnabled ? "#3B82F6" : "#F1F5F9"}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleContactSupport}
          >
            <View style={styles.settingInfo}>
              <HelpCircle size={20} color="#64748B" style={styles.settingIcon} />
              <Text style={styles.settingText}>Contact Support</Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert("Privacy Policy", "Our privacy policy details would be shown here.")}
          >
            <View style={styles.settingInfo}>
              <Shield size={20} color="#64748B" style={styles.settingIcon} />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert("Terms of Service", "Our terms of service would be shown here.")}
          >
            <View style={styles.settingInfo}>
              <Shield size={20} color="#64748B" style={styles.settingIcon} />
              <Text style={styles.settingText}>Terms of Service</Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleRateApp}
          >
            <View style={styles.settingInfo}>
              <Star size={20} color="#64748B" style={styles.settingIcon} />
              <Text style={styles.settingText}>Rate Our App</Text>
            </View>
            <ChevronRight size={20} color="#CBD5E1" />
          </TouchableOpacity>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingText}>App Version</Text>
            </View>
            <Text style={styles.versionText}>1.0.0</Text>
          </View>
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
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: "#334155",
  },
  versionText: {
    fontSize: 14,
    color: "#64748B",
  },
});