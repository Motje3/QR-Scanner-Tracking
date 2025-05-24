// src/app/homescreen/AppFeedback.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  BackHandler,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { wp, hp } from "../utils/responsive"; // Adjust path if necessary
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useApp } from "../context/AppContext"; // Adjust path if necessary

const AppFeedback: React.FC = () => {
  const { darkMode, accentColor } = useApp();
  const router = useRouter();

  const [overallRating, setOverallRating] = useState(0);
  const [bestFeature, setBestFeature] = useState("");
  const [missingFeature, setMissingFeature] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [recommend, setRecommend] = useState<boolean | null>(null);

  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false); // New state for success screen
  const fadeAnim = useRef(new Animated.Value(0)).current; // Animation value

  const theme = {
    background: darkMode ? "#030014" : "#f0f4f8",
    text: darkMode ? "#ffffff" : "#0f0D23",
    secondaryText: darkMode ? "#9CA3AF" : "#6B7280",
    placeholderText: darkMode ? "#7D8A9A" : "#A0AEC0",
    inputBackground: darkMode ? "#1E293B" : "#FFFFFF",
    inputBorder: darkMode ? "#334155" : "#CBD5E1",
    buttonText: "#FFFFFF",
    backIcon: darkMode ? "#ffffff" : "#0f0D23",
    successText: "#10B981",
  };

  const handleBack = () => {
    if (showFeedbackSuccess) return true;
    router.replace("/(tabs)");
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBack
    );
    return () => backHandler.remove();
  }, [router, showFeedbackSuccess]);

  const StarRating = ({ rating, onRate }: { rating: number; onRate: (rate: number) => void }) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onRate(star)}>
            <MaterialIcons
              name={star <= rating ? "star" : "star-border"}
              size={wp(8)}
              color={accentColor}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleSubmit = () => {
    Keyboard.dismiss(); // Dismiss keyboard before showing success screen

    // Basic validation (can be expanded)
    if (overallRating === 0) {
      // You might want a custom modal for errors eventually
      alert("Beoordeling vereist: Geef alstublieft een algemene beoordeling.");
      return;
    }
    if (!bestFeature.trim()) {
      alert("Feedback vereist: Vertel ons wat u het beste vindt aan de app.");
      return;
    }

    console.log("Feedback to submit:", {
      overallRating,
      bestFeature,
      missingFeature,
      suggestions,
      recommend,
    });
    // --- End Simulate API Call ---

    // Show success overlay
    setShowFeedbackSuccess(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // After 3s, hide and navigate back
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowFeedbackSuccess(false); // Reset state
        router.replace("/(tabs)"); // Navigate back to home or previous screen
      });
    }, 2500); // Slightly shorter duration for user experience
  };

  // Success Overlay - Identical structure to editprofile.tsx
  if (showFeedbackSuccess) {
    return (
      <Animated.View
        style={[
          styles.successOverlayContainer, // Renamed style for clarity
          { backgroundColor: theme.background, opacity: fadeAnim },
        ]}
      >
        <Ionicons name="checkmark-circle" size={wp(20)} color={theme.successText} />
        <Text style={[styles.successOverlayText, { color: theme.successText }]}>
          Bedankt voor je feedback!
        </Text>
      </Animated.View>
    );
  }

  return (
    <LinearGradient
      colors={darkMode ? [`${accentColor}99`, theme.background] : [accentColor, theme.background]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 0.4 }}
      style={{ flex: 1 }}
    >
      <ExpoStatusBar style={darkMode ? "light" : "dark"} translucent backgroundColor="transparent" />
      <StatusBar translucent backgroundColor="transparent" barStyle={darkMode ? "light-content" : "dark-content"} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={wp(7)} color={theme.backIcon} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Geef uw Feedback</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={[styles.label, { color: theme.text }]}>
              Hoe tevreden bent u over het algemeen met de app?
            </Text>
            <StarRating rating={overallRating} onRate={setOverallRating} />

            <Text style={[styles.label, { color: theme.text, marginTop: hp(3) }]}>
              Wat vindt u het beste aan de app?
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
              placeholder="Bijvoorbeeld: gebruiksgemak, snelheid, design..."
              placeholderTextColor={theme.placeholderText}
              value={bestFeature}
              onChangeText={setBestFeature}
              multiline
            />

            <Text style={[styles.label, { color: theme.text, marginTop: hp(2) }]}>
              Zijn er functies die u mist of graag toegevoegd zou willen zien?
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
              placeholder="Bijvoorbeeld: een donkere modus, offline toegang..."
              placeholderTextColor={theme.placeholderText}
              value={missingFeature}
              onChangeText={setMissingFeature}
              multiline
            />

            <Text style={[styles.label, { color: theme.text, marginTop: hp(2) }]}>
              Heeft u suggesties om de app te verbeteren?
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.text,
                },
              ]}
              placeholder="Alle feedback is welkom!"
              placeholderTextColor={theme.placeholderText}
              value={suggestions}
              onChangeText={setSuggestions}
              multiline
            />

            <Text style={[styles.label, { color: theme.text, marginTop: hp(2) }]}>
              Zou u deze app aanbevelen aan anderen?
            </Text>
            <View style={styles.recommendContainer}>
              <TouchableOpacity
                style={[
                  styles.recommendButton,
                  { backgroundColor: recommend === true ? accentColor : theme.inputBackground,
                    borderColor: recommend === true ? accentColor : theme.inputBorder,
                  },
                ]}
                onPress={() => setRecommend(true)}
              >
                <Text style={[styles.recommendButtonText, { color: recommend === true ? theme.buttonText : theme.text }]}>
                  Ja
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.recommendButton,
                  { backgroundColor: recommend === false ? accentColor : theme.inputBackground,
                    borderColor: recommend === false ? accentColor : theme.inputBorder,
                  },
                ]}
                onPress={() => setRecommend(false)}
              >
                <Text style={[styles.recommendButtonText, { color: recommend === false ? theme.buttonText : theme.text }]}>
                  Nee
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleSubmit} style={[styles.submitButton, { backgroundColor: accentColor }]}>
              <Text style={[styles.submitButtonText, { color: theme.buttonText }]}>Verstuur Feedback</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: wp(6),
    paddingTop: hp(8),
    paddingBottom: hp(4),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(3),
  },
  backButton: {
    marginRight: wp(3),
    padding: wp(1),
  },
  headerTitle: {
    fontSize: wp(6),
    fontWeight: "bold",
  },
  formContainer: {
    padding: wp(4),
    borderRadius: wp(3),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  label: {
    fontSize: wp(4),
    fontWeight: "600",
    marginBottom: hp(1),
  },
  input: {
    borderWidth: 1,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    fontSize: wp(4),
    minHeight: hp(6),
    textAlignVertical: 'top',
    marginBottom: hp(1.5),
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: hp(1),
  },
  star: {
    marginHorizontal: wp(0.5),
  },
  recommendContainer: {
    flexDirection: "row",
    justifyContent: "space-around", // Changed to space-around for better spacing
    marginTop: hp(1),
    marginBottom: hp(3),
  },
  recommendButton: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6), // Adjusted padding
    borderRadius: wp(2),
    borderWidth: 1,
    // borderColor dynamically set
    flex: 1, // Make buttons take equal width
    marginHorizontal: wp(1), // Add some space between buttons
    alignItems: 'center', // Center text
  },
  // recommendButtonSelected style removed as backgroundColor is handled inline
  recommendButtonText: {
    fontSize: wp(4),
    fontWeight: "bold",
    textAlign: "center",
  },
  submitButton: {
    paddingVertical: hp(2),
    borderRadius: wp(3),
    alignItems: "center",
    marginTop: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: wp(4.5),
    fontWeight: "bold",
  },
  // Styles for the success overlay, similar to editprofile.tsx
  successOverlayContainer: { // Renamed from successContainer for clarity
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successOverlayText: { // Renamed from successText for clarity
    fontSize: wp(6),
    marginTop: hp(2),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AppFeedback;
