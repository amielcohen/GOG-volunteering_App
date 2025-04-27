import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // בשביל ה-X וגם הסימן שאלה

export default function OptionsModal({
  visible,
  onClose,
  title,
  subtitle,
  buttons = [],
  onHelpPress, // פונקציה ללחיצה על סימן שאלה
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* כפתור X לסגירה */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          {/* כותרת עם סימן שאלה */}
          <View style={styles.titleRow}>
            {title && <Text style={styles.title}>{title}</Text>}
            {onHelpPress && (
              <TouchableOpacity onPress={onHelpPress}>
                <Ionicons
                  name="help-circle-outline"
                  size={22}
                  color="#555"
                  style={{ marginStart: 6 }}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* תיאור */}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          {/* כפתורים */}
          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  { backgroundColor: button.color || '#2196F3' },
                  index !== buttons.length - 1 && { marginEnd: 8 },
                ]}
                onPress={button.onPress}
              >
                <Text style={styles.buttonText}>{button.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#f0f4f8',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
