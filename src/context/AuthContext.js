import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // State'i localStorage'daki token ile başlatıyoruz, bu sayede sayfa yenilense bile oturum korunur.
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [token]);

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    if (response.data.token && response.data.user) {
      const { token, user } = response.data;
      // Önce localStorage'ı güncelle
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      // Sonra React state'ini güncelle (bu, yeniden render'ı tetikleyecek)
      setToken(token);
      setUser(user);
      // Son olarak yönlendirmeyi yap
      navigate('/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  // Context aracılığıyla paylaşılacak değerler ve fonksiyonlar
  const value = { user, token, login, logout, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Diğer component'lerin context'e kolayca erişmesini sağlayan custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};