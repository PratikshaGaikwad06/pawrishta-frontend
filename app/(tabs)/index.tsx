import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DogCard } from "@/components/DogCard";
import { FilterSheet } from "@/components/FilterSheet";
import { ModeToggle } from "@/components/ModeToggle";
import { useApp } from "@/context/AppContext";
import { Dog } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const { width: W, height: H } = Dimensions.get("window");
const CARD_HEIGHT = Platform.OS === "web" ? 520 : H * 0.72;

interface Filters {
  gender: "any" | "male" | "female";
  maxDistance: number;
  minAge: number;
  maxAge: number;
  vaccinated: boolean;
}

const DEFAULT_FILTERS: Filters = { gender: "any", maxDistance: 20, minAge: 0, maxAge: 15, vaccinated: false };

export default function DiscoverScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { mode, setMode, nearbyDogs, sendRequest, requests } = useApp();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);

  const sentIds = requests.filter((r) => r.fromOwnerId === "me").map((r) => r.toDogId);
  const filteredDogs = nearbyDogs.filter((d) => {
    if (skippedIds.includes(d.id) || sentIds.includes(d.id)) return false;
    if (filters.gender !== "any" && d.gender !== filters.gender) return false;
    if ((d.distance ?? 0) > filters.maxDistance) return false;
    if (d.age < filters.minAge || d.age > filters.maxAge) return false;
    if (filters.vaccinated && !d.vaccinated) return false;
    return true;
  });

  const topDog: Dog | undefined = filteredDogs[0];
  const nextDog: Dog | undefined = filteredDogs[1];
  const remaining = filteredDogs.length;

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleInterest = () => { if (topDog) sendRequest(topDog.id, topDog.ownerId); };
  const handleSkip = () => { if (topDog) setSkippedIds((p) => [...p, topDog.id]); };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Discover</Text>
          {remaining > 0 && (
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              {remaining} dogs nearby
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Mode toggle */}
      <View style={styles.modeRow}>
        <ModeToggle mode={mode} onToggle={setMode} />
      </View>

      {/* Card area */}
      <View style={[styles.cardArea, { height: CARD_HEIGHT }]}>
        {filteredDogs.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderRadius: 28, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={44} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All caught up</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Adjust filters or check back later
            </Text>
            <TouchableOpacity
              style={[styles.resetBtn, { backgroundColor: colors.primary, borderRadius: 12 }]}
              onPress={() => { setFilters(DEFAULT_FILTERS); setSkippedIds([]); }}
            >
              <Text style={[styles.resetText, { color: colors.primaryForeground }]}>Reset</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {nextDog && (
              <DogCard key={nextDog.id + "_b"} dog={nextDog} onInterest={() => {}} onSkip={() => {}} isTop={false} />
            )}
            {topDog && (
              <DogCard key={topDog.id} dog={topDog} onInterest={handleInterest} onSkip={handleSkip} isTop />
            )}
          </>
        )}
      </View>

      {/* Action buttons — outside the card, below */}
      {topDog && (
        <View style={[styles.actionRow, { paddingBottom: bottomPadding + 90 }]}>
          <TouchableOpacity
            style={[styles.skipBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleSkip} activeOpacity={0.8}
          >
            <Ionicons name="close" size={26} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.interestBtn, { backgroundColor: colors.primary }]}
            onPress={handleInterest} activeOpacity={0.85}
          >
            <Ionicons name="paw" size={30} color={colors.primaryForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.skipBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowFilters(true)} activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}

      <FilterSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onApply={setFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 1 },
  filterBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: "center", alignItems: "center", borderWidth: 1,
  },
  modeRow: { paddingHorizontal: 20, marginBottom: 12 },
  cardArea: {
    marginHorizontal: 20,
    position: "relative",
  },
  emptyCard: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_600SemiBold", marginTop: 8 },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingHorizontal: 24 },
  resetBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 10 },
  resetText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingTop: 16,
  },
  skipBtn: {
    width: 54, height: 54, borderRadius: 27,
    justifyContent: "center", alignItems: "center", borderWidth: 1.5,
  },
  interestBtn: {
    width: 70, height: 70, borderRadius: 35,
    justifyContent: "center", alignItems: "center",
    shadowColor: "#C8874A", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
  },
});
