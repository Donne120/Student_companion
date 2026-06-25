import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Colors, Font, Radius } from "@/constants/theme";

const strengthLabel = (n: number) => (n < 3 ? "Weak" : n < 5 ? "Good" : "Strong");
const strengthColor = (n: number) => (n < 3 ? "#F87171" : n < 5 ? "#FBBF24" : "#34D399");

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const router = useRouter();

  const strength = (() => {
    let s = 0;
    if (password.length > 0) s++;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const handleSignup = async () => {
    setError("");
    if (!name || !email || !password) { setError("Please fill in all fields"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setIsLoading(true);
    try {
      await signup(email.trim().toLowerCase(), password, name.trim());
      router.replace("/(app)/chat");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.goldBar} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Image source={require("@/assets/icon.png")} style={styles.logo} />
          <Text style={styles.brandText}>ALU Student Companion</Text>
        </View>

        <Text style={styles.heading}>Create your account</Text>
        <Text style={styles.subheading}>Free for every ALU student. Takes less than a minute.</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.label}>Full name</Text>
        <TextInput style={styles.input} placeholder="As it appears on your student ID" placeholderTextColor={Colors.inkFaint} value={name} onChangeText={setName} autoCapitalize="words" />

        <Text style={styles.label}>ALU email</Text>
        <TextInput style={styles.input} placeholder="your.name@alustudent.com" placeholderTextColor={Colors.inkFaint} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
        <Text style={styles.hint}>Must end in @alustudent.com or @alueducation.com</Text>

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="At least 8 characters" placeholderTextColor={Colors.inkFaint} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
            <Text style={styles.eyeText}>{showPassword ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>

        {/* Strength meter */}
        {password.length > 0 && (
          <View style={styles.strengthRow}>
            {[1,2,3,4,5].map((l) => (
              <View key={l} style={[styles.strengthBar, { backgroundColor: strength >= l ? strengthColor(strength) : Colors.goldBorder }]} />
            ))}
            <Text style={[styles.strengthLabel, { color: strengthColor(strength) }]}>{strengthLabel(strength)}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSignup} disabled={isLoading} activeOpacity={0.85}>
          {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.primaryBtnText}>Create account</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" style={styles.linkText}>Sign in</Link>
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
  heading: { fontFamily: Font.serif, fontSize: 36, color: Colors.ink, marginBottom: 8 },
  subheading: { fontFamily: Font.regular, fontSize: 15, color: Colors.inkMuted, marginBottom: 32 },
  errorText: { fontFamily: Font.regular, fontSize: 13, color: Colors.error, marginBottom: 16, backgroundColor: "#FEF2F2", padding: 12, borderRadius: Radius.md },
  label: { fontFamily: Font.medium, fontSize: 14, color: Colors.ink, marginBottom: 6 },
  hint: { fontFamily: Font.regular, fontSize: 12, color: Colors.inkFaint, marginTop: -10, marginBottom: 16 },
  input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.goldBorder, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, fontFamily: Font.regular, color: Colors.ink, marginBottom: 16 },
  passwordRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  eyeBtn: { paddingHorizontal: 8, paddingVertical: 13 },
  eyeText: { fontFamily: Font.medium, fontSize: 13, color: Colors.inkMuted },
  strengthRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 20 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontFamily: Font.medium, fontSize: 12, marginLeft: 6, minWidth: 36 },
  primaryBtn: { backgroundColor: Colors.ink, borderRadius: Radius.md, paddingVertical: 15, alignItems: "center", marginTop: 8, marginBottom: 24 },
  primaryBtnText: { fontFamily: Font.semibold, fontSize: 16, color: Colors.white },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontFamily: Font.regular, fontSize: 14, color: Colors.inkMuted },
  linkText: { fontFamily: Font.semibold, fontSize: 14, color: Colors.goldStrong },
});
