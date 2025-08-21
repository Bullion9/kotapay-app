import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  Linking,
  RefreshControl,
} from 'react-native';
import { ChevronLeft, Search, Users, PlusCircle } from 'lucide-react-native';
import { colors, globalStyles } from '../theme';
import SwipeableContactRow from '../components/SwipeableContactRow';

interface Contact {
  id: string;
  name: string;
  phone: string;
  profileImage?: string;
  isRegistered?: boolean;
}

interface ContactsScreenProps {
  navigation: any;
  route: any;
}

const ContactsScreen: React.FC<ContactsScreenProps> = ({ navigation, route }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filtered, setFiltered] = useState<Contact[]>([]);
  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for demo - replace with actual API call
  useEffect(() => {
    fetchContacts();
  }, []);

  // Handle QR scan results
  useEffect(() => {
    if (route.params?.scannedData) {
      const scannedData = route.params.scannedData;
      
      // Parse QR data and add contact
      try {
        const qrData = JSON.parse(scannedData);
        
        if (qrData.userId) {
          // Create a contact from scanned user data
          const scannedContact: Contact = {
            id: qrData.userId,
            name: qrData.name || 'Unknown User',
            phone: qrData.phone || 'Unknown',
            profileImage: qrData.profileImage,
            isRegistered: true,
          };
          
          // Add to contacts list if not already exists
          const existingContact = contacts.find(c => c.id === scannedContact.id || c.phone === scannedContact.phone);
          if (!existingContact) {
            setContacts(prev => [scannedContact, ...prev]);
            setFiltered(prev => [scannedContact, ...prev]);
            Alert.alert('Contact Added', `${scannedContact.name} has been added to your contacts`);
          } else {
            Alert.alert('Contact Exists', `${scannedContact.name} is already in your contacts`);
          }
        }
        
      } catch (error) {
        // If not JSON, treat as plain text (maybe a phone number)
        console.log('QR scan result:', scannedData);
        console.error('Error parsing QR data:', error);
        Alert.alert('QR Code Scanned', `Scanned: ${scannedData}`);
      }
      
      // Clear the scanned data from route params
      navigation.setParams({ scannedData: undefined });
    }
  }, [route.params?.scannedData, contacts, navigation]);

  const fetchContacts = async () => {
    // Mock contacts data - replace with actual API call
    const mockContacts: Contact[] = [
      { 
        id: 'mock_1', 
        name: 'John Doe', 
        phone: '+1 (555) 123-4567',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        isRegistered: true
      },
      { 
        id: 'mock_2', 
        name: 'Jane Smith', 
        phone: '+1 (555) 987-6543',
        profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        isRegistered: true
      },
      { 
        id: 'mock_3', 
        name: 'Mike Johnson', 
        phone: '+1 (555) 456-7890',
        // No profile image - will use initials
        isRegistered: false
      },
      { 
        id: 'mock_4', 
        name: 'Sarah Wilson', 
        phone: '+1 (555) 321-0987',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        isRegistered: true
      },
    ];
    
    setContacts(mockContacts);
    setFiltered(mockContacts);
  };

  useEffect(() => {
    setFiltered(
      contacts.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query)
      )
    );
  }, [query, contacts]);

  const renderContact = ({ item }: { item: Contact }) => (
    <SwipeableContactRow 
      item={item} 
      onDelete={deleteContact}
      onUndo={undoDeleteContact}
    />
  );

  const renderSeparator = () => (
    <View style={styles.separator} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Users size={48} color="#A3AABE" />
      <Text style={styles.emptyText}>No contacts yet</Text>
    </View>
  );

  const handleAddContact = () => {
    Alert.alert(
      'Add Contacts',
      'Choose how to add contacts:',
      [
        {
          text: 'Scan QR Code',
          onPress: () => navigation.navigate('QRScanner'),
        },
        {
          text: 'From Phone Contacts',
          onPress: requestContactsPermission,
        },
        {
          text: 'Add Manually',
          onPress: () => navigation.navigate('AddContact'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const requestContactsPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Contacts Permission',
            message: 'KotaPay needs access to your contacts to import them.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          loadPhoneContacts();
        } else {
          Alert.alert(
            'Permission Denied',
            'Cannot access contacts without permission. You can grant permission in app settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
        }
      } else {
        // For iOS, you would typically use expo-contacts or react-native-contacts
        // which handles permissions automatically
        loadPhoneContacts();
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request contacts permission');
    }
  };

  const loadPhoneContacts = () => {
    // Simulate loading contacts from phone
    // In real app, you would use expo-contacts or react-native-contacts
    Alert.alert(
      'Loading Contacts',
      'Phone contacts are being loaded...',
      [{ text: 'OK' }]
    );
    
    // Mock additional contacts that would come from phone
    const timestamp = Date.now();
    const phoneContacts: Contact[] = [
      { 
        id: `phone_${timestamp}_1`, 
        name: 'Mom', 
        phone: '+1 (555) 111-1111',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        isRegistered: true
      },
      { 
        id: `phone_${timestamp}_2`, 
        name: 'Dad', 
        phone: '+1 (555) 222-2222',
        // No profile image - will use initials
        isRegistered: false
      },
      { 
        id: `phone_${timestamp}_3`, 
        name: 'Best Friend', 
        phone: '+1 (555) 333-3333',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isRegistered: true
      },
      { 
        id: `phone_${timestamp}_4`, 
        name: 'Work Colleague', 
        phone: '+1 (555) 444-4444',
        // No profile image - will use initials
        isRegistered: false
      },
      { 
        id: `phone_${timestamp}_5`, 
        name: 'Sister', 
        phone: '+1 (555) 555-5555',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        isRegistered: true
      },
    ];
    
        // Only add contacts that don't already exist
    setContacts(prev => {
      const existingIds = prev.map(contact => contact.id);
      const newContacts = phoneContacts.filter(contact => !existingIds.includes(contact.id));
      return [...prev, ...newContacts];
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate refresh delay
      await new Promise<void>(resolve => setTimeout(resolve, 1000));
      await fetchContacts();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const deleteContact = (contactId: string) => {
    const contactToDelete = contacts.find(c => c.id === contactId);
    if (contactToDelete) {
      setContacts(prev => prev.filter(c => c.id !== contactId));
      
      // Show undo snackbar
      Alert.alert(
        'Contact Deleted',
        `${contactToDelete.name} has been removed from your contacts.`,
        [
          {
            text: 'Undo',
            onPress: () => undoDeleteContact(contactToDelete),
          },
          { text: 'OK' },
        ]
      );
    }
  };

  const undoDeleteContact = (contact: Contact) => {
    setContacts(prev => [...prev, contact]);
  };

  useEffect(() => {
    setFiltered(
      contacts.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query)
      )
    );
  }, [query, contacts]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={globalStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color={colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Contacts</Text>
        </View>
        
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchBar,
          searchFocused && styles.searchBarFocused
        ]}>
          <Search size={20} color="#A3AABE" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or phone"
            placeholderTextColor="#A3AABE"
            value={query}
            onChangeText={setQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </View>
      </View>

      {/* Contacts List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        ItemSeparatorComponent={renderSeparator}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#06402B']}
            tintColor="#06402B"
          />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddContact}
        activeOpacity={0.8}
      >
        <PlusCircle size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF0F5',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000d10',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF0F5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 12,
    height: 44,
  },
  searchBarFocused: {
    borderColor: '#06402B',
    borderWidth: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000d10',
  },
  list: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginLeft: 76, // Align with text content
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 14,
    color: '#A3AABE',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#06402B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ContactsScreen;