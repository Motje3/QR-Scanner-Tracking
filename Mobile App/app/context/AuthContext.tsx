// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { InteractionManager } from "react-native";
import { API_BASE_URL } from "../config/env";

type AuthContextType = {
  user: any;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (username: string, password: string) => {
    // authenticate against your backend
    const res = await fetch(`${API_BASE_URL}/api/profile/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }
    const data = await res.json();

    // hydrate context
    setToken(data.token);
    setUser(data.user);

    // persist session for 7 days
    await AsyncStorage.setItem(
      "userSession",
      JSON.stringify({
        token: data.token,
        user: data.user,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      })
    );
  };

  const logout = async () => {
    await AsyncStorage.removeItem("userSession");
    setUser(null);
    setToken(null);
    // Directly send to the login page
    router.replace("/login/loginpage");
  };

  useEffect(() => {
    // on app start, try to restore
    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem("userSession");
        if (stored) {
          const session = JSON.parse(stored);
          if (Date.now() < session.expiresAt) {
            setToken(session.token);
            setUser(session.user);
          } else {
            // expired
            await AsyncStorage.removeItem("userSession");
          }
        }
      } catch (e) {
        console.error("⚠️ Error restoring session", e);
      } finally {
        setIsLoading(false);
      }
    };

    InteractionManager.runAfterInteractions(restoreSession);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
