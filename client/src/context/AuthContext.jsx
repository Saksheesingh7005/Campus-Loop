import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');

  useEffect(() => {
    // Restore session from localStorage
    const saved = localStorage.getItem('crs_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('crs_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setUser(res.user);
    localStorage.setItem('crs_user', JSON.stringify(res.user));
    if (res.token) {
      localStorage.setItem('crs_token', res.token);
    }
    setIsAuthModalOpen(false);
    return res.user;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    setUser(res.user);
    localStorage.setItem('crs_user', JSON.stringify(res.user));
    if (res.token) {
      localStorage.setItem('crs_token', res.token);
    }
    setIsAuthModalOpen(false);
    return res.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crs_user');
    localStorage.removeItem('crs_token');
  };

  const quickLoginDemo = async (type = 'student') => {
    if (type === 'admin') {
      return login('admin@campus.edu', 'adminpassword');
    }
    // Default student demo
    return login('aarav@campus.edu', 'password123');
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    quickLoginDemo,
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    setAuthModalTab
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
