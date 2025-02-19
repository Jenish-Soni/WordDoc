import { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  const login = (newToken) => {
    console.log('Setting new token in AuthContext:', newToken); // Debug log
    
    // Ensure token has Bearer prefix
    const tokenWithBearer = newToken.startsWith('Bearer ') 
      ? newToken 
      : `Bearer ${newToken}`;
    
    setToken(tokenWithBearer);
    setIsAuthenticated(true);
    localStorage.setItem('token', tokenWithBearer);
    console.log('Token stored:', tokenWithBearer); // Debug log
  };

  const logout = () => {
    console.log('Logging out, clearing token'); // Debug log
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      token,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 