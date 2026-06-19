import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

type Step = "owner" | "dog";

type FieldProps = {
  icon: string;
  placeholder: string;
  value: string;
  onChange: (text: string) => void;
  keyboardType?: any;
  secure?: boolean;
  autoComplete?: string;
  colors: ReturnType<typeof useColors>;
};

const Field = ({ icon, placeholder, value, onChange, keyboardType = "default", secure = false, autoComplete, colors }: FieldProps) => (
  <View style={styles.inputRow}>
    <Ionicons name={icon as any} size={18} color={colors.mutedForeground} style={styles.inputIcon} />
    <TextInput
      style={[styles.input, { color: colors.foreground }]}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      value={value}
      onChangeText={onChange}
      keyboardType={keyboardType}
      autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
      autoCorrect={false}
      secureTextEntry={secure}
      autoComplete={autoComplete as any}
      textContentType={secure ? "newPassword" : undefined}
    />
  </View>
);

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [step, setStep] = useState<Step>("owner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [dogAge, setDogAge] = useState("");
  const [dogGender, setDogGender] = useState<"male" | "female">("male");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleContinue = () => {
    if (!name.trim() || !email.trim() || !password.trim() || !location.trim()) {
      setError("Please fill in all fields."); return;
    }
    setError(""); setStep("dog");
  };

  const handleRegister = async () => {
    if (!dogName.trim() || !dogBreed.trim() || !dogAge) {
      setError("Please fill in your dog's details."); return;
    }
    setError(""); setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, location: location.trim(),
        dogName: dogName.trim(), dogBreed: dogBreed.trim(), dogAge: parseInt(dogAge, 10), dogGender });
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  };

  const groupStyle = [styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 20 }];

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.container, { paddingTop: topPadding + 12, paddingBottom: bottomPadding + 32 }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back */}
      <TouchableOpacity style={styles.backBtn} onPress={() => step === "dog" ? setStep("owner") : router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.foreground} />
      </TouchableOpacity>

      {/* Step header */}
      <View style={styles.stepHeader}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
          <View style={[styles.stepLine, { backgroundColor: step === "dog" ? colors.primary : colors.border }]} />
          <View style={[styles.stepDot, { backgroundColor: step === "dog" ? colors.primary : colors.border }]} />
        </View>
        <Text style={[styles.stepHint, { color: colors.mutedForeground }]}>
          {step === "owner" ? "Step 1 of 2" : "Step 2 of 2"}
        </Text>
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>
        {step === "owner" ? "Create your\naccount" : "Tell us about\nyour pup"}
      </Text>

      {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}

      {step === "owner" ? (
        <View style={groupStyle}>
          <Field icon="person-outline" placeholder="Full Name" value={name} onChange={setName} autoComplete="name" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Field icon="mail-outline" placeholder="Email" value={email} onChange={setEmail} keyboardType="email-address" autoComplete="email" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Field icon="lock-closed-outline" placeholder="Password" value={password} onChange={setPassword} secure autoComplete="new-password" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Field icon="location-outline" placeholder="City, State" value={location} onChange={setLocation} autoComplete="off" colors={colors} />
        </View>
      ) : (
        <>
          <View style={groupStyle}>
            <Field icon="paw-outline" placeholder="Dog's Name" value={dogName} onChange={setDogName} autoComplete="off" colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Field icon="search-outline" placeholder="Breed" value={dogBreed} onChange={setDogBreed} autoComplete="off" colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Field icon="calendar-outline" placeholder="Age (years)" value={dogAge} onChange={setDogAge} keyboardType="number-pad" autoComplete="off" colors={colors} />
          </View>

          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Gender</Text>
          <View style={styles.genderRow}>
            {(["male", "female"] as const).map((g) => (
              <TouchableOpacity key={g} onPress={() => setDogGender(g)}
                style={[styles.genderBtn, { borderColor: dogGender === g ? colors.primary : colors.border,
                  backgroundColor: dogGender === g ? colors.primary + "18" : colors.card, borderRadius: 16 }]}>
                <Ionicons name={g === "female" ? "female" : "male"} size={20}
                  color={dogGender === g ? colors.primary : colors.mutedForeground} />
                <Text style={[styles.genderText, { color: dogGender === g ? colors.primary : colors.foreground }]}>
                  {g === "male" ? "Male" : "Female"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: loading ? colors.muted : colors.primary, borderRadius: 16 }]}
        onPress={step === "owner" ? handleContinue : handleRegister}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color={colors.primary} /> : (
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
            {step === "owner" ? "Continue" : "Create Account"}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.loginRow}>
        <Text style={[styles.loginPrompt, { color: colors.mutedForeground }]}>Have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/auth/login")}>
          <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { paddingHorizontal: 24, gap: 16 },
  backBtn: { marginBottom: 8, alignSelf: "flex-start" },
  stepHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepIndicator: { flexDirection: "row", alignItems: "center" },
  stepDot: { width: 8, height: 8, borderRadius: 4 },
  stepLine: { width: 40, height: 2 },
  stepHint: { fontSize: 13, fontFamily: "Inter_400Regular" },
  title: { fontSize: 34, fontFamily: "Inter_700Bold", letterSpacing: -0.8, lineHeight: 40 },
  error: { fontSize: 14, fontFamily: "Inter_400Regular" },
  inputGroup: { borderWidth: 1, overflow: "hidden" },
  inputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, height: 54 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  divider: { height: 1, marginHorizontal: 16 },
  fieldLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 4 },
  genderRow: { flexDirection: "row", gap: 12 },
  genderBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderWidth: 1.5 },
  genderText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  btn: { height: 54, justifyContent: "center", alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  loginRow: { flexDirection: "row", justifyContent: "center" },
  loginPrompt: { fontSize: 14, fontFamily: "Inter_400Regular" },
  loginLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
