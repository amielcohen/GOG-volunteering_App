// components/MessageDetailsModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function MessageDetailsModal({ visible, message, onClose }) {
  if (!message) {
    return null; // Don't render if no message is provided
  }

  // Helper to get icon and color based on message type (consistent with message screen)
  const getMessageTypeStyles = (type) => {
    switch (type) {
      case 'info':
        return { icon: 'info', color: '#00E0FF' }; // Light blue/cyan
      case 'warning':
        return { icon: 'error', color: '#FF4500' }; // Orange-red for Warning (as per your request for red with exclamation)
      case 'success':
        return { icon: 'check-circle', color: '#00FF7F' }; // Spring green
      case 'alert':
        // For Alert, based on context like 'level up', I suggest 'star' or 'whatshot'
        // If it's a general 'alert', 'warning' is fine.
        const alertIcon = message.source === 'level_up' ? 'star' : 'warning'; // Example: conditional icon
        return { icon: alertIcon, color: '#FFD700' }; // Gold/Yellow for Alert (as per your request)
      default:
        return { icon: 'message', color: '#B0C4DE' }; // Default light blue-gray
    }
  };

  const { icon, color } = getMessageTypeStyles(message.type);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, { borderBottomColor: color }]}>
            <Icon
              name={icon}
              size={30}
              color={color}
              style={styles.modalIcon}
            />
            <Text style={[styles.modalTitle, { color: color }]}>
              {message.title}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalMessage}>{message.message}</Text>
            <View style={styles.modalMetaContainer}>
              <Text style={styles.modalMetaText}>
                <Text style={{ fontWeight: 'bold' }}>מקור:</Text>{' '}
                {message.source || <Text>לא ידוע</Text>}
              </Text>
              <Text style={styles.modalMetaText}>
                <Text style={{ fontWeight: 'bold' }}>תאריך:</Text>{' '}
                {new Date(message.createdAt).toLocaleDateString('he-IL')}
              </Text>
              {message.expiresAt && (
                <Text style={styles.modalMetaText}>
                  <Text style={{ fontWeight: 'bold' }}>תוקף עד:</Text>{' '}
                  {new Date(message.expiresAt).toLocaleDateString('he-IL')}
                </Text>
              )}
            </View>
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>סגור</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1A2B42', // Darker blue background for modal
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%', // Limit modal height
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 2,
    borderColor: 'rgba(0,224,255,0.3)', // Subtle light blue border
  },
  modalHeader: {
    flexDirection: 'row-reverse', // RTL layout for header
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1, // Dynamic border color from message type
    marginBottom: 10,
  },
  modalIcon: {
    marginLeft: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    flexShrink: 1,
    textShadowColor: 'rgba(0, 224, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    color: '#E0F2F7', // Light text
    textAlign: 'right',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalMetaContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 15,
  },
  modalMetaText: {
    fontSize: 14,
    color: '#B0C4DE', // Muted text
    textAlign: 'right',
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#00E0FF', // Bright button color
    paddingVertical: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#00E0FF',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 15,
  },
  closeButtonText: {
    color: '#1A2B42', // Dark text on bright button
    fontSize: 18,
    fontWeight: 'bold',
  },
});
