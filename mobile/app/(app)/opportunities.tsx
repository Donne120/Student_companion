import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Linking, ActivityIndicator, SafeAreaView, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Font, Radius } from "@/constants/theme";
import { API_URL, authHeader } from "@/config/api";

type Opportunity = {
  id: string;
  title: string;
  organization: string;
  type: "scholarship" | "internship" | "fellowship" | "program" | "other";
  deadline?: string;
  url?: string;
  description: string;
  location?: string;
};

const TYPE_COLOR: Record<string, string> = {
  scholarship: "#D4AF37",
  internship:  "#6366F1",
  fellowship:  "#059669",
  program:     "#DC2626",
  other:       "#64748B",
};

const TYPE_ICON: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  scholarship: "school-outline",
  internship:  "briefcase-outline",
  fellowship:  "ribbon-outline",
  program:     "telescope-outline",
  other:       "star-outline",
};

// Fallback data shown when backend is unreachable
const FALLBACK: Opportunity[] = [
  { id: "1", title: "Mastercard Foundation Scholars Program", organization: "Mastercard Foundation", type: "scholarship", deadline: "Rolling", description: "Full scholarships for academically talented yet economically disadvantaged young Africans.", url: "https://mastercardfdn.org/all/scholars/" },
  { id: "2", title: "ALU Innovation Challenge", organization: "African Leadership University", type: "program", deadline: "See ALU portal", description: "Annual challenge for ALU students to pitch solutions to real African problems.", url: "https://alueducation.com" },
  { id: "3", title: "Google Africa Developer Scholarship", organization: "Google / Andela", type: "fellowship", deadline: "Annual", description: "Training scholarships for front-end, mobile, and cloud tracks.", url: "https://developers.google.com/africa" },
  { id: "4", title: "Tony Elumelu Foundation Internship", organization: "Tony Elumelu Foundation", type: "internship", deadline: "January each year", description: "Pan-African internship programme open to university students.", url: "https://www.tonyelumelufoundation.org" },
];

export default function OpportunitiesScreen() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    try {
      const headers = await authHeader().catch(() => ({} as Record<string, string>));
      const res = await fetch(`${API_URL}/api/opportunities`, { headers });
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

  const TYPES = ["all", "scholarship", "internship", "fellowship", "program"];
  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  const renderItem = ({ item }: { item: Opportunity }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => item.url && Linking.openURL(item.url)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.typeBadge, { backgroundColor: (TYPE_COLOR[item.type] ?? "#64748B") + "20" }]}>
          <Ionicons name={TYPE_ICON[item.type] ?? "star-outline"} size={12} color={TYPE_COLOR[item.type] ?? "#64748B"} />
          <Text style={[styles.typeText, { color: TYPE_COLOR[item.type] ?? "#64748B" }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
        </View>
        {item.deadline && (
          <View style={styles.deadlineBadge}>
            <Ionicons name="time-outline" size={11} color={Colors.inkMuted} />
            <Text style={styles.deadlineText}>{item.deadline}</Text>
          </View>
        )}
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardOrg}>{item.organization}</Text>
      <Text style={styles.cardDesc} numberOfLines={3}>{item.description}</Text>
      {item.url && (
        <View style={styles.cardFooter}>
          <Ionicons name="open-outline" size={13} color={Colors.goldStrong} />
          <Text style={styles.cardLink}>Learn more</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Opportunities</Text>
        <Text style={styles.headerSub}>Scholarships, internships & programs</Text>
      </View>

      {/* Filter chips */}
      <FlatList
        horizontal
        data={TYPES}
        keyExtractor={(t) => t}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterBar}
        renderItem={({ item: t }) => (
          <TouchableOpacity
            style={[styles.chip, filter === t && styles.chipActive]}
            onPress={() => setFilter(t)}
          >
            <Text style={[styles.chipText, filter === t && styles.chipTextActive]}>
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.gold} size="large" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.gold} />}
          ListEmptyComponent={<Text style={styles.empty}>No opportunities found.</Text>}
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
  filterBar: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.goldBorder, backgroundColor: Colors.white },
  chipActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  chipText: { fontFamily: Font.medium, fontSize: 13, color: Colors.inkMuted },
  chipTextActive: { color: Colors.white },
  list: { padding: 16, gap: 14 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.goldBorder, padding: 16 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  typeText: { fontFamily: Font.medium, fontSize: 11 },
  deadlineBadge: { flexDirection: "row", alignItems: "center", gap: 3, marginLeft: "auto" },
  deadlineText: { fontFamily: Font.regular, fontSize: 11, color: Colors.inkMuted },
  cardTitle: { fontFamily: Font.semibold, fontSize: 16, color: Colors.ink, marginBottom: 3 },
  cardOrg: { fontFamily: Font.regular, fontSize: 13, color: Colors.goldStrong, marginBottom: 8 },
  cardDesc: { fontFamily: Font.regular, fontSize: 14, color: Colors.inkMuted, lineHeight: 20 },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 12 },
  cardLink: { fontFamily: Font.medium, fontSize: 13, color: Colors.goldStrong },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { fontFamily: Font.regular, fontSize: 15, color: Colors.inkMuted, textAlign: "center", marginTop: 40 },
});
