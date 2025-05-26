import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { View, Text, ActivityIndicator } from "react-native";

export default function IndexRedirect() {
  const { isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login/loginpage");
      }
    }
  }, [isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#7C3AED" />
    </View>
  );
}
