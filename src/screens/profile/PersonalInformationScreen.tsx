import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  UserCheck,
  Edit3,
} from 'lucide-react-native';
// @ts-ignore
import * as Haptics from 'expo-haptics';

interface EditableRow {
  icon: React.ReactNode;
  label: string;
  value: string;
  type: 'text' | 'email' | 'phone' | 'date';
  verified?: boolean;
}

const PersonalInformationScreen: React.FC = () => {
  const [userData] = useState({
    displayName: 'Sarah Johnson',
    phone: '+234 801 234 5678',
    email: 'sarah@example.com',
    dateOfBirth: '1995-06-15',
  });

  const personalInfo: EditableRow[] = [
    {
      icon: <User size={20} color="#06402B" />,
      label: 'Full Name',
      value: userData.displayName,
      type: 'text',
    },
    {
      icon: <Mail size={20} color="#06402B" />,
      label: 'Email',
      value: userData.email,
      type: 'email',
      verified: true,
    },
    {
      icon: <Phone size={20} color="#06402B" />,
      label: 'Phone',
      value: userData.phone,
      type: 'phone',
      verified: true,
    },
    {
      icon: <Calendar size={20} color="#06402B" />,
      label: 'Date of Birth',
      value: userData.dateOfBirth,
      type: 'date',
    },
  ];

  const handleEdit = async (item: EditableRow) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      `Edit ${item.label}`,
      `Update your ${item.label.toLowerCase()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Edit', onPress: () => console.log(`Editing ${item.label}`) },
      ]
    );
  };

  const goBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigation back logic here
    console.log('Going back to profile');
  };

  const renderEditableRow = (item: EditableRow) => (
    <TouchableOpacity
      key={item.label}
      style={styles.editableRow}
      onPress={() => handleEdit(item)}
    >
      <View style={styles.rowLeft}>
        {item.icon}
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{item.label}</Text>
          <Text style={styles.rowValue}>{item.value}</Text>
        </View>
      </View>
      <View style={styles.rowRight}>
        {item.verified && <UserCheck size={16} color="#06402B" />}
        <Edit3 size={16} color="#A3AABE" style={styles.editIcon} />
        <ChevronRight size={20} color="#A3AABE" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF0F5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ArrowLeft size={24} color="#06402B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.description}>
            Manage your personal information and contact details. Verified information helps secure your account.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Basic Information</Text>
            {personalInfo.map((item) => renderEditableRow(item))}
          </View>

          <View style={styles.verificationNote}>
            <UserCheck size={16} color="#06402B" />
            <Text style={styles.verificationText}>
              Verified information helps protect your account and enables full access to KotaPay features.
            </Text>
          </View>
        </View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF0F5',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#06402B',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#A3AABE',
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#06402B',
    marginBottom: 16,
  },
  editableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    minHeight: 48,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    marginLeft: 12,
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    color: '#06402B',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    color: '#A3AABE',
    marginTop: 2,
  },
  editIcon: {
    marginRight: 8,
  },
  verificationNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F8F0',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  verificationText: {
    fontSize: 12,
    color: '#06402B',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

export default PersonalInformationScreen;
