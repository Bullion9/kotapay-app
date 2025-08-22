import { useNavigation } from '@react-navigation/native';
import { Send } from 'lucide-react-native';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Contact {
  id: string;
  name: string;
  phone: string;
  profileImage?: string;
  isRegistered?: boolean;
}

interface ContactRowProps {
  item: Contact;
}

const ContactRow: React.FC<ContactRowProps> = ({ item }) => {
  const navigation = useNavigation();
  
  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const handleContactTap = () => {
    (navigation as any).navigate('ContactDetail', { contact: item });
  };

  const handleSendMoney = (e: any) => {
    e.stopPropagation(); // Prevent contact tap
    Alert.alert(
      'Contact Actions',
      `Choose an action for ${item.name}:`,
      [
        {
          text: 'Send Money',
          onPress: () => {
            // Navigate to SendMoney screen with contact
            (navigation as any).navigate('SendMoney', { contact: item });
          },
        },
        {
          text: 'Request Money',
          onPress: () => (navigation as any).navigate('RequestMoney', { contact: item }),
        },
        {
          text: 'Scan QR Code',
          onPress: () => (navigation as any).navigate('QRScanner', { contact: item }),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const initials = getInitials(item.name);

  return (
    <TouchableOpacity style={styles.row} onPress={handleContactTap}>
      <View style={styles.avatar}>
        {item.profileImage ? (
          <Image 
            source={{ uri: item.profileImage }}
            style={styles.profileImage}
          />
        ) : (
          <Text style={styles.initials}>{initials}</Text>
        )}
      </View>

      <View style={styles.middle}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>

      <TouchableOpacity onPress={handleSendMoney}>
        <Send size={20} color="#06402B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#A8E4A0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensures image is clipped to circle
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  initials: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  middle: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000d10',
  },
  phone: {
    fontSize: 14,
    color: '#A3AABE',
    marginTop: 2,
  },
});

export default ContactRow;
