import React, { createContext, useContext, useState } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await authService.login(username, password);
      console.log('Login response:', response); // Debug log
      
      if (!response.token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', response.token);
      setToken(response.token);
      return response; // Return the response
    } catch (error) {
      console.error('Login error in context:', error);
      throw error; // Re-throw the error to be caught by the component
    } finally {
      setLoading(false);
    }
  };

  const signup = async (username, password) => {
    try {
      setLoading(true);
      const response = await authService.signup(username, password);
      localStorage.setItem('token', response.token);
      setToken(response.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const value = {
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!token // Add this helper
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 