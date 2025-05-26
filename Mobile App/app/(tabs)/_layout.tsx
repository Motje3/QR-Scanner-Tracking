import React from "react";
import { Tabs } from "expo-router";
import CustomNavBar from "../components/CustomNavBar";
import { useApp } from "../context/AppContext";

export default function RootTabs() {
  const { darkMode } = useApp();
  const bgColor = darkMode ? "#030014" : "#ffffff";

  return (
    <Tabs
      tabBar={(props) => <CustomNavBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: bgColor }, // ← dark behind each tab
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="scan" options={{ title: "Scannen" }} />
      <Tabs.Screen name="stats" options={{ title: "Statistieken" }} />
      <Tabs.Screen name="profile" options={{ title: "Profiel" }} />
    </Tabs>
  );
}
