import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Filters {
  gender: "any" | "male" | "female";
  maxDistance: number;
  minAge: number;
  maxAge: number;
  vaccinated: boolean;
}

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: Filters;
  onApply: (f: Filters) => void;
}

export function FilterSheet({ visible, onClose, filters, onApply }: FilterSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [local, setLocal] = useState<Filters>(filters);

  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>Filters</Text>
          <TouchableOpacity
            onPress={() =>
              setLocal({ gender: "any", maxDistance: 20, minAge: 0, maxAge: 15, vaccinated: false })
            }
          >
            <Text style={[styles.reset, { color: colors.primary }]}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Gender */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Gender</Text>
          <View style={styles.row}>
            {(["any", "male", "female"] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.chip,
                  {
                    borderColor: local.gender === g ? colors.primary : colors.border,
                    backgroundColor: local.gender === g ? colors.secondary : colors.card,
                    borderRadius: colors.radius,
                  },
                ]}
                onPress={() => update("gender", g)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: local.gender === g ? colors.primary : colors.foreground },
                  ]}
                >
                  {g === "any" ? "Any" : g === "male" ? "Male" : "Female"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Max distance */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            Max Distance: {local.maxDistance} km
          </Text>
          <View style={styles.row}>
            {[5, 10, 20, 50].map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.chip,
                  {
                    borderColor: local.maxDistance === d ? colors.primary : colors.border,
                    backgroundColor: local.maxDistance === d ? colors.secondary : colors.card,
                    borderRadius: colors.radius,
                  },
                ]}
                onPress={() => update("maxDistance", d)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: local.maxDistance === d ? colors.primary : colors.foreground },
                  ]}
                >
                  {d} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Vaccinated */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Requirements</Text>
          <TouchableOpacity
            style={[styles.toggleRow, { borderColor: colors.border, borderRadius: colors.radius }]}
            onPress={() => update("vaccinated", !local.vaccinated)}
          >
            <View>
              <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Vaccinated Only</Text>
              <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>
                Only show vaccinated dogs
              </Text>
            </View>
            <View
              style={[
                styles.toggle,
                { backgroundColor: local.vaccinated ? colors.primary : colors.muted },
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  { transform: [{ translateX: local.vaccinated ? 20 : 0 }] },
                ]}
              />
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Apply button */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={() => {
              onApply(local);
              onClose();
            }}
          >
            <Text style={styles.applyText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  reset: { fontSize: 15, fontFamily: "Inter_500Medium" },
  content: { paddingHorizontal: 20, gap: 12, paddingBottom: 20 },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 8,
  },
  row: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
  },
  chipText: { fontSize: 14, fontFamily: "Inter_500Medium" },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderWidth: 1,
  },
  toggleLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  toggleSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  footer: {
    paddingHorizontal: 20,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  applyBtn: {
    padding: 16,
    alignItems: "center",
  },
  applyText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
