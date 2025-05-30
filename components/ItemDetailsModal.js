import React from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  I18nManager, // ליישום RTL
} from 'react-native';

// תמונה חלופית למקרה שאין imageUrl
const fallbackImage = require('../images/noImageFound.webp');

// הגדרת כיוון הטקסט וה-layout עבור RTL
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
  I18nManager.allowRTL(true);
}

const ItemDetailsModal = ({ selectedItem, onClose, actionButtons }) => {
  if (!selectedItem) {
    return null;
  }

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* כפתור סגירה מהיר למעלה משמאל (ב-RTL) */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>X</Text>
          </Pressable>

          {/* כותרת הפריט */}
          <Text style={styles.modalTitle}>{selectedItem.name}</Text>

          {/* תמונת הפריט */}
          <Image
            source={
              selectedItem.imageUrl
                ? { uri: selectedItem.imageUrl }
                : fallbackImage
            }
            style={styles.modalImage}
          />

          {/* פרטי הפריט */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>מחיר:</Text> {selectedItem.price}{' '}
              גוגואים
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>רמה נדרשת:</Text>{' '}
              {selectedItem.level}
            </Text>
            {selectedItem.quantity !== undefined && (
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>כמות במלאי:</Text>{' '}
                {selectedItem.quantity}
              </Text>
            )}
            {selectedItem.categories && selectedItem.categories.length > 0 && (
              <Text style={styles.detailText}>
                <Text style={styles.detailLabel}>קטגוריות:</Text>{' '}
                {selectedItem.categories.join(', ')}
              </Text>
            )}
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>תיאור:</Text>{' '}
              {selectedItem.description || 'אין תיאור זמין.'}
            </Text>
          </View>

          {/* כפתורי פעולה גמישים */}
          <View style={styles.buttonContainer}>
            {actionButtons &&
              actionButtons.map((button, index) => (
                <Pressable
                  key={index}
                  style={[styles.actionButton, button.style]}
                  onPress={() => {
                    button.onPress();
                    onClose();
                  }}
                >
                  <Text style={styles.actionButtonText}>{button.text}</Text>
                </Pressable>
              ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#F0F4F8', // צבע רקע חדש ועדין
    borderRadius: 20,
    padding: 25,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#333', // צל כהה יותר
    shadowOffset: {
      width: 0,
      height: 8, // צל עמוק יותר
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    left: 15, // ממוקם משמאל ב-RTL
    padding: 5,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666', // צבע כהה יותר לכפתור סגירה
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50', // צבע כהה יותר לכותרת
    marginBottom: 15,
    textAlign: 'center',
  },
  modalImage: {
    width: 160, // הגדלתי מעט את התמונה
    height: 160,
    borderRadius: 18, // פינות מעוגלות יותר
    marginBottom: 25, // רווח גדול יותר
    resizeMode: 'contain',
    borderColor: '#D0D6DC', // מסגרת עדינה בצבע תואם
    borderWidth: 2,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'flex-end', // יישור לימין עבור RTL
  },
  detailText: {
    fontSize: 16,
    color: '#4A4A4A', // צבע טקסט כהה יותר
    marginBottom: 8,
    lineHeight: 22,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#2C3E50', // צבע כהה לתוויות
    marginLeft: 5, // רווח בין התווית לערך ב-RTL
  },
  buttonContainer: {
    flexDirection: 'row-reverse', // כפתורים מימין לשמאל ב-RTL
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 25,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    backgroundColor: '#3498DB', // כחול בהיר יותר כברירת מחדל
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default ItemDetailsModal;
