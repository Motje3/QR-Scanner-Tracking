import React from "react";
import { Stack } from "expo-router";

export default function LoginLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#3E1F92" },
        animation: "fade",
        animationDuration: 300,
        gestureEnabled: false,
        presentation: "modal",
        animationTypeForReplace: "push",
        freezeOnBlur: true,
      }}
    />
  );
}
