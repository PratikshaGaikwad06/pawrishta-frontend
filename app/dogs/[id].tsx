import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { dogPlaceholderColor } from "@/utils/dogColors";

export default function DogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { nearbyDogs, sendRequest, requests, mode } = useApp();

  const dog = nearbyDogs.find((d) => d.id === id);
  const alreadySent = requests.some((r) => r.toDogId === id && r.fromOwnerId === "me");

  if (!dog) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.foreground }]}>Dog not found</Text>
      </View>
    );
  }

  const bgColor = dogPlaceholderColor(dog.id);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleSendInterest = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    sendRequest(dog.id, dog.ownerId);
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPadding + 120 }}>
        {/* Photo */}
        <View style={[styles.photo, { backgroundColor: bgColor }]}>
          <MaterialCommunityIcons name="dog" size={100} color="rgba(255,255,255,0.65)" />
          <TouchableOpacity
            style={[styles.backBtn, { top: topPadding + 8, backgroundColor: "rgba(0,0,0,0.4)" }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={styles.topRow}>
            <View>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: colors.foreground }]}>{dog.name}</Text>
                <Text style={[styles.age, { color: colors.mutedForeground }]}> · {dog.age}y</Text>
                <Ionicons
                  name={dog.gender === "female" ? "female" : "male"}
                  size={20}
                  color={dog.gender === "female" ? "#E8519A" : "#4A90D9"}
                />
              </View>
              <Text style={[styles.breed, { color: colors.mutedForeground }]}>{dog.breed}</Text>
            </View>
            {dog.distance !== undefined && (
              <View style={[styles.distanceBadge, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
                <Ionicons name="location-sharp" size={14} color={colors.primary} />
                <Text style={[styles.distanceText, { color: colors.primary }]}>
                  {dog.distance.toFixed(1)} km
                </Text>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={[styles.statsRow, { borderColor: colors.border }]}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{dog.weight} kg</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Weight</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Ionicons
                name={dog.vaccinated ? "shield-checkmark" : "shield-outline"}
                size={20}
                color={dog.vaccinated ? colors.success : colors.mutedForeground}
              />
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Vaccinated</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Ionicons
                name={dog.neutered ? "checkmark-circle" : "close-circle-outline"}
                size={20}
                color={dog.neutered ? colors.success : colors.mutedForeground}
              />
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Neutered</Text>
            </View>
          </View>

          {/* Bio */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>About</Text>
          <Text style={[styles.bio, { color: colors.foreground }]}>{dog.bio}</Text>

          {/* Temperament */}
          {dog.temperament.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Personality</Text>
              <View style={styles.tagRow}>
                {dog.temperament.map((t) => (
                  <View key={t} style={[styles.tag, { backgroundColor: colors.secondary, borderRadius: 20 }]}>
                    <Text style={[styles.tagText, { color: colors.primary }]}>{t}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Action bar */}
      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: bottomPadding + 16,
          },
        ]}
      >
        {alreadySent ? (
          <View style={[styles.sentBadge, { backgroundColor: colors.success + "20", borderRadius: colors.radius }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.sentText, { color: colors.success }]}>Interest Sent</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.interestBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={handleSendInterest}
            activeOpacity={0.85}
          >
            <Ionicons name="paw" size={20} color="#fff" />
            <Text style={styles.interestBtnText}>
              {mode === "playdate" ? "Request Playdate" : "Request Breeding"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFoundText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  photo: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { padding: 20, gap: 14 },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  name: { fontSize: 28, fontFamily: "Inter_700Bold" },
  age: { fontSize: 20, fontFamily: "Inter_400Regular" },
  breed: { fontSize: 15, fontFamily: "Inter_400Regular", marginTop: 2 },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  distanceText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statsRow: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  stat: { flex: 1, alignItems: "center", paddingVertical: 14, gap: 4 },
  statValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  bio: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
  tagRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  tag: { paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  interestBtn: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  interestBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  sentBadge: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sentText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
