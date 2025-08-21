import React, { useEffect } from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { PreferencesProvider } from './src/contexts/PreferencesContext';
import { ProfileImageProvider } from './src/contexts/ProfileImageContext';
import AppNavigator from './src/navigation';
import { notificationService } from './src/services/notifications';
import { ToastProvider } from './src/components/ToastProvider';
import { StatusBarManager } from './src/components/StatusBarManager';

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
    <ThemeProvider>
      <PreferencesProvider>
        <AuthProvider>
          <SettingsProvider>
            <ProfileImageProvider>
              <ToastProvider>
                <AppNavigator />
                <StatusBarManager />
              </ToastProvider>
            </ProfileImageProvider>
          </SettingsProvider>
        </AuthProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
