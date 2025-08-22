import * as Contacts from 'expo-contacts';
import { ChevronLeft, Phone, PlusCircle, Search, UserPlus, Users } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Linking,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import SwipeableContactRow from '../components/SwipeableContactRow';
import { colors, globalStyles } from '../theme';

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
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Mock data for demo - replace with actual API call
  useEffect(() => {
    fetchContacts();
    checkContactsPermission();
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

  // Check if we already have contacts permission
  const checkContactsPermission = async () => {
    try {
      const { status } = await Contacts.getPermissionsAsync();
      // Permission status is checked but not stored since we don't use it elsewhere
      console.log('Contacts permission status:', status);
    } catch (error) {
      console.error('Error checking contacts permission:', error);
    }
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
      <Text style={styles.emptySubtext}>Import contacts from your phone or add them manually</Text>
      
      <TouchableOpacity
        style={styles.importButton}
        onPress={requestContactsPermission}
        disabled={isLoadingContacts}
      >
        <Phone size={20} color="#FFFFFF" style={styles.buttonIcon} />
        <Text style={styles.importButtonText}>
          {isLoadingContacts ? 'Loading Contacts...' : 'Import from Phone'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.addManuallyButton}
        onPress={() => navigation.navigate('AddContact')}
      >
        <UserPlus size={20} color="#06402B" style={styles.buttonIcon} />
        <Text style={styles.addManuallyText}>Add Contact Manually</Text>
      </TouchableOpacity>
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
      setIsLoadingContacts(true);
      
      // Request permission using expo-contacts
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status === 'granted') {
        await loadPhoneContacts();
      } else {
        Alert.alert(
          'Permission Denied',
          'KotaPay needs access to your contacts to import them. You can grant permission in app settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to request contacts permission');
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const loadPhoneContacts = async () => {
    try {
      setIsLoadingContacts(true);
      
      // Get contacts from phone
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Image],
        sort: Contacts.SortTypes.FirstName,
      });

      if (data.length > 0) {
        const phoneContacts: Contact[] = data
          .filter(contact => 
            contact.name && 
            contact.phoneNumbers && 
            contact.phoneNumbers.length > 0
          )
          .map(contact => ({
            id: `phone_${contact.id}`,
            name: contact.name || 'Unknown Contact',
            phone: contact.phoneNumbers?.[0]?.number || '',
            profileImage: contact.imageAvailable && contact.image ? contact.image.uri : undefined,
            isRegistered: Math.random() > 0.5, // Random for demo - replace with actual registration check
          }))
          .slice(0, 50); // Limit to first 50 contacts for performance

        // Only add contacts that don't already exist
        setContacts(prev => {
          const existingPhones = prev.map(contact => contact.phone.replace(/\D/g, ''));
          const newContacts = phoneContacts.filter(contact => {
            const phoneDigits = contact.phone.replace(/\D/g, '');
            return !existingPhones.includes(phoneDigits);
          });
          
          if (newContacts.length > 0) {
            Alert.alert(
              'Contacts Imported',
              `Successfully imported ${newContacts.length} contacts from your phone.`,
              [{ text: 'OK' }]
            );
            return [...prev, ...newContacts];
          } else {
            Alert.alert(
              'No New Contacts',
              'All your phone contacts are already in your KotaPay contacts.',
              [{ text: 'OK' }]
            );
            return prev;
          }
        });
      } else {
        Alert.alert(
          'No Contacts Found',
          'No contacts were found on your phone.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error loading phone contacts:', error);
      Alert.alert(
        'Error',
        'Failed to load contacts from your phone. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingContacts(false);
    }
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
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={requestContactsPermission}
          disabled={isLoadingContacts}
        >
          <Phone 
            size={20} 
            color={isLoadingContacts ? "#A3AABE" : colors.seaGreen}
            fill={isLoadingContacts ? "#A3AABE" : colors.seaGreen}
          />
        </TouchableOpacity>
      </View>
      
      {/* Header Separator Line */}
      <View style={styles.headerSeparator} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchBar,
          searchFocused && styles.searchBarFocused
        ]}>
          <Search size={20} color="#A3AABE" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={isLoadingContacts ? "Loading contacts..." : "Search by name or phone"}
            placeholderTextColor="#A3AABE"
            value={query}
            onChangeText={setQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            editable={!isLoadingContacts}
          />
        </View>
      </View>

      {/* Search Separator Line */}
      <View style={styles.searchSeparator} />

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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerSeparator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 0,
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
  searchSeparator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginHorizontal: 0,
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
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000d10',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A3AABE',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06402B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addManuallyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#06402B',
    marginTop: 16,
  },
  addManuallyText: {
    color: '#06402B',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
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