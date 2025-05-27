// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize isAuthenticated based on localStorage to persist login across refreshes
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    return storedAuth === 'true'; // Convert string to boolean
  });

  const navigate = useNavigate();

  // Update localStorage whenever isAuthenticated changes
  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real application, you would make an API call here:
    // const response = await axios.post('/api/login', { username, password });
    // if (response.data.success) {
    //   setIsAuthenticated(true);
    //   return true;
    // }
    // return false;

    // For now, a simple mock login:
    if (username === 'admin' && password === 'admin') { // Or your desired credentials
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    navigate('/login'); // Redirect to login page after logout
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