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

  const [showRequestSent, setShowRequestSent] = useState(false);

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
      setShowRequestSent(true);
    } catch (error) {
      Alert.alert(
        "Fout",
        "Kon verzoek niet versturen. Probeer het later opnieuw."
      );
      console.error("Password reset error:", error);
    }
  };

  if (showRequestSent) {
    return (
      <LinearGradient // Optional: Keep a similar background
        colors={["#3E1F92", "#230F52"]} // Same as your main screen
        locations={[0.3, 1]}
        style={styles.bg} // Use existing 'bg' style or a new one for the overlay container
      >
        <SafeAreaView style={styles.successOverlaySafeArea}>
          <View style={styles.successOverlayContainer}>
            <View style={styles.successCard}>
              {/* You can add an icon here if you like, e.g., from @expo/vector-icons */}
              {/* <Ionicons name="mail-send-outline" size={wp(15)} color={accentColor || "#fff"} style={{ marginBottom: hp(2) }} /> */}
              <Text style={styles.successTitle}>Verzoek Verzonden!</Text>
              <Text style={styles.successMessage}>
                Je wachtwoordresetverzoek is naar de administrator gestuurd. Zij
                zullen het zo spoedig mogelijk verwerken.
              </Text>
              <TouchableOpacity
                style={[
                  styles.successButton,
                  { backgroundColor: accentColor || "#6200EE" },
                ]} // Use accentColor or a fallback
                onPress={() => {
                  setShowRequestSent(false); // Hide this UI
                  router.replace("/login/loginpage"); // Navigate to login
                }}
              >
                <Text style={styles.successButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
  // --- ADD THESE NEW STYLES ---
  successOverlaySafeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successOverlayContainer: {
    width: "100%",
    paddingHorizontal: wp(6), // Consistent with form padding
    alignItems: "center",
  },
  successCard: {
    backgroundColor: "rgba(30, 27, 51, 0.9)", // Slightly darker or distinct card color, play with opacity
    paddingVertical: hp(4),
    paddingHorizontal: wp(6),
    borderRadius: wp(4),
    alignItems: "center",
    width: "100%", // Card takes full width within padding
    maxWidth: wp(90), // Max width for larger screens
    borderWidth: 1,
    borderColor: "#A970FF", // Use accent color for border
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  successTitle: {
    fontSize: wp(6),
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: hp(2),
  },
  successMessage: {
    fontSize: wp(4.2),
    color: "#E0E0E0", // Light grey for readability
    textAlign: "center",
    marginBottom: hp(4),
    lineHeight: hp(3),
  },
  successButton: {
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(12),
    borderRadius: wp(2.5),
    alignItems: "center",
    minWidth: wp(40), // Ensure button has a decent width
  },
  successButtonText: {
    color: "#fff",
    fontSize: wp(4.5),
    fontWeight: "600",
  },
});
