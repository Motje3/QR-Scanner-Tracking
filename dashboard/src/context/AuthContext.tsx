// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for making API requests

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    return storedAuth === "true";
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("isAuthenticated", String(isAuthenticated));
  }, [isAuthenticated]);

  interface LoginResult {
    success: boolean;
    message?: string;
  }

  const login = async (
    username: string,
    password: string
  ): Promise<LoginResult> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/profile/login`, {
        username,
        password,
      });

      if (
        response.status === 200 &&
        response.data.token &&
        response.data.user
      ) {
        const user = response.data.user;

        // Only allow Admin or Manager through
        if (user.role === "Admin" || user.role === "Manager") {
          setIsAuthenticated(true);
          localStorage.setItem("authToken", response.data.token);
          localStorage.setItem("userProfile", JSON.stringify(user));
          return { success: true };
        } else {
          console.warn(`Access denied for role: ${user.role}`);
          return {
            success: false,
            message: "Je hebt geen toegang tot het dashboard.",
          };
        }
      } else {
        console.error(
          "Login failed: Unexpected response structure",
          response.data
        );
        return {
          success: false,
          message: "Onverwachte serverreactie tijdens inloggen.",
        };
      }
    } catch (error: any) {
      let msg = "Er is iets misgegaan bij het inloggen.";
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Use the server-provided message if available
          msg = error.response.data?.message || error.response.statusText;
        } else if (error.request) {
          msg = "Geen respons ontvangen van de server.";
        } else {
          msg = error.message;
        }
      }
      console.error("Login error:", msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("authToken"); // Clear token on logout
    localStorage.removeItem("userProfile"); // Clear user profile on logout
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
