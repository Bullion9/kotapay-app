import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileImageContextType {
  profileImage: string | null;
  setProfileImage: (imageUri: string | null) => void;
  loadProfileImage: () => Promise<void>;
  saveProfileImage: (imageUri: string) => Promise<void>;
  removeProfileImage: () => Promise<void>;
}

const ProfileImageContext = createContext<ProfileImageContextType | undefined>(undefined);

interface ProfileImageProviderProps {
  children: ReactNode;
}

export const ProfileImageProvider: React.FC<ProfileImageProviderProps> = ({ children }) => {
  const [profileImage, setProfileImageState] = useState<string | null>(null);

  const loadProfileImage = async () => {
    try {
      const savedImage = await AsyncStorage.getItem('profileImage');
      if (savedImage) {
        console.log('📸 Loading saved profile image:', savedImage);
        setProfileImageState(savedImage);
      }
    } catch (error) {
      console.error('❌ Error loading profile image:', error);
    }
  };

  const saveProfileImage = async (imageUri: string) => {
    try {
      await AsyncStorage.setItem('profileImage', imageUri);
      setProfileImageState(imageUri);
      console.log('💾 Profile image saved to storage');
    } catch (error) {
      console.error('❌ Error saving profile image:', error);
    }
  };

  const removeProfileImage = async () => {
    try {
      await AsyncStorage.removeItem('profileImage');
      setProfileImageState(null);
      console.log('🗑️ Profile image removed from storage');
    } catch (error) {
      console.error('❌ Error removing profile image:', error);
    }
  };

  const setProfileImage = (imageUri: string | null) => {
    setProfileImageState(imageUri);
  };

  useEffect(() => {
    loadProfileImage();
  }, []);

  const value: ProfileImageContextType = {
    profileImage,
    setProfileImage,
    loadProfileImage,
    saveProfileImage,
    removeProfileImage,
  };

  return (
    <ProfileImageContext.Provider value={value}>
      {children}
    </ProfileImageContext.Provider>
  );
};

export const useProfileImage = (): ProfileImageContextType => {
  const context = useContext(ProfileImageContext);
  if (!context) {
    throw new Error('useProfileImage must be used within a ProfileImageProvider');
  }
  return context;
};
