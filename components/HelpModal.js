import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';

export default function HelpModal({ visible, onClose, title, message }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: false,
      }).start();

      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [visible]);

  const widthInterpolation = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {/* פס התקדמות למעלה */}
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[styles.progressBarFill, { width: widthInterpolation }]}
              />
            </View>

            {/* כותרת */}
            {title && <Text style={styles.title}>{title}</Text>}

            {/* טקסט */}
            {message && <Text style={styles.message}>{message}</Text>}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    minHeight: 150,
    backgroundColor: '#e0f7e9', // ירוק בהיר
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 6,
    width: '100%',
    backgroundColor: '#c8e6c9',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2e7d32', // ירוק כהה
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32', // טקסט ירוק כהה
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 10,
  },
  message: {
    fontSize: 16,
    color: '#2e7d32',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
});
