import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Phone, Mail, Send, QrCode, Trash2 } from 'lucide-react-native';

interface Contact {
  id: string;
  name: string;
  phone: string;
  profileImage?: string;
  isRegistered?: boolean;
}

interface ContactDetailScreenProps {
  route: {
    params: {
      contact: Contact;
    };
  };
}

const ContactDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute() as ContactDetailScreenProps['route'];
  const { contact } = route.params;

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const handleSendMoney = () => {
    // TODO: Update to use SendScreen modal
    // (navigation as any).navigate('SendMoney', { contact });
    Alert.alert('Send Money', 'Send money feature will be available soon');
  };

  const handleRequestMoney = () => {
    (navigation as any).navigate('RequestMoney', { contact });
  };

  const handleQRScanner = () => {
    (navigation as any).navigate('QRScanner', { contact });
  };

  const handleCall = () => {
    const makeCall = async () => {
      try {
        // Remove any non-numeric characters except + for international format
        const cleanedPhone = contact.phone.replace(/[^\d+]/g, '');
        const phoneUrl = `tel:${cleanedPhone}`;
        
        // Check if the device can handle phone calls
        const canCall = await Linking.canOpenURL(phoneUrl);
        
        if (canCall) {
          await Linking.openURL(phoneUrl);
        } else {
          Alert.alert(
            'Cannot Make Call',
            'Your device does not support phone calls or the phone number is invalid.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error making call:', error);
        Alert.alert(
          'Call Failed',
          'There was an error trying to make the call. Please try again.',
          [{ text: 'OK' }]
        );
      }
    };

    Alert.alert(
      'Call Contact',
      `Call ${contact.name} at ${contact.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: makeCall },
      ]
    );
  };

  const handleDeleteContact = () => {
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name} from your contacts? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            // Here you would typically call an API to delete the contact
            // For now, we'll just navigate back and show a success message
            navigation.goBack();
            setTimeout(() => {
              Alert.alert('Contact Deleted', `${contact.name} has been removed from your contacts.`);
            }, 500);
          }
        },
      ]
    );
  };

  const initials = getInitials(contact.name);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#000d10" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Contact Details</Text>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteContact}
        >
          <Trash2 size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>

      {/* Contact Avatar and Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          {contact.profileImage ? (
            <Image 
              source={{ uri: contact.profileImage }}
              style={styles.profileImage}
              defaultSource={require('../../assets/images/partial-react-logo.png')} // Fallback image
            />
          ) : (
            <Text style={styles.initials}>{initials}</Text>
          )}
        </View>
        
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.phone}>{contact.phone}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
          <View style={styles.actionIcon}>
            <Phone size={24} color="#06402B" />
          </View>
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSendMoney}>
          <View style={styles.actionIcon}>
            <Send size={24} color="#06402B" />
          </View>
          <Text style={styles.actionText}>Send Money</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleRequestMoney}>
          <View style={styles.actionIcon}>
            <Send size={24} color="#06402B" />
          </View>
          <Text style={styles.actionText}>Request Money</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleQRScanner}>
          <View style={styles.actionIcon}>
            <QrCode size={24} color="#06402B" />
          </View>
          <Text style={styles.actionText}>QR Code</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Information */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        
        <View style={styles.infoRow}>
          <Phone size={20} color="#A3AABE" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{contact.phone}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Mail size={20} color="#A3AABE" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>Not available</Text>
          </View>
        </View>

        {/* Delete Contact Option */}
        <TouchableOpacity style={styles.deleteRow} onPress={handleDeleteContact}>
          <Trash2 size={20} color="#FF4444" />
          <View style={styles.infoContent}>
            <Text style={styles.deleteLabel}>Delete Contact</Text>
            <Text style={styles.deleteSubLabel}>Remove from your contacts</Text>
          </View>
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A8E4A0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden', // Ensures image is clipped to circle
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  initials: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000d10',
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: '#A3AABE',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#000d10',
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000d10',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#A3AABE',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#000d10',
    fontWeight: '500',
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  deleteLabel: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: '500',
    marginBottom: 2,
  },
  deleteSubLabel: {
    fontSize: 14,
    color: '#A3AABE',
  },
});

export default ContactDetailScreen;
