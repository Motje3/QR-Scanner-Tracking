// shipment/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { useApp } from "../context/AppContext";

export default function ShipmentLayout() {
  const { darkMode } = useApp();
  const bg = darkMode ? "#090723" : "#ffffff";

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: bg },

        // Change animation to fade instead of slide
        animation: "fade",
        animationDuration: 200,

        // Keep gesture-based navigation
        gestureEnabled: true,
        gestureDirection: "horizontal",

        // Use card presentation for consistent background handling
        presentation: "card",

        // Use push animation type for consistency
        animationTypeForReplace: "push",

        // Prevent background flash
        freezeOnBlur: true,
      }}
    />
  );
}
