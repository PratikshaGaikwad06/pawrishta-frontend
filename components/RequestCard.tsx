import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MatchRequest } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { dogPlaceholderColor } from "@/utils/dogColors";

interface RequestCardProps {
  request: MatchRequest;
  onAccept?: () => void;
  onReject?: () => void;
  type: "incoming" | "outgoing" | "matched";
}

export function RequestCard({ request, onAccept, onReject, type }: RequestCardProps) {
  const colors = useColors();
  const dog = request.fromDog;
  const bgColor = dog ? dogPlaceholderColor(dog.id) : colors.muted;

  const statusColor =
    request.status === "accepted"
      ? colors.success
      : request.status === "rejected"
      ? colors.destructive
      : colors.warning;

  const statusLabel =
    request.status === "accepted" ? "Matched" : request.status === "rejected" ? "Declined" : "Pending";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border },
      ]}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: bgColor, borderRadius: (colors.radius ?? 16) - 4 }]}>
        <MaterialCommunityIcons name="dog" size={32} color="rgba(255,255,255,0.8)" />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[styles.dogName, { color: colors.foreground }]}>
            {dog?.name ?? "Unknown"}
          </Text>
          <View style={[styles.modeBadge, { backgroundColor: colors.secondary }]}>
            <Ionicons
              name={request.mode === "playdate" ? "happy-outline" : "heart-outline"}
              size={11}
              color={colors.primary}
            />
            <Text style={[styles.modeText, { color: colors.primary }]}>
              {request.mode === "playdate" ? "Playdate" : "Breeding"}
            </Text>
          </View>
        </View>
        <Text style={[styles.ownerName, { color: colors.mutedForeground }]}>
          {type === "outgoing" ? "Your request" : `From ${request.fromOwnerName ?? "Owner"}`}
        </Text>
        {dog && (
          <Text style={[styles.breedText, { color: colors.mutedForeground }]}>
            {dog.breed} · {dog.age}y
          </Text>
        )}
      </View>

      {/* Right side */}
      <View style={styles.right}>
        {type === "incoming" && request.status === "pending" ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.destructive + "20" }]}
              onPress={() => {
                Haptics.selectionAsync();
                onReject?.();
              }}
            >
              <Ionicons name="close" size={20} color={colors.destructive} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.success + "20" }]}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onAccept?.();
              }}
            >
              <Ionicons name="checkmark" size={20} color={colors.success} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dogName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  modeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  modeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  ownerName: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  breedText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  right: {
    alignItems: "flex-end",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
