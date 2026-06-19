import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Mode } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

interface ModeToggleProps {
  mode: Mode;
  onToggle: (m: Mode) => void;
}

export function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  const colors = useColors();

  const select = (m: Mode) => {
    Haptics.selectionAsync();
    onToggle(m);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.muted, borderRadius: 50 }]}>
      <TouchableOpacity
        style={[
          styles.option,
          mode === "playdate" && { backgroundColor: colors.primary },
        ]}
        onPress={() => select("playdate")}
        activeOpacity={0.85}
      >
        <Ionicons
          name="sunny-outline"
          size={14}
          color={mode === "playdate" ? colors.primaryForeground : colors.mutedForeground}
        />
        <Text style={[styles.label, { color: mode === "playdate" ? colors.primaryForeground : colors.mutedForeground }]}>
          Playdate
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          mode === "breeding" && { backgroundColor: colors.accent },
        ]}
        onPress={() => select("breeding")}
        activeOpacity={0.85}
      >
        <Ionicons
          name="leaf-outline"
          size={14}
          color={mode === "breeding" ? colors.accentForeground : colors.mutedForeground}
        />
        <Text style={[styles.label, { color: mode === "breeding" ? colors.accentForeground : colors.mutedForeground }]}>
          Breeding
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 4,
    alignSelf: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 50,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
