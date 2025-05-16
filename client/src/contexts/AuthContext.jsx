import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3380';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check for token in localStorage on initial load
    const token = localStorage.getItem('admin_auth_token');
    // Basic check, could be more robust (e.g., token expiry)
    return !!token;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      // The backend will verify credentials and, if valid,
      // could return a session token or just a success message.
      // For basic auth, the browser handles the Authorization header on subsequent requests.
      const base64Credentials = btoa(`${username}:${password}`);
      
      // We make a dummy request to a protected route to see if credentials work.
      // The actual auth happens via the Basic Auth header managed by the browser/axios.
      // A dedicated /login endpoint on the backend could also be used if it 
      // sets a cookie or returns a token for session management beyond Basic Auth.
      await axios.get(`${API_URL}/api/users`, { // Using /api/users as a protected route to test auth
        headers: {
          'Authorization': `Basic ${base64Credentials}`
        }
      });
      
      // If the request is successful, credentials are valid.
      localStorage.setItem('admin_auth_token', base64Credentials); // Store for session persistence
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Basic ${base64Credentials}`;
      return true;
    } catch (err) {
      console.error("Login failed:", err.response ? err.response.data : err.message);
      setError(err.response?.data?.error || 'Invalid credentials or server error');
      localStorage.removeItem('admin_auth_token');
      setIsAuthenticated(false);
      delete axios.defaults.headers.common['Authorization'];
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_auth_token');
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
    // Optionally, notify backend to invalidate session if using session tokens
  };

  // Effect to set default auth header if token exists on page load
  useEffect(() => {
    const token = localStorage.getItem('admin_auth_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Basic ${token}`;
      // Potentially add a check here to verify the token with the backend
    } 
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, error, login, logout }}>
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