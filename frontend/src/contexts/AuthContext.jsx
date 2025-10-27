import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('userToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        // Set the token on our API client for all future requests
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          // Fetch the user's data
          const response = await apiClient.get('/users/me');
          setUser(response.data);
        } catch (error) {
          // Token is invalid or expired
          console.error("Failed to fetch user:", error);
          setToken(null);
          localStorage.removeItem('userToken');
          delete apiClient.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    // We already have a login function in apiClient, let's use it
    // (We'll need to modify apiClient.js slightly)
    const data = await apiClient.login(email, password);
    setToken(data.access_token);
    localStorage.setItem('userToken', data.access_token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('userToken');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const authValue = {
    user,
    setUser,
    token,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};