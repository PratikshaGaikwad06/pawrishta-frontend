import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError("Fill in all fields."); return; }
    setError(""); setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch { setError("Invalid credentials."); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Hero section */}
      <View style={[styles.hero, { paddingTop: topPadding + 20 }]}>
        <LinearGradient
          colors={[colors.primary + "30", "transparent"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.iconRing, { borderColor: colors.primary + "40" }]}>
          <View style={[styles.iconInner, { backgroundColor: colors.primary + "20" }]}>
            <MaterialCommunityIcons name="dog-side" size={52} color={colors.primary} />
          </View>
        </View>
        <Text style={[styles.heroTitle, { color: colors.foreground }]}>Pawrishta</Text>
        <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
          Where tails meet tails
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.form, { paddingBottom: bottomPadding + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {error ? (
          <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text>
        ) : null}

        {/* Inputs */}
        <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 20 }]}>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Email address"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={[styles.inputDivider, { backgroundColor: colors.border }]} />
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: loading ? colors.muted : colors.primary, borderRadius: 16 }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Continue</Text>}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity
          style={[styles.outlineBtn, { borderColor: colors.border, borderRadius: 16 }]}
          onPress={() => router.push("/auth/register")}
          activeOpacity={0.85}
        >
          <Text style={[styles.outlineBtnText, { color: colors.foreground }]}>Create new account</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    alignItems: "center",
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  heroSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    letterSpacing: 0.2,
  },
  form: { paddingHorizontal: 24, gap: 14 },
  error: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  inputGroup: {
    borderWidth: 1,
    overflow: "hidden",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  eyeBtn: { padding: 4 },
  inputDivider: { height: 1, marginHorizontal: 16 },
  btn: { height: 54, justifyContent: "center", alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  outlineBtn: { height: 54, justifyContent: "center", alignItems: "center", borderWidth: 1.5 },
  outlineBtnText: { fontSize: 16, fontFamily: "Inter_500Medium" },
});
