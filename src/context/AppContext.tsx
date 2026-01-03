import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Notification } from '../types';
import { authAPI, userAPI, notificationAPI } from '../utils/api';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, password: string, name: string, role: 'learner' | 'mentor' | 'both') => Promise<boolean>;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  refreshUser: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('skillshare_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        // Refresh user data from backend
        refreshUserData(user.id);
        refreshNotificationsData(user.id);
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('skillshare_user');
      }
    }
  }, []);

  const refreshUserData = async (userId: string) => {
    try {
      const user = await userAPI.getUser(userId);
      setCurrentUser(user);
      localStorage.setItem('skillshare_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const refreshNotificationsData = async (userId: string) => {
    try {
      const notifs = await notificationAPI.getNotifications(userId);
      setNotifications(notifs);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const refreshUser = async () => {
    if (currentUser) {
      await refreshUserData(currentUser.id);
    }
  };

  const refreshNotifications = async () => {
    if (currentUser) {
      await refreshNotificationsData(currentUser.id);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user } = await authAPI.login(email, password);
      setCurrentUser(user);
      localStorage.setItem('skillshare_user', JSON.stringify(user));
      
      // Load notifications
      const notifs = await notificationAPI.getNotifications(user.id);
      setNotifications(notifs);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setNotifications([]);
    localStorage.removeItem('skillshare_user');
  };

  const signup = async (email: string, password: string, name: string, role: 'learner' | 'mentor' | 'both'): Promise<boolean> => {
    try {
      const { user } = await authAPI.signup(email, password, name, role);
      setCurrentUser(user);
      localStorage.setItem('skillshare_user', JSON.stringify(user));
      
      // Load notifications
      const notifs = await notificationAPI.getNotifications(user.id);
      setNotifications(notifs);
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated: currentUser !== null,
        login,
        logout,
        signup,
        notifications,
        markNotificationAsRead,
        refreshUser,
        refreshNotifications
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
