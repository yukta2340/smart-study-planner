import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import { loginUser as loginApi, registerUser as registerApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [loading, setLoading] = useState(true);

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
      localStorage.removeItem('token');
    }
  }, [isLoaded, isSignedIn, getToken]);

  const login = async (email, password) => {
    try {
      const { data } = await loginApi({ email: email.trim().toLowerCase(), password });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
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
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await signOut();

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: Boolean(isSignedIn),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAppAuth = () => useContext(AuthContext);
