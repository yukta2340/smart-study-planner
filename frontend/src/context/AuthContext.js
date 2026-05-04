import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import { loginUser as loginApi, registerUser as registerApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();
  const [loading, setLoading] = useState(true);
  const [nativeUser, setNativeUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!isLoaded) return;

    setLoading(false);

    if (isSignedIn) {
      getToken()
        .then((token) => {
          if (token) {
            localStorage.setItem('token', token);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    } else {
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!storedToken) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setNativeUser(null);
      }
    }
  }, [isLoaded, isSignedIn, getToken]);

  const login = async (email, password) => {
    try {
      const { data } = await loginApi({ email: email.trim().toLowerCase(), password });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      setNativeUser(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      const { data } = await registerApi({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      setNativeUser(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    if (isSignedIn) {
      await signOut();
    }
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setNativeUser(null);
  };

  const activeUser = isSignedIn ? clerkUser : nativeUser;
  const tokenExists = typeof window !== 'undefined' ? Boolean(localStorage.getItem('token')) : false;
  const isAuthenticated = Boolean(isSignedIn || tokenExists);

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
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
