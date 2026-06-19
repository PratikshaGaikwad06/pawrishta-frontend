import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Dog } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { dogPlaceholderColor } from "@/utils/dogColors";

const { width: W, height: H } = Dimensions.get("window");
const CARD_HEIGHT = Platform.OS === "web" ? 520 : H * 0.72;
const SWIPE_THRESHOLD = W * 0.28;

interface DogCardProps {
  dog: Dog;
  onInterest: () => void;
  onSkip: () => void;
  isTop?: boolean;
}

export function DogCard({ dog, onInterest, onSkip, isTop = false }: DogCardProps) {
  const colors = useColors();
  const pan = useRef(new Animated.ValueXY()).current;

  const rotate = pan.x.interpolate({
    inputRange: [-W / 2, 0, W / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });
  const likeOpacity = pan.x.interpolate({
    inputRange: [0, W * 0.18],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const passOpacity = pan.x.interpolate({
    inputRange: [-W * 0.18, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => isTop,
      onPanResponderGrant: () => {
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();
        if (g.dx > SWIPE_THRESHOLD) {
          Animated.spring(pan, { toValue: { x: W + 120, y: g.dy }, useNativeDriver: false }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onInterest();
          });
        } else if (g.dx < -SWIPE_THRESHOLD) {
          Animated.spring(pan, { toValue: { x: -W - 120, y: g.dy }, useNativeDriver: false }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            onSkip();
          });
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 6, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  const bgColor = dogPlaceholderColor(dog.id);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          height: CARD_HEIGHT,
          borderRadius: 28,
          transform: isTop
            ? [{ translateX: pan.x }, { translateY: pan.y }, { rotate }]
            : [{ scale: 0.93 }, { translateY: 18 }],
        },
      ]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      {/* Background photo / placeholder */}
      <View style={[styles.photo, { backgroundColor: bgColor }]}>
        <MaterialCommunityIcons name="dog" size={120} color="rgba(255,255,255,0.18)" />
      </View>

      {/* Gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(10,9,7,0.55)", "rgba(10,9,7,0.97)"]}
        locations={[0.35, 0.65, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top badges */}
      <View style={styles.topRow}>
        <View style={styles.distancePill}>
          <Ionicons name="location-sharp" size={12} color="rgba(255,255,255,0.9)" />
          <Text style={styles.distanceText}>{dog.distance?.toFixed(1)} km</Text>
        </View>
        {dog.vaccinated && (
          <View style={styles.verifiedPill}>
            <Ionicons name="shield-checkmark" size={12} color="#5A9468" />
            <Text style={[styles.distanceText, { color: "#5A9468" }]}>Vaccinated</Text>
          </View>
        )}
      </View>

      {/* Swipe labels */}
      {isTop && (
        <>
          <Animated.View style={[styles.swipeLabel, styles.swipeLabelLeft, { opacity: likeOpacity }]}>
            <Text style={[styles.swipeLabelText, { color: "#5A9468" }]}>WOOF!</Text>
          </Animated.View>
          <Animated.View style={[styles.swipeLabel, styles.swipeLabelRight, { opacity: passOpacity }]}>
            <Text style={[styles.swipeLabelText, { color: "#C94040" }]}>PASS</Text>
          </Animated.View>
        </>
      )}

      {/* Info overlay */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{dog.name}</Text>
          <Text style={styles.age}>{dog.age}y</Text>
          <Ionicons
            name={dog.gender === "female" ? "female" : "male"}
            size={20}
            color={dog.gender === "female" ? "#E892B8" : "#7AB0E8"}
          />
        </View>
        <Text style={styles.breed}>{dog.breed}</Text>
        <Text style={styles.bio} numberOfLines={2}>{dog.bio}</Text>

        <View style={styles.tags}>
          {dog.temperament.slice(0, 3).map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    position: "absolute",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 12,
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  topRow: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    gap: 8,
  },
  distancePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  distanceText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  swipeLabel: {
    position: "absolute",
    top: "35%",
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  swipeLabelLeft: { left: 20, borderColor: "#5A9468", transform: [{ rotate: "-15deg" }] },
  swipeLabelRight: { right: 20, borderColor: "#C94040", transform: [{ rotate: "15deg" }] },
  swipeLabelText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  info: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    gap: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  name: {
    color: "#F0EBE1",
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  age: {
    color: "rgba(240,235,225,0.7)",
    fontSize: 22,
    fontFamily: "Inter_400Regular",
  },
  breed: {
    color: "rgba(240,235,225,0.65)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  bio: {
    color: "rgba(240,235,225,0.85)",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginTop: 2,
  },
  tags: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(240,235,225,0.12)",
    borderWidth: 1,
    borderColor: "rgba(240,235,225,0.2)",
  },
  tagText: {
    color: "rgba(240,235,225,0.9)",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
});
