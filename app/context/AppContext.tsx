import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { View, Text } from "react-native";
import { useAuth } from "./AuthContext";
import { API_BASE_URL } from "../config/env";

type AppContextType = {
  username: string;
  setUsername: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  accentColor: string;
  setAccentColor: (value: string) => void;
  profileImage: string | null;
  setProfileImage: (value: string | null) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
};

const defaultAccent = "#A970FF";
const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuth();

  // Local UI state & preferences
  const [username, setUsername] = useState("Laden...");
  const [email, setEmail] = useState("...");
  const [accentColorState, setAccentColorState] = useState(defaultAccent);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [darkModeState, setDarkModeState] = useState<boolean>(true);
  const [notificationsEnabledState, setNotificationsEnabledState] =
    useState<boolean>(true);
  const [isReady, setIsReady] = useState(false);

  // Fetch preferences from backend (only when logged in)
  useEffect(() => {
    const fetchPreferences = async () => {
      if (user && token) {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/profile/${user.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const data = res.data;

          setUsername(data.fullName);
          setEmail(data.email);
          setProfileImage(data.imageUrl);
          setAccentColorState(data.accentColor ?? defaultAccent);
          setDarkModeState(data.darkMode ?? true);
          setNotificationsEnabledState(data.notificationsEnabled ?? true);

          console.log("✅ App preferences loaded");
        } catch (err) {
          console.error("❌ Failed to load preferences:", err);
        }
      }

      // Always mark ready (even if no user or on error)
      setIsReady(true);
    };

    fetchPreferences();
  }, [user, token]);

  // While logged in but prefs still loading, show a splash
  if (user && !isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0f0D23",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>Voorkeuren laden…</Text>
      </View>
    );
  }

  // Push settings updates to backend
  const updateSettings = async (
    accentColor: string,
    darkMode: boolean,
    notificationsEnabled: boolean
  ) => {
    if (!user || !token) return;

    try {
      await axios.put(
        `${API_BASE_URL}/api/profile/${user.id}/settings`,
        { accentColor, darkMode, notificationsEnabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Settings updated");
    } catch (err) {
      console.error("❌ Error updating settings:", err);
    }
  };

  // Local setters that also push to backend
  const setDarkMode = async (value: boolean) => {
    await AsyncStorage.setItem("darkMode", value.toString());
    setDarkModeState(value);
    updateSettings(accentColorState, value, notificationsEnabledState);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    updateSettings(color, darkModeState, notificationsEnabledState);
  };

  const setNotificationsEnabled = (enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    updateSettings(accentColorState, darkModeState, enabled);
  };

  return (
    <AppContext.Provider
      value={{
        username,
        setUsername,
        email,
        setEmail,
        accentColor: accentColorState,
        setAccentColor,
        profileImage,
        setProfileImage,
        darkMode: darkModeState,
        setDarkMode,
        notificationsEnabled: notificationsEnabledState,
        setNotificationsEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
