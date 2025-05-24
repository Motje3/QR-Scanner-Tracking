// src/app/homescreen/AppFeedback.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert, // replace with custom modal later
  BackHandler,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { wp, hp } from "../utils/responsive"; 
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useApp } from "../context/AppContext"; 

const AppFeedback: React.FC = () => {
  const { darkMode, accentColor } = useApp();
  const router = useRouter();

  const [overallRating, setOverallRating] = useState(0);
  const [bestFeature, setBestFeature] = useState("");
  const [missingFeature, setMissingFeature] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [recommend, setRecommend] = useState<boolean | null>(null); // null, true, false

  const theme = {
    background: darkMode ? "#030014" : "#f0f4f8", // Slightly different background for forms
    text: darkMode ? "#ffffff" : "#0f0D23",
    secondaryText: darkMode ? "#9CA3AF" : "#6B7280",
    placeholderText: darkMode ? "#7D8A9A" : "#A0AEC0",
    inputBackground: darkMode ? "#1E293B" : "#FFFFFF",
    inputBorder: darkMode ? "#334155" : "#CBD5E1",
    buttonText: "#FFFFFF",
    backIcon: darkMode ? "#ffffff" : "#0f0D23",
  };

  const handleBack = () => {
    router.replace("/(tabs)"); // Navigate back to home or previous screen
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBack
    );
    return () => backHandler.remove();
  }, [router]);

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
    // Basic validation
    if (overallRating === 0) {
      Alert.alert("Beoordeling vereist", "Geef alstublieft een algemene beoordeling.");
      return;
    }
    if (!bestFeature.trim()) {
      Alert.alert("Feedback vereist", "Vertel ons wat u het beste vindt aan de app.");
      return;
    }

    // In a real app, you would send this data to a server
    console.log({
      overallRating,
      bestFeature,
      missingFeature,
      suggestions,
      recommend,
    });
    Alert.alert(
      "Bedankt!",
      "Uw feedback is succesvol verzonden.",
      [{ text: "OK", onPress: handleBack }] // Navigate back after submission
    );
    // Reset form (optional)
    setOverallRating(0);
    setBestFeature("");
    setMissingFeature("");
    setSuggestions("");
    setRecommend(null);
  };

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
          {/* Back button + title */}
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={wp(7)} color={theme.backIcon} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Geef uw Feedback</Text>
          </View>

          {/* Feedback Form */}
          <View style={styles.formContainer}>
            {/* Overall Satisfaction */}
            <Text style={[styles.label, { color: theme.text }]}>
              Hoe tevreden bent u over het algemeen met de app?
            </Text>
            <StarRating rating={overallRating} onRate={setOverallRating} />

            {/* Best Feature */}
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

            {/* Missing Features */}
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

            {/* Suggestions */}
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

            {/* Recommend */}
            <Text style={[styles.label, { color: theme.text, marginTop: hp(2) }]}>
              Zou u deze app aanbevelen aan anderen?
            </Text>
            <View style={styles.recommendContainer}>
              <TouchableOpacity
                style={[
                  styles.recommendButton,
                  { backgroundColor: recommend === true ? accentColor : theme.inputBackground },
                  recommend === true && styles.recommendButtonSelected,
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
                  { backgroundColor: recommend === false ? accentColor : theme.inputBackground },
                  recommend === false && styles.recommendButtonSelected,
                ]}
                onPress={() => setRecommend(false)}
              >
                <Text style={[styles.recommendButtonText, { color: recommend === false ? theme.buttonText : theme.text }]}>
                  Nee
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
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
    paddingTop: hp(8), // Increased top padding for status bar
    paddingBottom: hp(4),
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(3),
  },
  backButton: {
    marginRight: wp(3),
    padding: wp(1), // Make it easier to tap
  },
  headerTitle: {
    fontSize: wp(6),
    fontWeight: "bold",
  },
  formContainer: {
    padding: wp(4),
    borderRadius: wp(3),
    backgroundColor: 'rgba(255,255,255,0.1)', // Semi-transparent white for dark mode, subtle for light
  },
  label: {
    fontSize: wp(4),
    fontWeight: "600", // Semibold
    marginBottom: hp(1),
  },
  input: {
    borderWidth: 1,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    fontSize: wp(4),
    minHeight: hp(6),
    textAlignVertical: 'top', // For multiline
    marginBottom: hp(1.5),
  },
  starContainer: {
    flexDirection: "row",
    justifyContent: "flex-start", // Align stars to the left
    marginBottom: hp(1),
  },
  star: {
    marginHorizontal: wp(0.5),
  },
  recommendContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: hp(1),
    marginBottom: hp(3),
  },
  recommendButton: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(8),
    borderRadius: wp(2),
    borderWidth: 1,
    borderColor: '#CBD5E1', // Default border color
  },
  recommendButtonSelected: {
    borderColor: 'transparent', // No border when selected with accent color
  },
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
});

export default AppFeedback;
