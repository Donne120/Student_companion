import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/theme";

export default function Index() {
  const { user, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (user) {
      router.replace("/(app)/chat");
    } else {
      router.replace("/(auth)/login");
    }
  }, [isReady, user]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.ink, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={Colors.gold} size="large" />
    </View>
  );
}
