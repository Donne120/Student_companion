import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Linking, ActivityIndicator, SafeAreaView, RefreshControl, Image,
} from "react-native";
import { Colors, Font, Radius } from "@/constants/theme";
import { API_URL, authHeader } from "@/config/api";

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  url?: string;
  imageUrl?: string;
};

const FALLBACK: NewsItem[] = [
  { id: "1", title: "ALU Celebrates Class of 2026 Graduation", summary: "Over 200 students graduated from ALU Rwanda in the Class of 2026 ceremony held on campus.", category: "Campus Life", date: "June 2026", imageUrl: "https://alustudentcompanion.vercel.app/campus.png" },
  { id: "2", title: "New Leadership Track Launches This Term", summary: "ALU introduces a new leadership development curriculum designed in partnership with industry leaders across Africa.", category: "Academics", date: "May 2026" },
  { id: "3", title: "Student Innovation Hub Opens", summary: "A dedicated co-working and prototyping space is now open to all ALU students for entrepreneurial projects.", category: "Innovation", date: "April 2026", imageUrl: "https://alustudentcompanion.vercel.app/study.png" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Campus Life": Colors.gold,
  "Academics": "#6366F1",
  "Innovation": "#059669",
  "Leadership": "#DC2626",
};

export default function NewsScreen() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const headers = await authHeader().catch(() => ({} as Record<string, string>));
      const res = await fetch(`${API_URL}/api/news`, { headers });
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : FALLBACK);
      } else {
        setItems(FALLBACK);
      }
    } catch {
      setItems(FALLBACK);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const renderItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => item.url && Linking.openURL(item.url)}
    >
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardMeta}>
          <View style={[styles.catBadge, { backgroundColor: (CATEGORY_COLORS[item.category] ?? Colors.gold) + "20" }]}>
            <Text style={[styles.catText, { color: CATEGORY_COLORS[item.category] ?? Colors.gold }]}>
              {item.category}
            </Text>
          </View>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSummary} numberOfLines={3}>{item.summary}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>News</Text>
        <Text style={styles.headerSub}>What's happening at ALU</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.gold} size="large" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={Colors.gold}
            />
          }
          ListEmptyComponent={<Text style={styles.empty}>No news available right now.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.goldBorder },
  headerTitle: { fontFamily: Font.serif, fontSize: 28, color: Colors.ink },
  headerSub: { fontFamily: Font.regular, fontSize: 13, color: Colors.inkMuted, marginTop: 2 },
  list: { padding: 16, gap: 16 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.goldBorder, overflow: "hidden" },
  cardImage: { width: "100%", height: 160, resizeMode: "cover" },
  cardBody: { padding: 16 },
  cardMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  catText: { fontFamily: Font.medium, fontSize: 11 },
  dateText: { fontFamily: Font.regular, fontSize: 12, color: Colors.inkFaint },
  cardTitle: { fontFamily: Font.semibold, fontSize: 17, color: Colors.ink, marginBottom: 6, lineHeight: 24 },
  cardSummary: { fontFamily: Font.regular, fontSize: 14, color: Colors.inkMuted, lineHeight: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { fontFamily: Font.regular, fontSize: 15, color: Colors.inkMuted, textAlign: "center", marginTop: 40 },
});
