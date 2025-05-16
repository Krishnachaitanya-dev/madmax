import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setSession } = useAuthStore();

  // For testing purposes - create admin user
  const createAdminUser = async () => {
    try {
      setLoading(true);
      
      // Check if admin@example.com already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'admin@example.com')
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (existingUsers && existingUsers.length > 0) {
        Alert.alert("Admin User Exists", "Admin user already exists. Email: admin@example.com, Password: admin123");
        return;
      }
      
      // Create admin user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'admin@example.com',
        password: 'admin123',
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Create admin profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: 'admin@example.com',
              full_name: 'Admin User',
              phone_number: '123-456-7890',
              is_admin: true,
            },
          ]);
          
        if (profileError) throw profileError;
        
        Alert.alert(
          "Admin User Created",
          "Admin user has been created successfully.\n\nEmail: admin@example.com\nPassword: admin123"
        );
      }
    } catch (error: any) {
      console.error("Error creating admin user:", error);
      Alert.alert("Error", "Failed to create admin user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Attempting login with:", { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      console.log("Login successful, session:", data.session?.user.id);
      setSession(data.session);
      
      // Navigate to app
      router.replace("/(app)/(tabs)");
    } catch (error: any) {
      console.error("Login error details:", error);
      setError(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  // Quick login for testing
  const handleQuickLogin = () => {
    setEmail("admin@example.com");
    setPassword("admin123");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?q=80&w=2071&auto=format&fit=crop" }}
              style={styles.logo}
              contentFit="cover"
            />
            <Text style={styles.appName}>WashMate</Text>
            <Text style={styles.tagline}>Your laundry, simplified</Text>
          </View>

          <View style={styles.formContainer}>
            {error ? (
              <View style={styles.errorContainer}>
                <AlertCircle size={20} color="#FF3B30" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
            
            {/* Testing tools section */}
            <View style={styles.testingSection}>
              <Text style={styles.testingSectionTitle}>Testing Tools</Text>
              
              <TouchableOpacity
                style={styles.testingButton}
                onPress={handleQuickLogin}
                disabled={loading}
              >
                <Text style={styles.testingButtonText}>Quick Admin Login</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.testingButton}
                onPress={createAdminUser}
                disabled={loading}
              >
                <Text style={styles.testingButtonText}>Create Admin User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 16,
    color: "#3B82F6",
  },
  tagline: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 8,
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#334155",
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  forgotPassword: {
    color: "#3B82F6",
    textAlign: "right",
    marginBottom: 24,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  signupText: {
    color: "#64748B",
    fontSize: 14,
  },
  signupLink: {
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 14,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEEEE",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF3B30",
    marginLeft: 8,
    flex: 1,
  },
  testingSection: {
    marginTop: 40,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  testingSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 12,
    textAlign: "center",
  },
  testingButton: {
    backgroundColor: "#E2E8F0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  testingButtonText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "500",
  },
});