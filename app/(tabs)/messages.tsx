import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { dogPlaceholderColor } from "@/utils/dogColors";

export default function MessagesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getMatchedDogs, chats, nearbyDogs } = useApp();
  const matched = getMatchedDogs();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const enriched = matched.map((req) => {
    const dog = nearbyDogs.find((d) => d.id === req.fromDogId) ?? req.fromDog;
    const messages = chats[req.id] ?? [];
    const lastMsg = messages[messages.length - 1];
    return { req, dog, lastMsg };
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Messages</Text>
        {matched.length > 0 && (
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            {matched.length} conversation{matched.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      <FlatList
        data={enriched}
        keyExtractor={(item) => item.req.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPadding + 100 }]}
        scrollEnabled={!!enriched.length}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="chat-sleep-outline" size={52} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No chats yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Chat unlocks after both owners match. Accept a request first.
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const bgColor = dogPlaceholderColor(item.req.fromDogId);
          const isUnread = !!item.lastMsg && item.lastMsg.fromOwnerId !== "me";
          const timeStr = item.lastMsg
            ? new Date(item.lastMsg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "";

          return (
            <TouchableOpacity
              style={[styles.row, { borderBottomColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => router.push(`/messages/${item.req.id}`)}
            >
              <View style={[styles.avatar, { backgroundColor: bgColor }]}>
                <MaterialCommunityIcons name="dog" size={26} color="rgba(255,255,255,0.85)" />
                {isUnread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
              </View>
              <View style={styles.info}>
                <View style={styles.rowTop}>
                  <Text style={[styles.name, { color: colors.foreground, fontFamily: isUnread ? "Inter_700Bold" : "Inter_600SemiBold" }]}>
                    {item.dog?.name ?? "Unknown"}
                  </Text>
                  {timeStr ? <Text style={[styles.time, { color: colors.mutedForeground }]}>{timeStr}</Text> : null}
                </View>
                <Text style={[styles.preview, { color: isUnread ? colors.foreground : colors.mutedForeground,
                  fontFamily: isUnread ? "Inter_500Medium" : "Inter_400Regular" }]} numberOfLines={1}>
                  {item.lastMsg?.text ?? `Say hello to ${item.dog?.name ?? "them"}!`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 14 },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  list: {},
  empty: { alignItems: "center", gap: 12, paddingTop: 70, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, gap: 14, borderBottomWidth: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", position: "relative" },
  unreadDot: { position: "absolute", top: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: "transparent" },
  info: { flex: 1 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  name: { fontSize: 16 },
  time: { fontSize: 12, fontFamily: "Inter_400Regular" },
  preview: { fontSize: 14 },
});
