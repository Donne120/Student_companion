import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Colors, Font, Radius } from "@/constants/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields"); return; }
    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace("/(app)/chat");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Gold top bar */}
      <View style={styles.goldBar} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo + wordmark */}
        <View style={styles.brand}>
          <Image source={require("@/assets/icon.png")} style={styles.logo} />
          <Text style={styles.brandText}>ALU Student Companion</Text>
        </View>

        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subheading}>Sign in to continue your conversation.</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Email */}
        <Text style={styles.label}>ALU email</Text>
        <TextInput
          style={styles.input}
          placeholder="your.name@alustudent.com"
          placeholderTextColor={Colors.inkFaint}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        {/* Password */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>Password</Text>
          <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
            Forgot password?
          </Link>
        </View>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Enter your password"
            placeholderTextColor={Colors.inkFaint}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="password"
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword((v) => !v)}
          >
            <Text style={styles.eyeText}>{showPassword ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>

        {/* Sign in button */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.primaryBtnText}>Sign in</Text>
          )}
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to the Companion? </Text>
          <Link href="/(auth)/signup" style={styles.linkText}>
            Create an account
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  goldBar: { height: 4, backgroundColor: Colors.gold },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 48, paddingBottom: 40 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 40 },
  logo: { width: 44, height: 44, borderRadius: 12 },
  brandText: { fontFamily: Font.semibold, fontSize: 15, color: Colors.ink },
  heading: { fontFamily: Font.serif, fontSize: 38, color: Colors.ink, marginBottom: 8 },
  subheading: { fontFamily: Font.regular, fontSize: 15, color: Colors.inkMuted, marginBottom: 32 },
  errorText: { fontFamily: Font.regular, fontSize: 13, color: Colors.error, marginBottom: 16, backgroundColor: "#FEF2F2", padding: 12, borderRadius: Radius.md },
  label: { fontFamily: Font.medium, fontSize: 14, color: Colors.ink, marginBottom: 6 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  forgotLink: { fontFamily: Font.regular, fontSize: 13, color: Colors.goldStrong },
  input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.goldBorder, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, fontFamily: Font.regular, color: Colors.ink, marginBottom: 16 },
  passwordRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24 },
  eyeBtn: { paddingHorizontal: 8, paddingVertical: 13 },
  eyeText: { fontFamily: Font.medium, fontSize: 13, color: Colors.inkMuted },
  primaryBtn: { backgroundColor: Colors.ink, borderRadius: Radius.md, paddingVertical: 15, alignItems: "center", marginBottom: 24 },
  primaryBtnText: { fontFamily: Font.semibold, fontSize: 16, color: Colors.white },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontFamily: Font.regular, fontSize: 14, color: Colors.inkMuted },
  linkText: { fontFamily: Font.semibold, fontSize: 14, color: Colors.goldStrong },
});
