import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SelectionOption {
  label: string;
  value: string;
}

interface SelectionModalProps {
  visible: boolean;
  title: string;
  options: SelectionOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => {
  const { colors } = useTheme();

  const dynamicStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      maxHeight: '70%',
      backgroundColor: 'transparent',
    },
    modalContent: {
      backgroundColor: colors.white,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.white,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      padding: 8,
    },
    closeText: {
      fontSize: 20,
      color: colors.secondaryText,
      fontWeight: '400',
    },
    optionsList: {
      maxHeight: 400,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    firstOption: {
      borderTopWidth: 0,
    },
    lastOption: {
      borderBottomWidth: 0,
    },
    optionText: {
      fontSize: 16,
      fontWeight: '400',
      color: colors.text,
    },
    selectedOptionText: {
      color: colors.primary,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={dynamicStyles.overlay} onPress={onClose}>
        <View style={dynamicStyles.modalContainer}>
          <Pressable style={dynamicStyles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={dynamicStyles.header}>
              <Text style={dynamicStyles.title}>{title}</Text>
              <TouchableOpacity style={dynamicStyles.closeButton} onPress={onClose}>
                <Text style={dynamicStyles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={dynamicStyles.optionsList}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    dynamicStyles.optionItem,
                    index === 0 && dynamicStyles.firstOption,
                    index === options.length - 1 && dynamicStyles.lastOption,
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                >
                  <Text style={[
                    dynamicStyles.optionText,
                    selectedValue === option.value && dynamicStyles.selectedOptionText,
                  ]}>
                    {option.label}
                  </Text>
                  {selectedValue === option.value && (
                    <Check size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default SelectionModal;
