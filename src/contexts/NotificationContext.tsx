import React, { createContext, useContext, useState, useEffect } from 'react';

interface NotificationContextType {
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  incrementUnreadCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock unread count for demo purposes
  useEffect(() => {
    // Simulate receiving notifications
    const interval = setInterval(() => {
      setUnreadCount(prev => prev < 10 ? prev + 1 : prev);
    }, 30000); // Add a notification every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (notificationId: string) => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const incrementUnreadCount = () => {
    setUnreadCount(prev => prev + 1);
  };

  const value: NotificationContextType = {
    unreadCount,
    markAsRead,
    markAllAsRead,
    incrementUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
