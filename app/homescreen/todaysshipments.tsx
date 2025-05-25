// src/components/TodaysShipment.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  BackHandler,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { wp, hp } from "../utils/responsive";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../config/env";

const TodaysShipment: React.FC = () => {
  const { token } = useAuth();
  const { darkMode, accentColor } = useApp();
  const router = useRouter();

  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = {
    background: darkMode ? "#030014" : "#ffffff",
    text: darkMode ? "#ffffff" : "#0f0D23",
    secondaryText: darkMode ? "#9CA3AF" : "#6B7280",
    backIcon: darkMode ? "#ffffff" : "#0f0D23",
  };

  const handleBack = () => {
    router.replace("/(tabs)");
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
    const fetchShipments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/shipments/me`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setShipments(data);
      } catch (e) {
        console.error("Fetch error:", e);
        setError("Kon zendingen niet ophalen");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchShipments();
    else setLoading(false);
  }, [token]);

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={[`${accentColor}cc`, theme.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.fullscreen}
      >
        <ActivityIndicator size="large" color={accentColor} />
      </LinearGradient>
    );
  }

  // Error state
  if (error) {
    return (
      <LinearGradient
        colors={[`${accentColor}cc`, theme.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.fullscreen}
      >
        <Text style={styles.error}>{error}</Text>
      </LinearGradient>
    );
  }

  const total = shipments.length;

  // Main content with gradient background
  return (
    <LinearGradient
      colors={[`${accentColor}cc`, theme.background]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 0.5 }}
      style={{ flex: 1 }}
    >
      <ExpoStatusBar style="light" translucent backgroundColor="transparent" />
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={{ flex: 1, paddingHorizontal: wp(6), paddingTop: hp(6) }}>
        {/* Back button + title */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: hp(2),
          }}
        >
          <TouchableOpacity onPress={handleBack} style={{ marginRight: wp(2) }}>
            <Ionicons name="arrow-back" size={30} color={theme.backIcon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Ritten van Vandaag
          </Text>
        </View>

        {/* Truck icon */}
        <MaterialCommunityIcons
          name="truck-delivery"
          size={wp(24)}
          color={accentColor}
          style={{ alignSelf: "center", marginBottom: hp(1) }}
        />

        <Text style={[styles.subTitle, { color: theme.secondaryText }]}>
          Je hebt {total} ritten vandaag
        </Text>

        <FlatList
          data={shipments}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: hp(6) }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/shipment/shipmentdetails",
                  params: { qrData: item.id.toString() },
                })
              }
            >
              <LinearGradient
                colors={
                  darkMode ? ["#17144F", "#090723"] : ["#ffffff", "#ffffff"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={styles.cardContent}>
                  <Ionicons
                    name="cube-outline"
                    size={wp(8)}
                    color={accentColor}
                  />
                  <View style={{ marginLeft: wp(4), flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      #{item.id}
                    </Text>
                    <Text
                      style={[styles.cardText, { color: theme.secondaryText }]}
                    >
                      Bestemming: {item.destination}
                    </Text>
                    <Text
                      style={[styles.cardText, { color: theme.secondaryText }]}
                    >
                      Status: {item.status}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={wp(6)}
                    color={theme.text}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: wp(6),
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: wp(4),
    textAlign: "center",
    marginBottom: hp(3),
  },
  card: {
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
  },
  cardText: {
    fontSize: wp(3.5),
    marginTop: hp(0.5),
  },
  error: {
    color: "#ffffff",
    fontSize: wp(4),
  },
});

export default TodaysShipment;
