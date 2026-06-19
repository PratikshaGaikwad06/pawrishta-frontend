import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { dogPlaceholderColor } from "@/utils/dogColors";

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { chats, sendMessage, requests, nearbyDogs } = useApp();

  const [text, setText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const request = requests.find((r) => r.id === matchId);
  const dog = nearbyDogs.find((d) => d.id === request?.fromDogId) ?? request?.fromDog;
  const messages = chats[matchId ?? ""] ?? [];
  const reversed = [...messages].reverse();
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || !matchId) return;
    Haptics.selectionAsync();
    sendMessage(matchId, trimmed);
    setText("");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 8,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={[styles.headerAvatar, { backgroundColor: dogPlaceholderColor(dog?.id ?? ""), borderRadius: 20 }]}>
          <MaterialCommunityIcons name="dog" size={20} color="rgba(255,255,255,0.9)" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.foreground }]}>{dog?.name ?? "Dog"}</Text>
          <Text style={[styles.headerBreed, { color: colors.mutedForeground }]}>
            {dog?.breed ?? ""}
          </Text>
        </View>
        <View style={[styles.matchedBadge, { backgroundColor: colors.success + "20", borderRadius: 20 }]}>
          <Ionicons name="heart" size={12} color={colors.success} />
          <Text style={[styles.matchedText, { color: colors.success }]}>Matched</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={reversed}
        keyExtractor={(item) => item.id}
        inverted
        contentContainerStyle={[styles.messageList, { paddingBottom: 16 }]}
        scrollEnabled={!!reversed.length}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={() => (
          <View style={styles.emptyChat}>
            <Ionicons name="chatbubbles-outline" size={44} color={colors.mutedForeground} />
            <Text style={[styles.emptyChatText, { color: colors.mutedForeground }]}>
              Say hello to {dog?.name ?? "them"}!
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isMe = item.fromOwnerId === "me";
          return (
            <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
              <View
                style={[
                  styles.bubble,
                  {
                    backgroundColor: isMe ? colors.primary : colors.card,
                    borderRadius: colors.radius,
                    borderColor: isMe ? "transparent" : colors.border,
                    borderWidth: isMe ? 0 : 1,
                  },
                ]}
              >
                <Text style={[styles.bubbleText, { color: isMe ? "#fff" : colors.foreground }]}>
                  {item.text}
                </Text>
                <Text
                  style={[
                    styles.bubbleTime,
                    { color: isMe ? "rgba(255,255,255,0.65)" : colors.mutedForeground },
                  ]}
                >
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            </View>
          );
        }}
      />

      {/* Input */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: bottomPadding + 8,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: colors.foreground, backgroundColor: colors.muted, borderRadius: colors.radius },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={colors.mutedForeground}
          value={text}
          onChangeText={setText}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            { backgroundColor: text.trim() ? colors.primary : colors.muted, borderRadius: colors.radius },
          ]}
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={20} color={text.trim() ? "#fff" : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerAvatar: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  headerBreed: { fontSize: 12, fontFamily: "Inter_400Regular" },
  matchedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  matchedText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexGrow: 1,
  },
  messageRow: {
    marginBottom: 8,
    alignItems: "flex-start",
  },
  messageRowMe: { alignItems: "flex-end" },
  bubble: {
    maxWidth: "80%",
    padding: 12,
    gap: 4,
  },
  bubbleText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 21 },
  bubbleTime: { fontSize: 10, fontFamily: "Inter_400Regular", alignSelf: "flex-end" },
  emptyChat: {
    alignItems: "center",
    gap: 10,
    paddingTop: 80,
    transform: [{ scaleY: -1 }],
  },
  emptyChatText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
});
