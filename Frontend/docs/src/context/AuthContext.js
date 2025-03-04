import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is logged in by checking the cookie
    const checkAuth = async () => {
      try {
        const response = await authService.checkAuth(); // Create this endpoint to verify token
        setToken(response.token); // Set token if valid
      } catch (error) {
        console.error('Not authenticated:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setToken(response.token); // This may not be necessary if using cookies
  };

  const logout = () => {
    // Clear token and redirect
    setToken(null);
  };

  const value = {
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token // Check if user is authenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 