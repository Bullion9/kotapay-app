import React, { useEffect } from 'react';
// @ts-ignore
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { ProfileImageProvider } from './src/contexts/ProfileImageContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import AppNavigator from './src/navigation';
import { notificationService } from './src/services/notifications';
import { ToastProvider } from './src/components/ToastProvider';

export default function App() {
  useEffect(() => {
    // Initialize notifications when app starts
    const initNotifications = async () => {
      try {
        await notificationService.initialize();
        console.log('Notifications initialized successfully');
      } catch (error) {
        console.error('Failed to initialize notifications:', error);
      }
    };

    initNotifications();
  }, []);

  return (
    <SettingsProvider>
      <AuthProvider>
        <ProfileImageProvider>
          <ToastProvider>
            <AppNavigator />
            <StatusBar style="auto" />
          </ToastProvider>
        </ProfileImageProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
