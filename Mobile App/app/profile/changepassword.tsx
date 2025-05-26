// app/components/ChangePassword.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Keyboard,
  Animated,
  StyleSheet,
} from "react-native";
import { wp, hp } from "../utils/responsive";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../config/env";

const ChangePassword = () => {
  const router = useRouter();
  const { user, token } = useAuth();
  const { darkMode, accentColor } = useApp();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const theme = {
    background: darkMode ? "#0f0D23" : "#ffffff",
    card: darkMode ? "#1F2937" : "#f3f4f6",
    text: darkMode ? "#ffffff" : "#0f0D23",
    secondaryText: darkMode ? "#9CA3AF" : "#6B7280",
  };

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Navigate back to profile tab
  const handleBack = () => {
    router.navigate("/(tabs)/profile");
    return true;
  };
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBack
    );
    return () => backHandler.remove();
  }, [router]);

  const handleSave = async () => {
    Keyboard.dismiss();
    setErrorMessage("");

    if (newPassword.length < 6) {
      setErrorMessage("❌ Nieuw wachtwoord moet minimaal 6 tekens zijn");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("❌ Wachtwoorden komen niet overeen");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/profile/${user.id}/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowSuccess(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          router.navigate("/(tabs)/profile");
        });
      }, 3000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          setErrorMessage("❌ Oud wachtwoord klopt niet");
        } else {
          setErrorMessage(
            `❌ ${error.response?.data?.message || "Serverfout: probeer het later opnieuw"}`
          );
        }
      } else {
        setErrorMessage("❌ Onbekende fout, probeer het later opnieuw");
      }
    }
  };

  if (showSuccess) {
    return (
      <Animated.View
        style={[
          styles.successContainer,
          { backgroundColor: theme.background, opacity: fadeAnim },
        ]}
      >
        <Ionicons name="checkmark-circle" size={wp(20)} color="#10B981" />
        <Text style={[styles.successText, { color: "#10B981" }]}>
          Je wachtwoord is gewijzigd
        </Text>
      </Animated.View>
    );
  }

  const Container = Platform.OS === "ios" ? KeyboardAvoidingView : View;
  const containerProps =
    Platform.OS === "ios"
      ? {
          behavior: "padding" as "padding",
          style: [styles.container, { backgroundColor: theme.background }],
        }
      : { style: [styles.container, { backgroundColor: theme.background }] };

  return (
    <Container {...containerProps} keyboardVerticalOffset={hp(4)}>
      {/* 🔑 Big key icon above the header */}
      <Ionicons
        name="key-outline"
        size={wp(20)}
        color={theme.text}
        style={{ alignSelf: "center", marginBottom: hp(2) }}
      />

      <Text style={[styles.title, { color: theme.text }]}>
        Wachtwoord wijzigen
      </Text>

      <Text style={[styles.label, { color: theme.secondaryText }]}>
        Oud wachtwoord
      </Text>
      <TextInput
        value={oldPassword}
        onChangeText={setOldPassword}
        placeholder="Oud wachtwoord"
        placeholderTextColor={theme.secondaryText}
        secureTextEntry
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text },
        ]}
      />

      <Text style={[styles.label, { color: theme.secondaryText }]}>
        Nieuw wachtwoord
      </Text>
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Nieuw wachtwoord"
        placeholderTextColor={theme.secondaryText}
        secureTextEntry
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text },
        ]}
      />

      <Text style={[styles.label, { color: theme.secondaryText }]}>
        Bevestig nieuw wachtwoord
      </Text>
      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Herhaal nieuw wachtwoord"
        placeholderTextColor={theme.secondaryText}
        secureTextEntry
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text },
        ]}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Opslaan</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleBack}
        style={{
          alignSelf: "flex-end",
          marginTop: hp(2), // space below Opslaan
          paddingVertical: hp(1), // ~1/3 of the Opslaan’s paddingVertical
          paddingHorizontal: wp(5), // adjust for width
          borderWidth: 2,
          borderColor: accentColor, // or '#7C3AED'
          borderRadius: wp(4), // pill shape
        }}
      >
        <Text
          style={{
            color: accentColor,
            fontSize: wp(3.5),
            fontWeight: "600",
          }}
        >
          Terug
        </Text>
      </TouchableOpacity>

      {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(6),
    justifyContent: "center",
  },
  header: {
    position: "absolute",
    top: hp(6),
    left: wp(6),
  },
  title: {
    fontSize: wp(6),
    fontWeight: "bold",
    marginBottom: hp(4),
    textAlign: "center",
  },
  label: {
    fontSize: wp(4),
    marginBottom: hp(1),
  },
  input: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    marginBottom: hp(2),
    fontSize: wp(4),
  },
  button: {
    backgroundColor: "#7C3AED",
    paddingVertical: hp(2),
    borderRadius: wp(2.5),
    alignItems: "center",
    marginTop: hp(1),
  },
  buttonText: {
    color: "#fff",
    fontSize: wp(4.5),
    fontWeight: "600",
  },
  error: {
    color: "#EF4444",
    marginTop: hp(1.5),
    fontSize: wp(3.8),
    textAlign: "center",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successText: {
    fontSize: wp(6),
    marginTop: hp(2),
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ChangePassword;
