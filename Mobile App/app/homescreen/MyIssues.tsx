// src/components/MyIssues.tsx
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
  RefreshControl,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { wp, hp } from "../utils/responsive";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../config/env";

interface IssueReport {
  id: number;
  title: string;
  description: string;
  shipmentId?: number;
  isImportant: boolean;
  isFixed: boolean;
  createdAt: string;
  resolvedAt?: string;
  shipment?: {
    id: number;
    destination: string;
    status: string;
  };
}

const MyIssues: React.FC = () => {
  const { token, user } = useAuth();
  const { darkMode, accentColor } = useApp();
  const router = useRouter();

  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = {
    background: darkMode ? "#030014" : "#ffffff",
    text: darkMode ? "#ffffff" : "#0f0D23",
    secondaryText: darkMode ? "#9CA3AF" : "#6B7280",
    backIcon: darkMode ? "#ffffff" : "#0f0D23",
    cardBg: darkMode ? "#1E1B33" : "#ffffff",
    errorBg: darkMode ? "#DC2626" : "#FEE2E2",
    errorText: darkMode ? "#ffffff" : "#DC2626",
    successBg: darkMode ? "#059669" : "#D1FAE5",
    successText: darkMode ? "#ffffff" : "#059669",
    warningBg: darkMode ? "#D97706" : "#FEF3C7",
    warningText: darkMode ? "#ffffff" : "#D97706",
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

  const fetchIssues = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setError(null);

    try {
      // Use the new optimized endpoint that returns issues with shipment data included
      const response = await fetch(
        `${API_BASE_URL}/api/IssueReport/assigned-to/${user.fullName}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch issues");
      }

      const myIssues = await response.json();
      setIssues(myIssues);
    } catch (e) {
      console.error("Fetch error:", e);
      setError("Kon problemen niet ophalen");
    } finally {
      setLoading(false);
      if (isRefreshing) setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchIssues();
    } else {
      setLoading(false);
    }
  }, [token, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchIssues(true);
  };

  const getIssueStatusColor = (issue: IssueReport) => {
    if (issue.isFixed) return theme.successBg;
    if (issue.isImportant) return theme.errorBg;
    return theme.warningBg;
  };

  const getIssueStatusTextColor = (issue: IssueReport) => {
    if (issue.isFixed) return theme.successText;
    if (issue.isImportant) return theme.errorText;
    return theme.warningText;
  };

  const getIssueStatusText = (issue: IssueReport) => {
    if (issue.isFixed) return "Opgelost";
    if (issue.isImportant) return "Belangrijk";
    return "Open";
  };

  const getIssueIcon = (issue: IssueReport) => {
    if (issue.isFixed) return "checkmark-circle";
    if (issue.isImportant) return "warning";
    return "alert-circle";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Problemen laden...
        </Text>
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
        <Ionicons
          name="warning-outline"
          size={wp(12)}
          color={theme.errorText}
        />
        <Text style={[styles.error, { color: theme.errorText }]}>{error}</Text>
        <TouchableOpacity
          onPress={() => fetchIssues()}
          style={[styles.retryButton, { backgroundColor: accentColor }]}
        >
          <Text style={styles.retryButtonText}>Probeer opnieuw</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // Empty state
  if (issues.length === 0) {
    return (
      <LinearGradient
        colors={[`${accentColor}cc`, theme.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={{ flex: 1 }}
      >
        <ExpoStatusBar
          style="light"
          translucent
          backgroundColor="transparent"
        />
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        <View style={{ flex: 1, paddingHorizontal: wp(6), paddingTop: hp(6) }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBack}
              style={{ marginRight: wp(2) }}
            >
              <Ionicons name="arrow-back" size={30} color={theme.backIcon} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Mijn Problemen
            </Text>
          </View>

          {/* Empty state */}
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="clipboard-check-outline"
              size={wp(20)}
              color={accentColor}
            />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Geen problemen gevonden
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: theme.secondaryText }]}
            >
              Je hebt nog geen problemen gerapporteerd voor je zendingen.
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  const openIssues = issues.filter((i) => !i.isFixed).length;
  const fixedIssues = issues.filter((i) => i.isFixed).length;

  // Main content
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={{ marginRight: wp(2) }}>
            <Ionicons name="arrow-back" size={30} color={theme.backIcon} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Mijn Problemen
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <MaterialCommunityIcons
            name="clipboard-alert"
            size={wp(16)}
            color={accentColor}
            style={{ alignSelf: "center", marginBottom: hp(1) }}
          />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.warningText }]}>
                {openIssues}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                Open
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.successText }]}>
                {fixedIssues}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                Opgelost
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {issues.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                Totaal
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          data={issues}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: hp(6) }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[accentColor]}
              tintColor={accentColor}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (item.shipmentId) {
                  router.push({
                    pathname: "/shipment/shipmentdetails",
                    params: { qrData: item.shipmentId.toString() },
                  });
                }
              }}
            >
              <LinearGradient
                colors={
                  darkMode ? ["#17144F", "#090723"] : ["#ffffff", "#f8fafc"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Ionicons
                      name={getIssueIcon(item)}
                      size={wp(6)}
                      color={getIssueStatusTextColor(item)}
                    />
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      {item.title}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getIssueStatusColor(item) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getIssueStatusTextColor(item) },
                      ]}
                    >
                      {getIssueStatusText(item)}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.cardDescription,
                    { color: theme.secondaryText },
                  ]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.shipmentInfo}>
                    <Ionicons
                      name="cube-outline"
                      size={wp(4)}
                      color={theme.secondaryText}
                    />
                    <Text
                      style={[
                        styles.shipmentText,
                        { color: theme.secondaryText },
                      ]}
                    >
                      #{item.shipmentId} •{" "}
                      {item.shipment?.destination || "Onbekend"}
                    </Text>
                  </View>

                  <Text
                    style={[styles.dateText, { color: theme.secondaryText }]}
                  >
                    {formatDate(item.createdAt)}
                  </Text>
                </View>

                <View style={styles.cardAction}>
                  <Ionicons
                    name="chevron-forward"
                    size={wp(5)}
                    color={theme.secondaryText}
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
    paddingHorizontal: wp(6),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
  },
  headerTitle: {
    fontSize: wp(6),
    fontWeight: "bold",
  },
  statsContainer: {
    marginBottom: hp(3),
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: wp(7),
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: wp(3.5),
    marginTop: hp(0.5),
  },
  statDivider: {
    width: 1,
    height: hp(4),
    backgroundColor: "#4B5563",
    opacity: 0.3,
  },
  card: {
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    position: "relative",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: hp(1),
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: wp(2),
  },
  cardTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    marginLeft: wp(2),
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
  },
  statusText: {
    fontSize: wp(3),
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: wp(3.5),
    lineHeight: wp(5),
    marginBottom: hp(1.5),
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shipmentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  shipmentText: {
    fontSize: wp(3.5),
    marginLeft: wp(1),
  },
  dateText: {
    fontSize: wp(3),
  },
  cardAction: {
    position: "absolute",
    right: wp(4),
    top: "50%",
    transform: [{ translateY: -wp(2.5) }],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(8),
  },
  emptyTitle: {
    fontSize: wp(5.5),
    fontWeight: "bold",
    marginTop: hp(2),
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: wp(4),
    textAlign: "center",
    marginTop: hp(1),
    lineHeight: wp(6),
  },
  loadingText: {
    fontSize: wp(4),
    marginTop: hp(2),
  },
  error: {
    fontSize: wp(4),
    textAlign: "center",
    marginTop: hp(2),
  },
  retryButton: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    marginTop: hp(2),
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: wp(4),
    fontWeight: "600",
  },
});

export default MyIssues;
