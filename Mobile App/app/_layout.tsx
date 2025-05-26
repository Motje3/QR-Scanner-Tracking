import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#030014" }}>
      <AuthProvider>
        <AppProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              // Use a consistent dark background everywhere
              contentStyle: { backgroundColor: "#030014" },

              // Apply fade animation to all transitions by default
              animation: "fade",
              animationDuration: 300,
              presentation: "card",
              gestureEnabled: false,
              freezeOnBlur: true,
            }}
          >
            {/* All screens fade in/out smoothly with no sliding */}
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="homescreen" />
            <Stack.Screen name="todaysshipments" />
            <Stack.Screen name="profile/editprofile" />
            <Stack.Screen name="profile/changepassword" />
            <Stack.Screen name="profile/appsettings" />
            <Stack.Screen name="shipment/shipmentdetails" />
            <Stack.Screen name="shipment/reportissue" />
            <Stack.Screen name="login/loginpage" />
          </Stack>
        </AppProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
