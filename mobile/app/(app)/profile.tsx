import { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, Alert, ScrollView, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Colors, Font, Radius } from "@/constants/theme";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.displayName ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const initials = (user?.displayName ?? user?.email ?? "A")
    .split(/[\s@]/).filter(Boolean).slice(0, 2)
    .map((s) => s[0]?.toUpperCase()).join("") || "A";

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await auth().currentUser?.updateProfile({ displayName: name.trim() });
      await firestore().collection("users").doc(user!.uid).set(
        { displayName: name.trim(), updatedAt: firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      setIsEditing(false);
    } catch {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: async () => {
        await logout();
        router.replace("/(auth)/login");
      }},
    ]);
  };

  const createdAt = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { year: "numeric", month: "long" })
    : null;

  const MENU_ITEMS = [
    { icon: "chatbubble-outline" as const, label: "Chat history", sub: "Your conversations are saved locally", onPress: () => {} },
    { icon: "shield-checkmark-outline" as const, label: "Privacy", sub: "Your data stays within ALU systems", onPress: () => {} },
    { icon: "information-circle-outline" as const, label: "About", sub: "Student Companion AI v1.0", onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        {!isEditing && (
          <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
            <Ionicons name="pencil-outline" size={18} color={Colors.goldStrong} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          {isEditing ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="Your display name"
                placeholderTextColor={Colors.inkFaint}
                autoFocus
              />
            </View>
          ) : (
            <Text style={styles.displayName}>{user?.displayName || "Add your name"}</Text>
          )}
          <Text style={styles.email}>{user?.email}</Text>
          {createdAt && <Text style={styles.memberSince}>Member since {createdAt}</Text>}
        </View>

        {/* Save / cancel when editing */}
        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setIsEditing(false); setName(user?.displayName ?? ""); }}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
              <Text style={styles.saveBtnText}>{isSaving ? "Saving…" : "Save changes"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu items */}
        <View style={styles.section}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={20} color={Colors.goldStrong} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.inkFaint} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.goldBorder },
  headerTitle: { fontFamily: Font.serif, fontSize: 28, color: Colors.ink },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  editBtnText: { fontFamily: Font.medium, fontSize: 14, color: Colors.goldStrong },
  scroll: { paddingBottom: 40 },
  avatarSection: { alignItems: "center", paddingVertical: 32, borderBottomWidth: 1, borderBottomColor: Colors.goldBorder },
  avatarImg: { width: 80, height: 80, borderRadius: 40, marginBottom: 14 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.goldSoft, borderWidth: 2, borderColor: Colors.goldBorder, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  avatarInitials: { fontFamily: Font.semibold, fontSize: 28, color: Colors.ink },
  nameEditRow: { width: "70%", marginBottom: 6 },
  nameInput: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.goldBorder, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 10, fontFamily: Font.regular, fontSize: 16, color: Colors.ink, textAlign: "center" },
  displayName: { fontFamily: Font.semibold, fontSize: 20, color: Colors.ink, marginBottom: 4 },
  email: { fontFamily: Font.regular, fontSize: 14, color: Colors.inkMuted },
  memberSince: { fontFamily: Font.regular, fontSize: 12, color: Colors.inkFaint, marginTop: 4 },
  editActions: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingVertical: 16 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.goldBorder, alignItems: "center" },
  cancelBtnText: { fontFamily: Font.medium, fontSize: 15, color: Colors.ink },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: Radius.md, backgroundColor: Colors.gold, alignItems: "center" },
  saveBtnText: { fontFamily: Font.semibold, fontSize: 15, color: Colors.ink },
  section: { marginTop: 20, marginHorizontal: 16, backgroundColor: Colors.white, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.goldBorder, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.goldBorder },
  menuIconWrap: { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.goldSoft, alignItems: "center", justifyContent: "center", marginRight: 12 },
  menuText: { flex: 1 },
  menuLabel: { fontFamily: Font.medium, fontSize: 15, color: Colors.ink },
  menuSub: { fontFamily: Font.regular, fontSize: 12, color: Colors.inkMuted, marginTop: 2 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24, marginHorizontal: 16, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1, borderColor: "#FEE2E2", backgroundColor: "#FFF5F5" },
  logoutText: { fontFamily: Font.semibold, fontSize: 15, color: Colors.error },
});
