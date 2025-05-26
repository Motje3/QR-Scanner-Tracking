// homescreen/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { useApp } from "../context/AppContext";

export default function HomescreenLayout() {
  const { darkMode } = useApp();
  const bg = darkMode ? "#030014" : "#ffffff";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: bg },

        // Animation settings for both forward and backward navigation
        animation: "slide_from_right",
        animationDuration: 100,

        // Enable gesture for back navigation
        gestureEnabled: true,
        gestureDirection: "horizontal",

        // Change from transparentModal to card for consistent animations
        presentation: "card",

        // Ensure consistent animations
        animationTypeForReplace: "push",
      }}
    />
  );
}
