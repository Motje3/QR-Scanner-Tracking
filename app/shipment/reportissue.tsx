import React, { useState, useEffect, useRef } from "react"; // Added useRef
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Animated,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import Modal from "react-native-modal";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { icons } from "@/constants/icons";
import { wp, hp } from "../utils/responsive";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../config/env";
import { Ionicons } from "@expo/vector-icons";

export default function ReportIssue() {
  const router = useRouter();
  const { shipmentId } = useLocalSearchParams<{ shipmentId: string }>();
  const { darkMode, accentColor } = useApp();

  // Screen fade animation (existing)
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Success overlay animation
  const [showSuccess, setShowSuccess] = useState(false);
  const successOpacityAnim = useRef(new Animated.Value(0)).current;

  const theme = {
    background: darkMode ? "#090723" : "#ffffff",
    cardBg: darkMode ? "#1E1B33" : "#f3f4f6",
    text: darkMode ? "#ffffff" : "#0f0D23",
    placeholder: darkMode ? "#6B7280" : "#A8A8A8",
    border: darkMode ? "#2D2A5A" : "#ddd",
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleBack = () => {
    Animated.timing(fadeAnim, {
      // This uses the screen's fadeAnim
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      router.navigate(`/shipment/shipmentdetails?qrData=${shipmentId}`);
    });
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBack
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    // Initial screen fade-in animation
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert("Vul alle velden in.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/IssueReport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          shipmentId: shipmentId ? parseInt(shipmentId) : undefined,
        }),
      });
      if (!res.ok) {
        const errorData = await res.text(); // Or res.json() if your API returns JSON errors
        throw new Error(errorData || "Failed to submit issue report");
      }

      // Show success overlay instead of Alert
      setShowSuccess(true);
      Animated.timing(successOpacityAnim, {
        toValue: 1,
        duration: 100, // Duration from appsettings.tsx
        useNativeDriver: true,
      }).start();

      // After 1s, fade out and navigate back
      setTimeout(() => {
        Animated.timing(successOpacityAnim, {
          toValue: 0,
          duration: 100, // Duration from appsettings.tsx
          useNativeDriver: true,
        }).start(() => {
          // Navigate back to shipment details, similar to handleBack's navigation
          router.navigate(`/shipment/shipmentdetails?qrData=${shipmentId}`);
        });
      }, 1000); // Delay from appsettings.tsx
    } catch (error) {
      console.error("❌ Indienen mislukt:", error);
      Alert.alert(
        "❌ Indienen mislukt.",
        error instanceof Error
          ? error.message
          : "Een onbekende fout is opgetreden."
      );
    } finally {
      // setSubmitting will be effectively handled by navigation or if an error occurs before navigation
      // If successful, the component unmounts. If error, we need submitting to be false.
      if (!showSuccess) {
        // Only set submitting to false if not already showing success (and about to navigate)
        setSubmitting(false);
      }
    }
  };

  const pickCamera = async () => {
    setModalVisible(false);
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return Alert.alert("Camera toegang vereist");
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.5,
      allowsEditing: true,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const pickGallery = async () => {
    setModalVisible(false);
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert("Galerij toegang vereist");
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.5,
      allowsEditing: true,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // Success overlay (conditionally rendered)
  if (showSuccess) {
    return (
      <Animated.View
        style={[
          styles.successContainer, // Defined in StyleSheet below
          { backgroundColor: theme.background, opacity: successOpacityAnim },
        ]}
      >
        <Ionicons name="checkmark-circle" size={wp(20)} color="#10B981" />
        <Text style={[styles.successText, { color: "#10B981" }]}>
          Probleem succesvol gemeld!
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <LinearGradient
        colors={darkMode ? ["#17144F", "#090723"] : ["#f3f4f6", "#ffffff"]}
        locations={[0.3, 1]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scroll}>
            <Image
              source={icons.reportproblem as ImageSourcePropType}
              style={styles.image}
            />
            <Text style={[styles.heading, { color: theme.text }]}>
              Probleem melden
            </Text>

            <View style={styles.inputWrapper}>
              <Text style={{ color: theme.text, marginBottom: hp(1) }}>
                Titel
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Bijv. QR-code werkt niet"
                placeholderTextColor={theme.placeholder}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={{ color: theme.text, marginBottom: hp(1) }}>
                Omschrijving
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Beschrijf het probleem"
                placeholderTextColor={theme.placeholder}
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.cardBg,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                multiline
              />
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={[
                styles.photoButton,
                { backgroundColor: theme.cardBg, borderColor: theme.border },
              ]}
            >
              <Text style={{ color: theme.text }}>
                {imageUri ? "Foto wijzigen" : "Voeg een foto toe"}
              </Text>
            </TouchableOpacity>

            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={styles.preview}
                resizeMode="cover"
              />
            )}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              style={[
                styles.submitButton,
                { backgroundColor: accentColor, opacity: submitting ? 0.6 : 1 },
              ]}
            >
              <Text style={styles.submitText}>
                {submitting ? "Verzenden..." : "Indienen"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBack} // This handleBack still works for manual back navigation
              style={[styles.backButton, { borderColor: accentColor }]}
            >
              <Image
                source={icons.arrowleft as ImageSourcePropType}
                style={styles.backIcon}
              />
              <Text style={[styles.backText, { color: accentColor }]}>
                Terug
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <Modal
            isVisible={isModalVisible}
            onBackdropPress={() => setModalVisible(false)}
            style={styles.modal}
            animationIn="fadeIn"
            animationOut="fadeOut"
            useNativeDriver // It's good practice to useNativeDriver where possible
          >
            <View
              style={[styles.modalContent, { backgroundColor: theme.cardBg }]}
            >
              {/* Modal content for image picker options */}
              <TouchableOpacity onPress={pickCamera} style={styles.modalOption}>
                <Ionicons
                  name="camera-outline"
                  size={wp(6)}
                  color={theme.text}
                  style={styles.modalIcon}
                />
                <Text style={{ color: theme.text, fontSize: wp(4.5) }}>
                  Open Camera
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickGallery}
                style={styles.modalOption}
              >
                <Ionicons
                  name="image-outline"
                  size={wp(6)}
                  color={theme.text}
                  style={styles.modalIcon}
                />
                <Text style={{ color: theme.text, fontSize: wp(4.5) }}>
                  Kies uit Galerij
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[
                  styles.modalOption,
                  { borderBottomWidth: 0, marginTop: hp(1) },
                ]}
              >
                <Text style={{ color: "red", fontSize: wp(4.5) }}>
                  Annuleren
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradient: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scroll: { padding: wp(6), alignItems: "center", paddingBottom: hp(10) }, // Added paddingBottom for scroll
  image: {
    width: wp(36),
    height: wp(36),
    marginBottom: hp(2),
    marginTop: hp(5),
  },
  heading: { fontSize: wp(6), fontWeight: "bold", marginBottom: hp(4) },
  inputWrapper: { alignSelf: "stretch", marginBottom: hp(2) },
  input: {
    padding: wp(4),
    borderRadius: wp(2),
    borderWidth: 1,
    fontSize: wp(4),
  },
  textArea: {
    padding: wp(4),
    borderRadius: wp(2),
    borderWidth: 1,
    height: hp(20),
    textAlignVertical: "top",
    fontSize: wp(4),
  },
  photoButton: {
    padding: hp(1.5),
    borderRadius: wp(2),
    borderWidth: 1,
    marginBottom: hp(2),
    width: "100%",
    alignItems: "center",
  },
  preview: {
    width: "100%",
    height: hp(25),
    borderRadius: wp(2),
    marginBottom: hp(2),
  },
  submitButton: {
    padding: hp(2),
    borderRadius: wp(2),
    width: "100%",
    alignItems: "center",
    marginBottom: hp(3),
  },
  submitText: { color: "#fff", fontSize: wp(4.5), fontWeight: "600" },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    paddingVertical: hp(1),
    paddingHorizontal: wp(2),
    borderWidth: 2,
    borderRadius: wp(4),
  },
  backIcon: { width: wp(6), height: wp(6), marginRight: wp(2) }, // Assuming icons.arrowleft is an image source
  backText: { fontSize: wp(3.5), fontWeight: "600" },
  modal: { justifyContent: "flex-end", margin: 0 },
  modalContent: {
    padding: wp(6),
    borderTopLeftRadius: wp(5),
    borderTopRightRadius: wp(5),
  },
  modalOption: {
    // Added styles for modal options
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: "#eee", // Adjust color as needed
  },
  modalIcon: {
    // Added style for modal icons
    marginRight: wp(4),
  },
  // Styles copied from appsettings.tsx for the success overlay
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
