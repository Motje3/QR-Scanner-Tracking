import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  BackHandler,
  Keyboard,
  Animated,
  StyleSheet,
} from "react-native";
import { wp, hp } from "../utils/responsive";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../config/env";

const fallbackImage = require("../../assets/images/default-profile.png");

const EditProfile = () => {
  const router = useRouter();
  const { user, token } = useAuth();
  const {
    username,
    setUsername,
    email,
    setEmail,
    profileImage,
    setProfileImage,
    accentColor,
    darkMode,
  } = useApp();

  const theme = {
    background: darkMode ? "#0f0D23" : "#ffffff",
    text: darkMode ? "#ffffff" : "#0f0D23",
    secondaryText: darkMode ? "#9CA3AF" : "#6B7280",
    card: darkMode ? "#1F2937" : "#f3f4f6",
  };

  const [newName, setNewName] = useState(username);
  const [newEmail, setNewEmail] = useState(email);
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

  const handleSave = async () => {
    Keyboard.dismiss();
    try {
      await axios.put(
        `${API_BASE_URL}/api/profile/${user.id}`,
        {
          fullName: newName,
          email: newEmail,
          imageUrl: profileImage || "",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Apply locally
      setUsername(newName);
      setEmail(newEmail);

      // Show success overlay
      setShowSuccess(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // After 3s,  hide and navigate back
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
      console.error("❌ Fout bij opslaan profiel:", error);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
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
          Je profiel is bijgewerkt!
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
      <Text style={[styles.title, { color: theme.text }]}>
        Profiel Bewerken
      </Text>

      <TouchableOpacity onPress={handlePickImage} style={styles.imagePicker}>
        <Image
          source={profileImage?.trim() ? { uri: profileImage } : fallbackImage}
          style={styles.profileImage}
        />
        <Text style={[styles.changeText, { color: accentColor }]}>
          Wijzig profielfoto
        </Text>
      </TouchableOpacity>

      <Text style={[styles.label, { color: theme.secondaryText }]}>Naam</Text>
      <TextInput
        value={newName}
        onChangeText={setNewName}
        placeholder="Naam"
        placeholderTextColor={theme.secondaryText}
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text },
        ]}
      />

      <Text style={[styles.label, { color: theme.secondaryText }]}>E-mail</Text>
      <TextInput
        value={newEmail}
        onChangeText={setNewEmail}
        placeholder="E-mail"
        placeholderTextColor={theme.secondaryText}
        keyboardType="email-address"
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text },
        ]}
      />

      <TouchableOpacity
        onPress={handleSave}
        style={[styles.saveButton, { backgroundColor: accentColor }]}
      >
        <Text style={styles.saveText}>Opslaan</Text>
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
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(6),
    paddingTop: hp(15),
  },
  title: {
    fontSize: wp(5.5),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp(3),
  },
  imagePicker: {
    alignItems: "center",
    marginBottom: hp(3),
  },
  profileImage: {
    width: wp(24),
    height: wp(24),
    borderRadius: wp(12),
  },
  changeText: {
    marginTop: hp(1),
    fontSize: wp(3.5),
  },
  label: {
    marginBottom: hp(1),
    fontSize: wp(4),
  },
  input: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    marginBottom: hp(4),
    fontSize: wp(4),
  },
  saveButton: {
    paddingVertical: hp(2),
    borderRadius: wp(3),
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: wp(4.5),
    fontWeight: "bold",
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

export default EditProfile;
