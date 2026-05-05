import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUserOTP, registerUserOTP } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize auth state on mount - non-blocking
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Auth init error:', e);
    }
  }, []);

  const login = async (email, password, otp) => {
    setLoading(true);
    try {
      const { data } = await loginUserOTP({ email: email.trim().toLowerCase(), password, otp });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      setUser(data);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password, otp }) => {
    setLoading(true);
    try {
      const { data } = await registerUserOTP({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        otp,
      });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      setUser(data);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAuthenticated = Boolean(user && localStorage.getItem('token'));

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAppAuth = () => useContext(AuthContext);

export { AuthContext };
