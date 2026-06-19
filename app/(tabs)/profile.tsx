import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { dogPlaceholderColor } from "@/utils/dogColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { owner, myDog, logout, updateProfile } = useAuth();

  const [editing, setEditing] = useState(false);
  const [ownerBio, setOwnerBio] = useState(owner?.bio ?? "");
  const [dogBio, setDogBio] = useState(myDog?.bio ?? "");
  const [dogTemp, setDogTemp] = useState(myDog?.temperament.join(", ") ?? "");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  if (!owner || !myDog) return null;

  const avatarBg = dogPlaceholderColor(myDog.id);

  const handleSave = () => {
    updateProfile({ bio: ownerBio }, { bio: dogBio, temperament: dogTemp.split(",").map((t) => t.trim()).filter(Boolean) });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditing(false);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); logout(); } },
    ]);
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPadding + 100 }}
    >
      {/* Profile hero */}
      <View style={[styles.heroContainer, { paddingTop: topPadding + 8 }]}>
        <LinearGradient
          colors={[avatarBg + "60", "transparent"]}
          style={[StyleSheet.absoluteFillObject, { borderRadius: 24 }]}
        />
        <View style={styles.heroContent}>
          <View style={styles.heroTop}>
            <View style={[styles.dogHeroAvatar, { backgroundColor: avatarBg }]}>
              <MaterialCommunityIcons name="dog" size={44} color="rgba(255,255,255,0.9)" />
            </View>
            <TouchableOpacity
              style={[styles.editBtn, { backgroundColor: editing ? colors.primary : colors.card, borderColor: colors.border }]}
              onPress={() => editing ? handleSave() : setEditing(true)}
            >
              <Ionicons name={editing ? "checkmark" : "pencil-outline"} size={16}
                color={editing ? colors.primaryForeground : colors.foreground} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.dogHeroName, { color: colors.foreground }]}>{myDog.name}</Text>
          <Text style={[styles.dogHeroBreed, { color: colors.mutedForeground }]}>{myDog.breed} · {myDog.age}y</Text>
          <View style={styles.heroMeta}>
            <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
            <Text style={[styles.heroMetaText, { color: colors.mutedForeground }]}>{owner.location}</Text>
            {owner.verified && <Ionicons name="checkmark-circle" size={14} color={colors.success} />}
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Owner section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About You</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.ownerRow}>
            <View style={[styles.ownerAvatar, { backgroundColor: colors.primary + "20" }]}>
              <Ionicons name="person" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.ownerName, { color: colors.foreground }]}>{owner.name}</Text>
          </View>
          {editing ? (
            <TextInput
              style={[styles.textArea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
              value={ownerBio}
              onChangeText={setOwnerBio}
              multiline
              placeholder="Write a short bio..."
              placeholderTextColor={colors.mutedForeground}
            />
          ) : (
            <Text style={[styles.bioText, { color: owner.bio ? colors.foreground : colors.mutedForeground }]}>
              {owner.bio || "Add a bio to help other owners get to know you."}
            </Text>
          )}
        </View>

        {/* Dog section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About {myDog.name}</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Stats row */}
          <View style={[styles.statsRow, { backgroundColor: colors.muted }]}>
            <View style={styles.stat}>
              <Text style={[styles.statVal, { color: colors.foreground }]}>{myDog.weight || "—"}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>kg</Text>
            </View>
            <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Ionicons name={myDog.vaccinated ? "shield-checkmark" : "shield-outline"} size={20}
                color={myDog.vaccinated ? colors.success : colors.mutedForeground} />
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {myDog.vaccinated ? "Vaccinated" : "Unvaccinated"}
              </Text>
            </View>
            <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
            <View style={styles.stat}>
              <Ionicons name={myDog.gender === "female" ? "female" : "male"} size={20}
                color={myDog.gender === "female" ? "#E892B8" : "#7AB0E8"} />
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                {myDog.gender === "male" ? "Male" : "Female"}
              </Text>
            </View>
          </View>

          {editing ? (
            <>
              <TextInput
                style={[styles.textArea, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={dogBio}
                onChangeText={setDogBio}
                multiline
                placeholder={`About ${myDog.name}...`}
                placeholderTextColor={colors.mutedForeground}
              />
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Personality (comma-separated)</Text>
              <TextInput
                style={[styles.inputRow, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
                value={dogTemp}
                onChangeText={setDogTemp}
                placeholder="Friendly, Playful, Calm"
                placeholderTextColor={colors.mutedForeground}
              />
            </>
          ) : (
            <>
              <Text style={[styles.bioText, { color: myDog.bio ? colors.foreground : colors.mutedForeground }]}>
                {myDog.bio || "Add a bio for your dog."}
              </Text>
              {myDog.temperament.length > 0 && (
                <View style={styles.tagRow}>
                  {myDog.temperament.map((t) => (
                    <View key={t} style={[styles.tag, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.tagText, { color: colors.primary }]}>{t}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.border }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroContainer: { paddingHorizontal: 20, paddingBottom: 20, margin: 16, borderRadius: 24, overflow: "hidden" },
  heroContent: { gap: 6 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  dogHeroAvatar: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  editBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  dogHeroName: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  dogHeroBreed: { fontSize: 15, fontFamily: "Inter_400Regular" },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  heroMetaText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  content: { paddingHorizontal: 20, gap: 10 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginTop: 4 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12, overflow: "hidden" },
  ownerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  ownerAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  ownerName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", borderRadius: 12, overflow: "hidden", marginBottom: 4 },
  stat: { flex: 1, alignItems: "center", paddingVertical: 12, gap: 3 },
  statVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statDiv: { width: 1 },
  bioText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  textArea: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular", minHeight: 80, textAlignVertical: "top" },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.7 },
  inputRow: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, fontFamily: "Inter_400Regular" },
  tagRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderWidth: 1, borderRadius: 16, marginTop: 8 },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
