import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  ImageSourcePropType,
} from "react-native";
import React from "react";
import { icons } from "@/constants/icons";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useApp } from "../context/AppContext";
import { wp, hp } from "../utils/responsive";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const fallbackImage = require("../../assets/images/default-profile.png");

const Home = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { darkMode, username, accentColor, profileImage } = useApp();

  const theme = {
    background: darkMode ? "#0f0D23" : "#ffffff",
    text: darkMode ? "#ffffff" : "#0f0D23",
    secondaryText: darkMode ? "#9CA3AF" : "#6B7280",
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login/loginpage");
    }
  }, [user, isLoading]);

  if (isLoading || !user) return null;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: wp(6),
        paddingTop: hp(10),
      }}
    >
      <ExpoStatusBar style={darkMode ? "light" : "dark"} />
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* Welcome Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text
            style={{
              color: theme.secondaryText,
              fontSize: wp(4),
              marginBottom: hp(0.5),
            }}
          >
            Welkom terug,
          </Text>
          <Text
            style={{ color: theme.text, fontSize: wp(6), fontWeight: "bold" }}
          >
            {username}
          </Text>
        </View>
        <Image
          source={
            profileImage && profileImage.trim() !== ""
              ? { uri: profileImage }
              : fallbackImage
          }
          style={{ width: wp(10), height: wp(10), borderRadius: wp(5) }}
        />
      </View>

      {/* Grid Buttons */}
      <View
        style={{
          marginTop: hp(3),
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {/* Zendingen */}
        <TouchableOpacity
          style={{
            borderRadius: wp(3),
            overflow: "hidden",
            width: "100%",
            marginBottom: hp(2),
          }}
          onPress={() => {
            setTimeout(() => {
              router.push("/homescreen/todaysshipments");
            }, 50);
          }}
        >
          <LinearGradient
            colors={[accentColor, "#320042"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: wp(6),
              borderRadius: wp(3),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={icons.orders as ImageSourcePropType}
              style={{ width: wp(10), height: wp(10), tintColor: "#fff" }}
            />
            <Text style={{ color: "#fff", fontSize: wp(4), marginTop: hp(1) }}>
              Zendingen van vandaag
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Scan */}
        <TouchableOpacity
          style={{
            borderRadius: wp(3),
            overflow: "hidden",
            width: "100%",
            marginBottom: hp(2),
          }}
          onPress={() => {
            setTimeout(() => {
              router.push("/(tabs)/scan");
            }, 50);
          }}
        >
          <LinearGradient
            colors={["#1A5BC4", "#111A47"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: wp(6),
              borderRadius: wp(3),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={icons.scaninfo as ImageSourcePropType}
              style={{ width: wp(10), height: wp(10), tintColor: "#fff" }}
            />
            <Text style={{ color: "#fff", fontSize: wp(4), marginTop: hp(1) }}>
              Zending scannen
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* My Issues Button - Replace the first "Feedback geven" */}
        <TouchableOpacity
          style={{
            borderRadius: wp(3),
            overflow: "hidden",
            width: "100%",
            marginBottom: hp(2),
          }}
          onPress={() => {
            setTimeout(() => {
              router.push("/homescreen/MyIssues"); // lowercase file name
            }, 50);
          }}
        >
          <LinearGradient
            colors={["#DC2626", "#7F1D1D"]} // Red gradient for issues
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: wp(6),
              borderRadius: wp(3),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="warning-outline" // Better icon for issues
              size={wp(10)}
              color="#fff"
            />
            <Text style={{ color: "#fff", fontSize: wp(4), marginTop: hp(1) }}>
              Mijn Problemen
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Geef Feedback Button */}
        <TouchableOpacity
          style={{
            borderRadius: wp(3),
            overflow: "hidden",
            width: "100%",
            marginBottom: hp(2),
          }}
          onPress={() => {
            setTimeout(() => {
              router.push("/homescreen/AppFeedback");
            }, 50);
          }}
        >
          <LinearGradient
            colors={["#4a964d", "#19331a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: wp(6),
              borderRadius: wp(3),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={wp(10)}
              color="#fff"
            />
            <Text style={{ color: "#fff", fontSize: wp(4), marginTop: hp(1) }}>
              Feedback geven
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Home;
