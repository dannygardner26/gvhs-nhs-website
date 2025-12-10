"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthUser {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userIdOrEmail: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<AuthUser>) => void;
  error: string | null;
  clearError: () => void;
}

interface RegisterData {
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  password?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('nhs_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('nhs_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('nhs_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nhs_user');
    }
  }, [user]);

  const clearError = () => setError(null);

  const login = async (userIdOrEmail: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Account-based login with password (no auto check-in)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIdOrEmail, password }),
      });

      const data = await response.json();

      if (response.ok && data.userId) {
        const authUser: AuthUser = {
          id: data.id || data.userId,
          userId: data.userId,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          username: data.username || `${data.firstName} ${data.lastName}`.trim() || data.userId,
          email: data.email,
        };

        setUser(authUser);
        setIsLoading(false);
        return true;
      } else {
        setError(data.message || data.error || 'Login failed');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection.');
      setIsLoading(false);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Register new user (no auto check-in)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customUserId: userData.userId,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.userId) {
        const authUser: AuthUser = {
          id: data.id || data.userId,
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          username: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
        };

        setUser(authUser);
        setIsLoading(false);
        return true;
      } else {
        setError(data.message || data.error || 'Registration failed');
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check your connection.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nhs_user');
    localStorage.removeItem('checkin_userId'); // Clear any check-in data
  };

  const updateUser = (userData: Partial<AuthUser>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
