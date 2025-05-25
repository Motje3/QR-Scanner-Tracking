import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { wp, hp } from "../utils/responsive";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../config/env";

export default function ForgotPassword() {
  const router = useRouter();
  const { accentColor } = useApp();

  const [email, setEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/login/loginpage");
      return true;
    });
    return () => sub.remove();
  }, [router]);

  const submit = async () => {
    if (!email || !newPass || newPass !== confirm) {
      return Alert.alert(
        "Controleer je invoer",
        "Vul e-mail in en 2x hetzelfde nieuw wachtwoord"
      );
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/PasswordReset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword: newPass }),
      });
      if (!res.ok) throw new Error();
      Alert.alert(
        "Verzoek ingediend",
        "De administrator zal je wachtwoord aanpassen."
      );
      router.replace("/login/loginpage");
    } catch {
      Alert.alert("Fout", "Kon verzoek niet versturen");
    }
  };

  return (
    <LinearGradient
      colors={["#3E1F92", "#230F52"]}
      locations={[0.3, 1]}
      style={styles.bg}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Wachtwoord vergeten</Text>

              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor="#AAA"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <TextInput
                style={styles.input}
                placeholder="Nieuw wachtwoord"
                placeholderTextColor="#AAA"
                secureTextEntry
                value={newPass}
                onChangeText={setNewPass}
              />
              <TextInput
                style={styles.input}
                placeholder="Bevestig wachtwoord"
                placeholderTextColor="#AAA"
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
              />

              <TouchableOpacity
                style={[styles.button, { backgroundColor: accentColor }]}
                onPress={submit}
              >
                <Text style={styles.buttonText}>Verstuur verzoek</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.backLink, { borderColor: accentColor }]}
                onPress={() => router.replace("/login/loginpage")}
              >
                <Text style={[styles.backText, { color: accentColor }]}>
                  Terug naar inloggen
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: wp(6),
    justifyContent: "center",
  },
  title: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: hp(4),
  },
  input: {
    backgroundColor: "#1E1B33",
    color: "#fff",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    marginBottom: hp(2),
    fontSize: wp(4),
  },
  button: {
    paddingVertical: hp(1.8),
    borderRadius: wp(2),
    alignItems: "center",
    marginTop: hp(1),
  },
  buttonText: {
    color: "#fff",
    fontSize: wp(4.5),
    fontWeight: "600",
  },
  backLink: {
    marginTop: hp(2),
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: wp(2),
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
  },
  backText: {
    fontSize: wp(3.8),
    fontWeight: "500",
  },
});
