// profile/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { useApp } from "../context/AppContext";
import { StatusBar } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

export default function ProfileLayout() {
  const { darkMode } = useApp();
  const bg = darkMode ? "#030014" : "#ffffff";

  return (
    <>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />
      <ExpoStatusBar style={darkMode ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: bg },
          animation: "slide_from_right",
          animationDuration: 150,
          gestureEnabled: true,
          gestureDirection: "horizontal",
          presentation: "card",
          animationTypeForReplace: "push",
          freezeOnBlur: true,
        }}
      />
    </>
  );
}
