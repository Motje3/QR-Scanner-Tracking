// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for making API requests

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    return storedAuth === 'true';
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/profile/login`, { username, password }); // Corrected path to /api/profile/login

      // Check if the login was successful based on your backend's response structure
      // The backend returns a 'token' and a 'user' object on success
      if (response.status === 200 && response.data.token && response.data.user) {
        setIsAuthenticated(true);
        // Optionally, store the token or user details in localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userProfile', JSON.stringify(response.data.user)); // Store user profile as string
        return true;
      } else {
        // This 'else' block might be hit if the status is 200 but data is unexpected
        console.error('Login failed: Unexpected response structure', response.data);
        return false;
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The server responded with a status code other than 2xx
          // For example, 401 Unauthorized for invalid credentials
          console.error('Login error (server response):', error.response.data.message || error.response.statusText);
          // Return false here, allowing the Login.tsx to show the error
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
        }
      } else {
        console.error('Unexpected login error:', error);
      }
      // Return false on any error so the Login.tsx component can display a message
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('authToken'); // Clear token on logout
    localStorage.removeItem('userProfile'); // Clear user profile on logout
    navigate('/login');
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};