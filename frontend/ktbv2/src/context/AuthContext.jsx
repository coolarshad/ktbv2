import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async (accessToken) => {
    try {
      const response = await axios.get(`${BASE_URL}/accounts/profile/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  // Once user is fetched, loading can be false
  useEffect(() => {
    if (user !== null || !token) {
      setLoading(false);
    }
  }, [user, token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/token/`, {
        email,
        password,
      });
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setToken(access);
      await fetchProfile(access);
      navigate('/');
      return { success: true };
    } catch (error) {
      console.error("Login error", error);
      return { success: false, error: error.response?.data?.detail || "Login failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  // Activity tracking for 15 min auto-logout
  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      if (token) {
        // 15 minutes = 15 * 60 * 1000 = 900000 ms
        inactivityTimer = setTimeout(() => {
          logout();
          alert("You have been logged out due to inactivity.");
        }, 900000);
      }
    };

    if (token) {
      // Attach event listeners to document
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => document.addEventListener(event, resetTimer));
      resetTimer(); // start timer

      return () => {
        clearTimeout(inactivityTimer);
        events.forEach(event => document.removeEventListener(event, resetTimer));
      };
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
