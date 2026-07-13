import { useState, useRef, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Image, SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { Colors, Font, Radius } from "@/constants/theme";
import { sendMessage, Message } from "@/config/api";
import { useAuth } from "@/context/AuthContext";

const STORAGE_KEY = "alu_mobile_messages";
const WELCOME: Message = {
  id: "welcome",
  text: "# Welcome to Student Companion AI 👋\n\nI'm your AI-powered peer assistant. Ask me anything about academics, campus life, policies, or opportunities at ALU. Or just say hi!",
  isAi: true,
  timestamp: Date.now(),
};

const SUGGESTIONS = [
  "What is ALU's grading policy?",
  "When does the next term start?",
  "How do I contact student housing?",
  "What can you help me with?",
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<FlatList>(null);
  const { user } = useAuth();

  // Load persisted messages on focus
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
        if (raw) {
          try { setMessages(JSON.parse(raw)); } catch {}
        }
      });
    }, [])
  );

  const persist = (msgs: Message[]) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-100)));
  };

  const handleSend = async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || isLoading) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), text: query, isAi: false, timestamp: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    persist(next);
    setIsLoading(true);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await sendMessage(query, messages.slice(-10));
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: response, isAi: true, timestamp: Date.now() };
      const withAi = [...next, aiMsg];
      setMessages(withAi);
      persist(withAi);
    } catch (e) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble reaching the ALU knowledge base right now. Please try again.",
        isAi: true,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME]);
    AsyncStorage.removeItem(STORAGE_KEY);
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.isAi ? styles.aiRow : styles.userRow]}>
      {item.isAi && (
        <Image source={require("@/assets/icon.png")} style={styles.avatar} />
      )}
      <View style={[styles.bubble, item.isAi ? styles.aiBubble : styles.userBubble]}>
        {item.isAi ? (
          <Markdown style={markdownStyles}>{item.text}</Markdown>
        ) : (
          <Text style={styles.userText}>{item.text}</Text>
        )}
      </View>
    </View>
  );

  const displayName = user?.displayName?.split(" ")[0] ?? "there";

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require("@/assets/icon.png")} style={styles.headerLogo} />
          <View>
            <Text style={styles.headerTitle}>Companion</Text>
            <Text style={styles.headerSub}>Hi {displayName} 👋</Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn}>
          <Ionicons name="create-outline" size={22} color={Colors.inkMuted} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.thinkingRow}>
                <Image source={require("@/assets/icon.png")} style={styles.avatar} />
                <View style={[styles.bubble, styles.aiBubble]}>
                  <ActivityIndicator color={Colors.gold} size="small" />
                </View>
              </View>
            ) : messages.length === 1 ? (
              <View style={styles.suggestions}>
                {SUGGESTIONS.map((s) => (
                  <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => handleSend(s)}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          }
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask the Companion anything…"
            placeholderTextColor={Colors.inkFaint}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={2000}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { opacity: input.trim() && !isLoading ? 1 : 0.4 }]}
            onPress={() => handleSend()}
            disabled={!input.trim() || isLoading}
          >
            <Ionicons name="arrow-up" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>The Companion can make mistakes. Verify important information.</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const markdownStyles = {
  body: { fontFamily: Font.regular, fontSize: 15, color: Colors.ink, lineHeight: 24 },
  heading1: { fontFamily: Font.serif, fontSize: 20, color: Colors.ink, marginBottom: 8 },
  heading2: { fontFamily: Font.serif, fontSize: 17, color: Colors.ink, marginBottom: 6 },
  strong: { fontFamily: Font.bold },
  link: { color: Colors.goldStrong },
  bullet_list_icon: { color: Colors.gold },
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.goldBorder, backgroundColor: Colors.white },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerLogo: { width: 36, height: 36, borderRadius: 10 },
  headerTitle: { fontFamily: Font.semibold, fontSize: 16, color: Colors.ink },
  headerSub: { fontFamily: Font.regular, fontSize: 12, color: Colors.inkMuted },
  clearBtn: { padding: 6 },
  list: { paddingVertical: 16, paddingHorizontal: 12, paddingBottom: 8 },
  msgRow: { flexDirection: "row", marginBottom: 14, alignItems: "flex-end", gap: 8 },
  aiRow: { justifyContent: "flex-start" },
  userRow: { justifyContent: "flex-end" },
  avatar: { width: 28, height: 28, borderRadius: 8, flexShrink: 0 },
  bubble: { maxWidth: "82%", borderRadius: Radius.lg, padding: 12 },
  aiBubble: { backgroundColor: Colors.goldSoft, borderWidth: 1, borderColor: Colors.goldBorder },
  userBubble: { backgroundColor: Colors.userBubble },
  userText: { fontFamily: Font.regular, fontSize: 15, color: Colors.ink, lineHeight: 22 },
  thinkingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 12, marginBottom: 14 },
  suggestions: { paddingHorizontal: 4, paddingTop: 8, gap: 8 },
  suggestionChip: { backgroundColor: Colors.goldSoft, borderWidth: 1, borderColor: Colors.goldBorder, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 10 },
  suggestionText: { fontFamily: Font.regular, fontSize: 14, color: Colors.ink },
  inputBar: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.goldBorder, gap: 8, backgroundColor: Colors.white },
  textInput: { flex: 1, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.goldBorder, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, fontFamily: Font.regular, color: Colors.ink, maxHeight: 120 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.ink, alignItems: "center", justifyContent: "center" },
  disclaimer: { fontFamily: Font.regular, fontSize: 11, color: Colors.inkFaint, textAlign: "center", paddingBottom: 6 },
});
