import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ImageSourcePropType, // Add this import
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { icons } from "@/constants/icons";
import { LinearGradient } from "expo-linear-gradient";
import DatePickerFilter from "../filters/DatePickerFilter";
import LocationFilter from "../filters/LocationFilter";
import { hp, wp } from "../utils/responsive";
import { API_BASE_URL } from "../config/env";

const { width } = Dimensions.get("window");

const Stats = () => {
  const { token } = useAuth();
  const { darkMode, accentColor } = useApp();

  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const theme = {
    background: darkMode
      ? (["#3D0F6E", "#030014"] as const)
      : (["#ffffff", "#f2f2f2"] as const),
    cardBackground: darkMode
      ? (["#17144F", "#090723"] as const)
      : (["#f0f0f0", "#e4e4e4"] as const),
    text: darkMode ? "#ffffff" : "#0f0D23",
    secondaryText: darkMode ? "#9CA3AF" : "#6B7280",
    borderColor: darkMode ? "#2D2D2D" : "#E5E7EB",
    filterButtonBackground: darkMode ? "#17144F" : "#E5E7EB",
    listItemBorder: darkMode ? "#444" : "#DDD",
  };

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/shipments/me`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setShipments(data);
      } catch (err) {
        console.error("Error fetching shipments:", err);
        setError("Kon zendingen niet ophalen");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchShipments();
    else {
      setLoading(false);
      setError("Niet ingelogd");
    }
  }, [token]);

  const total = shipments.length;
  const completed = shipments.filter((s) => s.status === "Geleverd").length;
  const pending = total - completed;

  const filteredShipments = shipments.filter((shipment) => {
    const matchesLocation = location
      ? shipment.location?.toLowerCase().includes(location.toLowerCase())
      : true;
    const matchesDate = date ? shipment.date === date : true;
    return matchesLocation && matchesDate;
  });

  if (loading) {
    return (
      <LinearGradient
        colors={theme.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={accentColor} />
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={theme.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center", padding: wp(6) },
        ]}
      >
        <Text style={{ color: theme.text, fontSize: wp(4) }}>{error}</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={theme.background}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.container, { paddingTop: hp(3) }]}
    >
      {/* Header */}
      <View style={styles.header}>
        {/* Fixed Image component */}
        <Image
          source={icons.stats as ImageSourcePropType}
          style={[styles.headerIcon, { tintColor: accentColor }]}
        />
      </View>

      {/* Overview */}
      <LinearGradient
        colors={theme.cardBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.overviewBox}
      >
        <Text style={[styles.overviewTitle, { color: theme.text }]}>
          Jouw zendingen
        </Text>
        <View style={styles.overviewStats}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: accentColor }]}>
              {total}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              Totaal
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValueCompleted}>{completed}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              Voltooid
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValuePending}>{pending}</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              In behandeling
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Activity */}
      <LinearGradient
        colors={theme.cardBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.activityBox}
      >
        <Text style={[styles.activityTitle, { color: theme.text }]}>
          Recente activiteit
        </Text>
        <View style={styles.scrollableList}>
          <FlatList
            data={filteredShipments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.listItem,
                  { borderBottomColor: theme.listItemBorder },
                ]}
              >
                <Text
                  style={[styles.listItemId, { color: theme.secondaryText }]}
                >
                  {item.id}
                </Text>
                <Text
                  style={[
                    styles.listItemStatus,
                    {
                      color:
                        item.status === "Geleverd"
                          ? "#22C55E"
                          : item.status === "Vertraagd"
                            ? "#F59E0B"
                            : "#FACC15",
                    },
                  ]}
                >
                  {item.status}
                </Text>
                <Text
                  style={[styles.listItemDate, { color: theme.secondaryText }]}
                >
                  {item.date}
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </LinearGradient>

      {/* Filters Button */}
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        style={[
          styles.filterButton,
          { backgroundColor: theme.filterButtonBackground },
        ]}
      >
        <View style={styles.filterButtonContent}>
          <Image
            source={icons.filter as ImageSourcePropType}
            style={[
              styles.filterIcon,
              { tintColor: darkMode ? "#FFF" : "#0f0D23" },
            ]}
          />
          <Text
            style={[
              styles.filterText,
              { color: darkMode ? "#FFF" : "#0f0D23" },
            ]}
          >
            Filter
          </Text>
        </View>
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={theme.cardBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.filterBox}
          >
            <Text style={[styles.filterTitle, { color: theme.text }]}>
              Filters
            </Text>
            <View style={styles.filterItem}>
              <LocationFilter
                label="Locatie"
                value={location}
                onChange={setLocation}
              />
            </View>
            <View>
              <DatePickerFilter label="Datum" value={date} onChange={setDate} />
              <TouchableOpacity
                onPress={() => setDate("")}
                style={styles.resetButton}
              >
                <Text style={styles.resetButtonText}>Reset datum</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Sluiten</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", marginBottom: 20 },
  headerIcon: { width: 40, height: 40, marginTop: 40 },
  filterButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    marginLeft: 20,
    paddingVertical: 10,
    paddingLeft: 20,
    paddingRight: 25,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  filterButtonContent: { flexDirection: "row", alignItems: "center" },
  filterIcon: { width: 20, height: 20, marginRight: 15 },
  filterText: { fontSize: 16, fontWeight: "bold" },
  overviewBox: {
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 15,
    width: width * 0.9,
    alignSelf: "center",
  },
  overviewTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  statBox: { alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "bold" },
  statValueCompleted: { color: "#22C55E", fontSize: 24, fontWeight: "bold" },
  statValuePending: { color: "#FACC15", fontSize: 24, fontWeight: "bold" },
  statLabel: { fontSize: 14 },
  activityBox: {
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 15,
    width: width * 0.9,
    alignSelf: "center",
  },
  activityTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  scrollableList: { maxHeight: 200 },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  listItemId: { fontSize: 14 },
  listItemStatus: { fontSize: 16, fontWeight: "bold" },
  listItemDate: { fontSize: 14 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  filterBox: { padding: 20, borderRadius: 20, width: width * 0.9 },
  filterTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  filterItem: { marginBottom: 10 },
  resetButton: {
    marginTop: 10,
    backgroundColor: "#FF4D4D",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: { color: "#FFF", fontWeight: "bold" },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#1E90FF",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: { color: "#FFF", fontWeight: "bold" },
});

export default Stats;
