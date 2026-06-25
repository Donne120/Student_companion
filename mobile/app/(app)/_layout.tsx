import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Font } from "@/constants/theme";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const tabs: { name: string; label: string; icon: IoniconName; iconActive: IoniconName }[] = [
  { name: "chat",          label: "Chat",      icon: "chatbubble-outline",    iconActive: "chatbubble" },
  { name: "opportunities", label: "Discover",  icon: "sparkles-outline",      iconActive: "sparkles" },
  { name: "news",          label: "News",      icon: "newspaper-outline",     iconActive: "newspaper" },
  { name: "profile",       label: "Me",        icon: "person-outline",        iconActive: "person" },
];

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.goldStrong,
        tabBarInactiveTintColor: "rgba(26,26,26,0.45)",
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.goldBorder,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === "ios" ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === "ios" ? 82 : 64,
        },
        tabBarLabelStyle: {
          fontFamily: Font.medium,
          fontSize: 11,
        },
      }}
    >
      {tabs.map(({ name, label, icon, iconActive }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: label,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? iconActive : icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
