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
  ScrollView,
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

  // State for inline error messages
  const [emailError, setEmailError] = useState("");
  const [newPassError, setNewPassError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/login/loginpage");
      return true;
    });
    return () => sub.remove();
  }, [router]);

  const validateFields = () => {
    let isValid = true;
    // Clear previous errors
    setEmailError("");
    setNewPassError("");
    setConfirmError("");

    if (!email.trim()) {
      setEmailError("E-mailadres is vereist.");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Voer een geldig e-mailadres in.");
      isValid = false;
    }

    if (!newPass) {
      setNewPassError("Nieuw wachtwoord is vereist.");
      isValid = false;
    } else if (newPass.length < 6) {
      // Example: Minimum password length
      setNewPassError("Wachtwoord moet minimaal 6 tekens lang zijn.");
      isValid = false;
    }

    if (!confirm) {
      setConfirmError("Bevestig het nieuwe wachtwoord.");
      isValid = false;
    } else if (newPass && newPass !== confirm) {
      setConfirmError("Wachtwoorden komen niet overeen.");
      // Optionally, also mark the newPass field if they don't match
      // setNewPassError("Wachtwoorden komen niet overeen.");
      isValid = false;
    }
    return isValid;
  };

  const submit = async () => {
    if (!validateFields()) {
      return; // Stop submission if validation fails
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/PasswordReset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword: newPass }),
      });
      if (!res.ok) {
        
        throw new Error("Server error during password reset");
      }
      Alert.alert(
        "Verzoek ingediend",
        "De administrator zal je wachtwoord aanpassen."
      );
      router.replace("/login/loginpage");
    } catch (error) {
      Alert.alert(
        "Fout",
        "Kon verzoek niet versturen. Probeer het later opnieuw."
      );
      console.error("Password reset error:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#3E1F92", "#230F52"]}
      locations={[0.3, 1]}
      style={styles.bg}
    >
      <SafeAreaView style={styles.safeAreaContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingContainer}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : hp(2)} 
        >
          <ScrollView
            contentContainerStyle={styles.scrollContentContainer}
            keyboardShouldPersistTaps="handled" 
            showsVerticalScrollIndicator={false}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.innerFormContainer}>
                <Text style={styles.title}>Wachtwoord vergeten</Text>

                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, !!emailError && styles.inputError]}
                    placeholder="E-mail"
                    placeholderTextColor="#AAA"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (emailError) setEmailError("");
                    }}
                    onBlur={() => {
                      // Optional: validate on blur
                      if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
                        setEmailError("Voer een geldig e-mailadres in.");
                      } else if (email.trim()) {
                        setEmailError("");
                      }
                    }}
                  />
                  {!!emailError && (
                    <Text style={styles.errorText}>{emailError}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, !!newPassError && styles.inputError]}
                    placeholder="Nieuw wachtwoord"
                    placeholderTextColor="#AAA"
                    secureTextEntry
                    value={newPass}
                    onChangeText={(text) => {
                      setNewPass(text);
                      if (newPassError) setNewPassError("");
                    }}
                  />
                  {!!newPassError && (
                    <Text style={styles.errorText}>{newPassError}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <TextInput
                    style={[styles.input, !!confirmError && styles.inputError]}
                    placeholder="Bevestig wachtwoord"
                    placeholderTextColor="#AAA"
                    secureTextEntry
                    value={confirm}
                    onChangeText={(text) => {
                      setConfirm(text);
                      if (confirmError) setConfirmError(""); 
                    }}
                  />
                  {!!confirmError && (
                    <Text style={styles.errorText}>{confirmError}</Text>
                  )}
                </View>

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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safeAreaContainer: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1, 
    justifyContent: "center",
    paddingHorizontal: wp(6), 
  },
  innerFormContainer: {
    paddingVertical: hp(5), 
    width: "100%", 
  },
  title: {
    fontSize: wp(7), 
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: hp(5), 
  },
  inputGroup: {
    marginBottom: hp(1.5), 
  },
  input: {
    backgroundColor: "#1E1B33",
    color: "#fff",
    paddingHorizontal: wp(4.5), 
    paddingVertical: hp(1.8), 
    borderRadius: wp(2.5), 
    fontSize: wp(4.2), 
    borderWidth: 1, 
    borderColor: "#1E1B33",
  },
  inputError: {
    borderColor: "#FF6B6B",
    borderWidth: 1.5, 
  },
  errorText: {
    color: "#FF6B6B", 
    fontSize: wp(3.5),
    marginTop: hp(0.5),
  },
  button: {
    paddingVertical: hp(2),
    borderRadius: wp(2.5),
    alignItems: "center",
    marginTop: hp(2), 
  },
  buttonText: {
    color: "#fff",
    fontSize: wp(4.8), 
    fontWeight: "600",
  },
  backLink: {
    marginTop: hp(3), 
    alignSelf: "center",
    borderWidth: 1.5, 
    borderRadius: wp(2.5),
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(5),
  },
  backText: {
    fontSize: wp(4), 
    fontWeight: "500",
  },
});
