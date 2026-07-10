import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Colors, Font, Radius } from "@/constants/theme";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { sendPasswordReset } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setError("");
    if (!email) { setError("Please enter your email"); return; }
    setIsLoading(true);
    try {
      await sendPasswordReset(email.trim().toLowerCase());
      setSent(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.goldBar} />
      <View style={styles.container}>
        <View style={styles.brand}>
          <Image source={require("@/assets/icon.png")} style={styles.logo} />
          <Text style={styles.brandText}>Student Companion AI</Text>
        </View>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={styles.heading}>Check your inbox</Text>
            <Text style={styles.body}>
              If <Text style={styles.bold}>{email}</Text> is registered, you'll receive a reset link shortly.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace("/(auth)/login")}>
              <Text style={styles.primaryBtnText}>Back to sign in</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.heading}>Forgot password?</Text>
            <Text style={styles.body}>Enter your ALU email and we'll send you a reset link.</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Text style={styles.label}>ALU email</Text>
            <TextInput style={styles.input} placeholder="your.name@alustudent.com" placeholderTextColor={Colors.inkFaint} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoFocus />

            <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={isLoading} activeOpacity={0.85}>
              {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.primaryBtnText}>Send reset link</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Remembered it? </Text>
              <Link href="/(auth)/login" style={styles.linkText}>Sign in</Link>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  goldBar: { height: 4, backgroundColor: Colors.gold },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 48 },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 40 },
  logo: { width: 44, height: 44, borderRadius: 12 },
  brandText: { fontFamily: Font.semibold, fontSize: 15, color: Colors.ink },
  heading: { fontFamily: Font.serif, fontSize: 36, color: Colors.ink, marginBottom: 8 },
  body: { fontFamily: Font.regular, fontSize: 15, color: Colors.inkMuted, marginBottom: 32 },
  bold: { fontFamily: Font.semibold, color: Colors.ink },
  errorText: { fontFamily: Font.regular, fontSize: 13, color: Colors.error, marginBottom: 16, backgroundColor: "#FEF2F2", padding: 12, borderRadius: Radius.md },
  label: { fontFamily: Font.medium, fontSize: 14, color: Colors.ink, marginBottom: 6 },
  input: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.goldBorder, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, fontFamily: Font.regular, color: Colors.ink, marginBottom: 20 },
  primaryBtn: { backgroundColor: Colors.ink, borderRadius: Radius.md, paddingVertical: 15, alignItems: "center", marginBottom: 24 },
  primaryBtnText: { fontFamily: Font.semibold, fontSize: 16, color: Colors.white },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { fontFamily: Font.regular, fontSize: 14, color: Colors.inkMuted },
  linkText: { fontFamily: Font.semibold, fontSize: 14, color: Colors.goldStrong },
  successBox: { alignItems: "center", gap: 12 },
  successIcon: { fontSize: 48, marginBottom: 8 },
});
