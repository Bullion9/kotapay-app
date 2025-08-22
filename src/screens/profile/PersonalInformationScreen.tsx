import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import {
    Calendar,
    ChevronLeft,
    Edit3,
    Mail,
    Phone,
    User,
    UserCheck,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EditableRow {
  icon: React.ReactNode;
  label: string;
  value: string;
  type: 'text' | 'email' | 'phone' | 'date';
  verified?: boolean;
  key: string;
}

const PersonalInformationScreen: React.FC = () => {
  console.log('🚀 PersonalInformationScreen mounted with inline editing');
  
  const navigation = useNavigation();
  
  const [userData, setUserData] = useState({
    displayName: 'Sarah Johnson',
    phone: '+234 801 234 5678',
    email: 'sarah@example.com',
    dateOfBirth: '1995-06-15',
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{ [key: string]: string }>({});

  const personalInfo: EditableRow[] = [
    {
      icon: <User size={20} color="#06402B" />,
      label: 'Full Name',
      value: userData.displayName,
      type: 'text',
      key: 'displayName',
    },
    {
      icon: <Mail size={20} color="#06402B" />,
      label: 'Email',
      value: userData.email,
      type: 'email',
      verified: true,
      key: 'email',
    },
    {
      icon: <Phone size={20} color="#06402B" />,
      label: 'Phone',
      value: userData.phone,
      type: 'phone',
      verified: true,
      key: 'phone',
    },
    {
      icon: <Calendar size={20} color="#06402B" />,
      label: 'Date of Birth',
      value: userData.dateOfBirth,
      type: 'date',
      key: 'dateOfBirth',
    },
  ];

  const handleEdit = async (item: EditableRow) => {
    console.log('🎯 Editing field:', item.key);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingField(item.key);
    setTempValues({ ...tempValues, [item.key]: item.value });
  };

  const handleSave = async (key: string) => {
    console.log('💾 Saving field:', key, 'with value:', tempValues[key]);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = tempValues[key] || '';
    setUserData(prev => ({
      ...prev,
      [key]: newValue,
    }));
    setEditingField(null);
    setTempValues({});
  };

  const handleCancel = async () => {
    console.log('❌ Cancelling edit');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingField(null);
    setTempValues({});
  };

  const getKeyboardType = (type: string) => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      default:
        return 'default';
    }
  };

  const goBack = async () => {
    console.log('⬅️ Going back to profile');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const renderEditableRow = (item: EditableRow) => {
    const isEditing = editingField === item.key;
    const currentValue = isEditing ? (tempValues[item.key] || item.value) : item.value;

    return (
      <View key={item.label} style={styles.editableRow}>
        <View style={styles.rowLeft}>
          {item.icon}
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            {isEditing ? (
              <View style={styles.editingContainer}>
                <TextInput
                  style={styles.textInput}
                  value={currentValue}
                  onChangeText={(text) => setTempValues({ ...tempValues, [item.key]: text })}
                  keyboardType={getKeyboardType(item.type)}
                  autoFocus={true}
                  placeholder={`Enter ${item.label.toLowerCase()}`}
                  placeholderTextColor="#999"
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={() => handleSave(item.key)}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.rowValue}>{currentValue}</Text>
            )}
          </View>
        </View>
        <View style={styles.rowRight}>
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <UserCheck size={14} color="#06402B" />
            </View>
          )}
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(item)}
            >
              <Edit3 size={16} color="#06402B" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF0F5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ChevronLeft size={24} color="#06402B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
      </View>

            <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
        enabled={true}
      >
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
      </KeyboardAvoidingView>
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
    color: '#06402B',
    fontFamily: 'System',
  },
  keyboardAvoidingView: {
    flex: 1,
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
    fontFamily: 'System',
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
    color: '#06402B',
    marginBottom: 16,
    fontFamily: 'System',
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
    fontFamily: 'System',
  },
  rowValue: {
    fontSize: 14,
    color: '#A3AABE',
    marginTop: 2,
    fontFamily: 'System',
  },
  editingContainer: {
    marginTop: 8,
    width: '100%',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#06402B',
    backgroundColor: '#FFFFFF',
    fontFamily: 'System',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#06402B',
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'System',
  },
  saveButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'System',
  },
  editButton: {
    padding: 4,
  },
  verifiedBadge: {
    marginRight: 8,
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
    fontFamily: 'System',
  },
});

export default PersonalInformationScreen;
