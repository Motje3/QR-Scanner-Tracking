import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  BackHandler,
  Animated,
  Alert,
  StatusBar as RNStatusBar,
  Modal,
  StyleSheet,
  Platform,
  ImageSourcePropType,
} from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { icons } from "@/constants/icons";
import { Ionicons } from "@expo/vector-icons";
import { wp, hp } from "../utils/responsive";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config/env";

const ShipmentDetails = () => {
  const router = useRouter();
  const { qrData } = useLocalSearchParams<{ qrData: string }>();
  const { darkMode, accentColor } = useApp();
  const { token } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const theme = {
    background: darkMode ? ["#090723", "#0a0a23"] : ["#ffffff", "#f2f2f2"],
    cardBg: darkMode ? ["#1E1B4B", "#13112D"] : ["#f3f4f6", "#e5e7eb"],
    text: darkMode ? "#ffffff" : "#0f0D23",
    secondaryText: darkMode ? "#D1D5DB" : "#6B7280",
  };

  const [shipment, setShipment] = useState<any>(null);
  const [shipmentStatus, setShipmentStatus] = useState<string>("Geleverd");
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fadeAnim.setValue(0);
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }, 50);
      return () => clearTimeout(timer);
    }, [])
  );

  const handleBack = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      router.navigate("/(tabs)"); // Change to navigate to "todayShipments"
    });
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBack
    );
    return () => backHandler.remove();
  }, [router]);

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const id = Array.isArray(qrData) ? qrData[0] : qrData;
        const res = await fetch(`${API_BASE_URL}/api/shipments/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (res.status === 404) {
          setNotFound(true);
          return;
        }

        const data = await res.json();

        // You could also add an additional safety check:
        if (!data || !data.id) {
          setNotFound(true);
          return;
        }

        setShipment(data);
        setShipmentStatus(data.status);
      } catch (err) {
        console.error("Fout bij ophalen van zending:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [qrData, token]);

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const id = Array.isArray(qrData) ? qrData[0] : qrData;
        const res = await fetch(`${API_BASE_URL}/api/shipments/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        const data = await res.json();
        setShipment(data);
        setShipmentStatus(data.status);
      } catch (err) {
        console.error("Fout bij ophalen van zending:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchShipment();
  }, [qrData, token]);

  const updateStatus = async (newStatus: string) => {
    setStatusModalVisible(false);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/shipments/${shipment.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setShipmentStatus(updated.status);
    } catch (err) {
      console.error("Status update error", err);
      Alert.alert("❌ Kon status niet bijwerken");
      setShipmentStatus(shipment.status);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#17144F", "#090723"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#A970FF" />
      </LinearGradient>
    );
  }

  if (notFound) {
    return (
      <LinearGradient
        colors={["#17144F", "#090723"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: wp(10),
        }}
      >
        {/* Big ❌ Icon */}
        <Text
          style={{ fontSize: wp(20), color: "#EF4444", marginBottom: hp(2) }}
        >
          ❌
        </Text>

        {/* Main message */}
        <Text
          style={{
            fontSize: wp(8),
            color: "#fff",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: hp(1),
          }}
        >
          Zending bestaat niet
        </Text>

        {/* Subtext */}
        <Text
          style={{
            fontSize: wp(4.2),
            color: "#D1D5DB",
            textAlign: "center",
            marginBottom: hp(4),
          }}
        >
          Probeer opnieuw te scannen of meld een probleem.
        </Text>

        {/* Buttons stacked vertically */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/scan")}
          style={{
            width: "100%",
            backgroundColor: "#6C5CE7",
            paddingVertical: hp(2.2),
            borderRadius: wp(3),
            marginBottom: hp(2),
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: wp(2), // use spacing between icon and text
          }}
        >
          <Image
            source={icons.qrcode as ImageSourcePropType}
            style={{
              width: wp(6),
              height: wp(6),
              tintColor: "#fff",
            }}
          />
          <Text
            style={{ color: "#fff", fontSize: wp(4.8), fontWeight: "bold" }}
          >
            Opnieuw scannen
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/shipment/reportissue")}
          style={{
            width: "100%",
            backgroundColor: "#EF4444",
            paddingVertical: hp(2.2),
            borderRadius: wp(3),
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: wp(2),
          }}
        >
          <Image
            source={icons.issue as ImageSourcePropType}
            style={{
              width: wp(6),
              height: wp(6),
              tintColor: "#fff",
            }}
          />
          <Text
            style={{ color: "#fff", fontSize: wp(4.8), fontWeight: "bold" }}
          >
            Probleem melden
          </Text>
        </TouchableOpacity>

        {/* Optional Back Button */}
        <View style={{ position: "absolute", top: hp(4), left: wp(5) }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={wp(8)} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <LinearGradient
        colors={theme.background as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, paddingHorizontal: wp(6), paddingTop: hp(9) }}
      >
        <RNStatusBar hidden />
        {/* Success Checkmark */}
        <Image
          source={icons.checked as ImageSourcePropType}
          style={{
            width: wp(20),
            height: wp(20),
            alignSelf: "center",
            marginBottom: hp(2),
          }}
        />
        <Text
          style={{
            color: "#10B981", // Groen voor 'Succesvol gescand'
            fontSize: wp(6),
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: hp(4),
          }}
        >
          Succesvol gescand
        </Text>
        {/* Zending Details */}
        <LinearGradient
          colors={darkMode ? ["#1E1B4B", "#13112D"] : ["#f3f4f6", "#e5e7eb"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: wp(5),
            borderRadius: wp(5),
            marginBottom: hp(3),
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 10,
          }}
        >
          <Text
            style={{
              color: theme.text,
              fontSize: wp(5),
              fontWeight: "bold",
              marginBottom: hp(2),
            }}
          >
            Zendingdetails
          </Text>
          <Text style={{ color: theme.secondaryText, fontSize: wp(4.2) }}>
            🚚 Status:{" "}
            <Text style={{ color: "#FACC15" }}>{shipmentStatus}</Text>
          </Text>
          <Text style={{ color: theme.secondaryText, fontSize: wp(4.2) }}>
            📍 Bestemming:{" "}
            <Text style={{ color: "#60A5FA" }}>{shipment.destination}</Text>
          </Text>
          <Text style={{ color: theme.secondaryText, fontSize: wp(4.2) }}>
            ⏳ Verwachte leveringtijd:{" "}
            <Text style={{ color: "#C084FC" }}>
              {shipment.expectedDelivery}
            </Text>
          </Text>
          <Text style={{ color: theme.secondaryText, fontSize: wp(4.2) }}>
            ⚖️ Gewicht:{" "}
            <Text style={{ color: "#F87171" }}>{shipment.weight}</Text>
          </Text>
        </LinearGradient>
        {/* Status Wijzigen */}
        <TouchableOpacity
          onPress={() => setStatusModalVisible(true)}
          style={{
            width: "100%",
            padding: wp(5),
            borderRadius: wp(5),
            backgroundColor: accentColor, // Hier de accentkleur voor de knop
            marginBottom: hp(3),
            alignItems: "center",
            shadowColor: "#000", // Toevoegen van schaduw om de knop beter zichtbaar te maken
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            elevation: 10, // Dit zorgt voor schaduw op Android-apparaten
          }}
        >
          <Text
            style={{ color: "#fff", fontSize: wp(4.5), fontWeight: "bold" }}
          >
            📦 Status wijzigen
          </Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() =>
              router.push(`/shipment/reportissue?shipmentId=${shipment.id}`)
            }
            style={{
              flex: 1,
              marginRight: wp(2),
              backgroundColor: "#790600",
              paddingVertical: hp(2),
              borderRadius: wp(4),
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 6,
            }}
          >
            <Image
              source={icons.issue as ImageSourcePropType}
              style={{ width: wp(10), height: wp(10), marginBottom: hp(1) }}
            />
            <Text
              style={{ color: "#fff", fontSize: wp(3.8), fontWeight: "600" }}
            >
              Probleem melden
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
              }).start(() => router.replace("/(tabs)/scan"));
            }}
            style={{
              flex: 1,
              marginLeft: wp(2),
              backgroundColor: "#6C5CE7",
              paddingVertical: hp(2),
              borderRadius: wp(4),
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 6,
            }}
          >
            <Image
              source={icons.qrcode as ImageSourcePropType}
              style={{
                width: wp(9),
                height: wp(9),
                tintColor: "#fff",
                marginBottom: hp(1),
              }}
            />
            <Text
              style={{ color: "#fff", fontSize: wp(3.8), fontWeight: "600" }}
            >
              Volgende scannen
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terug */}
        <TouchableOpacity
          onPress={handleBack}
          style={[
            styles.backButton,
            {
              borderColor: accentColor,
              alignSelf: "flex-end",
              marginTop: hp(2),
              paddingHorizontal: wp(4),
              paddingVertical: hp(1),
            },
          ]}
        >
          <Image
            source={icons.arrowleft as ImageSourcePropType}
            style={styles.backIcon}
          />
          <Text style={[styles.backText, { color: accentColor }]}>Terug</Text>
        </TouchableOpacity>

        {/* Modal Status Wijzigen */}
        <Modal
          visible={statusModalVisible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setStatusModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: theme.cardBg[0],
                width: "85%",
                padding: wp(6),
                borderRadius: wp(5),
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: wp(5),
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: hp(2),
                }}
              >
                Kies nieuwe status
              </Text>
              {["Onderweg", "Geleverd", "Vertraagd"].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => updateStatus(option)}
                  style={{
                    backgroundColor: accentColor,
                    paddingVertical: hp(2),
                    borderRadius: wp(3),
                    alignItems: "center",
                    marginBottom: hp(1.5),
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: wp(4.2) }}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setStatusModalVisible(false)}
                style={{
                  backgroundColor: "#374151",
                  paddingVertical: hp(2),
                  borderRadius: wp(3),
                  alignItems: "center",
                  marginTop: hp(2),
                }}
              >
                <Text style={{ color: "#fff", fontSize: wp(4.2) }}>
                  Annuleren
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: wp(4),
    paddingTop: hp(1.5), // Add some top padding
    paddingLeft: wp(2), // Add left padding
  },
  backIcon: { width: wp(6), height: wp(6), marginRight: wp(2) },
  backText: { fontSize: wp(3.5), fontWeight: "600" },
  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? hp(6) : hp(3),
    left: wp(4),
    right: wp(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default ShipmentDetails;
