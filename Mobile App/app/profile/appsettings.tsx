import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  BackHandler,
  Animated,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { wp, hp } from "../utils/responsive";
import axios from "axios";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../config/env";

const accentOptions = ["#7C3AED", "#10B981", "#EC4899", "#3B82F6", "#64748B"];

const AppSettings = () => {
  const router = useRouter();
  const { user, token } = useAuth();
  const {
    darkMode,
    setDarkMode,
    notificationsEnabled,
    setNotificationsEnabled,
    accentColor,
    setAccentColor,
  } = useApp();

  const theme = {
    background: darkMode ? "#0f0D23" : "#ffffff",
    text: darkMode ? "#ffffff" : "#0f0D23",
    secondaryText: darkMode ? "#9CA3AF" : "#6B7280",
  };

  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  // Save settings and show success overlay
  const handleSave = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/profile/${user.id}/settings`,
        { darkMode, accentColor, notificationsEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Show success overlay
      setShowSuccess(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
      // After 3s, fade out and navigate back
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start(() => {
          router.navigate("/(tabs)/profile");
        });
      }, 1000);
    } catch (error) {
      console.error("❌ Fout bij opslaan instellingen:", error);
    }
  };

  // Success overlay
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
          App-instellingen bijgewerkt!
        </Text>
      </Animated.View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        padding: wp(6),
        paddingTop: hp(10),
        backgroundColor: theme.background,
      }}
    >
      <Ionicons
        name="settings-outline"
        size={wp(30)}
        color={theme.text}
        style={{ alignSelf: "center", marginBottom: hp(2), paddingTop: hp(2) }}
      />

      <Text
        style={{
          color: theme.text,
          fontSize: wp(5.5),
          fontWeight: "bold",
          marginBottom: hp(3),
          textAlign: "center",
        }}
      >
        App Instellingen
      </Text>

      {/* Donker thema */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: hp(2),
        }}
      >
        <Text style={{ color: theme.text, fontSize: wp(4.5) }}>
          Donker thema
        </Text>
        <Switch
          value={darkMode}
          onValueChange={(value) => setDarkMode(value)}
          trackColor={{ false: "#767577", true: "#6D28D9" }}
          thumbColor={darkMode ? "#A970FF" : "#f4f3f4"}
        />
      </View>

      {/* Meldingen */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: hp(2),
        }}
      >
        <Text style={{ color: theme.text, fontSize: wp(4.5) }}>Meldingen</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={(value) => setNotificationsEnabled(value)}
          trackColor={{ false: "#767577", true: "#6D28D9" }}
          thumbColor={notificationsEnabled ? "#A970FF" : "#f4f3f4"}
        />
      </View>

      {/* Accentkleur */}
      <Text
        style={{ color: theme.text, fontSize: wp(4.5), marginBottom: hp(1.5) }}
      >
        Accentkleur
      </Text>
      <View style={{ flexDirection: "row", marginBottom: hp(3) }}>
        {accentOptions.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => setAccentColor(color)}
            style={{
              backgroundColor: color,
              width: wp(8),
              height: wp(8),
              borderRadius: wp(4),
              marginRight: wp(3),
              borderWidth: accentColor === color ? 3 : 0,
              borderColor: "#fff",
            }}
          />
        ))}
      </View>

      {/* Opslaan knop */}
      <TouchableOpacity
        onPress={handleSave}
        style={{
          backgroundColor: accentColor,
          paddingVertical: hp(2),
          borderRadius: wp(3),
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: wp(4.5), fontWeight: "bold" }}>
          Opslaan
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleBack}
        style={{
          alignSelf: "flex-end",
          marginTop: hp(2),
          paddingVertical: hp(1),
          paddingHorizontal: wp(5),
          borderWidth: 2,
          borderColor: accentColor,
          borderRadius: wp(4),
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
    </View>
  );
};

const styles = StyleSheet.create({
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

export default AppSettings;
