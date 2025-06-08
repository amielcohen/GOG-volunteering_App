// components/LevelUpModal.js
import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

const LevelUpModal = ({ visible, level, username, onClose }) => {
  const confettiCannonRef = useRef(null);

  useEffect(() => {
    if (visible && confettiCannonRef.current) {
      confettiCannonRef.current.start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* קונפטי מרכזי, עם אנימציה ארוכה במיוחד */}
          {visible && (
            <ConfettiCannon
              ref={confettiCannonRef}
              count={500} // כמות חלקיקים גבוהה מאוד
              origin={{ x: width / 2, y: -20 }} // מוצא ממרכז החלק העליון
              fadeOut={true}
              autoStart={false}
              fallSpeed={5000} // נפילה איטית מאוד
              explosionSpeed={1200} // פיצוץ ראשוני חזק
              animationDuration={60000} // **60 שניות! (דקה שלמה של קונפטי!)**
              colors={['#FFD700', '#00FFFF', '#FF00FF', '#00FF00', '#FFFF00']} // זהב, טורקיז, מג'נטה, ירוק ניאון, צהוב בוהק - זוהרים!
            />
          )}

          <Text style={styles.modalTitle}>ברכות, {username}!</Text>

          <Text style={styles.subMessage}>הגעת לגובה חדש!</Text>

          <View style={styles.levelContainer}>
            <Text style={styles.levelPrefix}>רמה</Text>
            <Text style={styles.levelText}>{level}</Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>המשך</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)', // רקע שחור עמוק מאוד, למקסם את זוהר הצבעים
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1A1A2E', // כחול כהה מאוד / סגול כהה (כמו חלל)
    padding: 30,
    borderRadius: 25,
    alignItems: 'center',
    width: '88%',
    maxWidth: 400,
    shadowColor: '#4CAF50', // צל ירוק זוהר
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1, // צל מלא ליצירת אפקט זוהר חזק
    shadowRadius: 30,
    elevation: 25,
    borderWidth: 3,
    borderColor: '#00FFFF', // מסגרת טורקיז זוהרת
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFD700', // זהב בוהק
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: '#FF4500', // צל אדום-כתום זוהר לטקסט
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    paddingHorizontal: 10,
  },
  subMessage: {
    fontSize: 20,
    color: '#9AFF9A', // ירוק בהיר זוהר
    marginBottom: 35, // הגדלת רווח
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 10,
    textShadowColor: 'rgba(0, 255, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  levelContainer: {
    backgroundColor: 'transparent', // הרקע הכהה של המודל ישמש כרקע
    borderWidth: 5, // גבול עבה וזוהר
    borderColor: '#FF00FF', // מג'נטה זוהרת לגבול
    borderRadius: 130, // עיגול גדול
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 45, // הגדלת רווח
    shadowColor: '#FFFF00', // צל צהוב זוהר
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  levelPrefix: {
    fontSize: 35, // גודל פונט גדול יותר ל"רמה"
    color: '#00FFFF', // טורקיז זוהר
    fontWeight: 'bold',
    position: 'absolute',
    top: 30, // **התיקון כאן: הזזה למעלה ליצירת מרווח גדול יותר**
    textShadowColor: 'rgba(0, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 8,
  },
  levelText: {
    fontSize: 105, // מספר עצום ובולט יותר
    fontWeight: '900',
    color: '#FFD700', // זהב בוהק למספר
    textShadowColor: '#FF0000', // צל אדום עז
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 15,
    marginTop: 40, // **התיקון כאן: הגדלת המרווח מהטקסט שלפניו**
  },
  closeButton: {
    backgroundColor: '#00FFFF', // טורקיז זוהר לכפתור
    paddingVertical: 20,
    paddingHorizontal: 55,
    borderRadius: 15,
    marginTop: 25,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  closeButtonText: {
    color: '#1A1A2E', // צבע טקסט כהה לניגודיות על כפתור בהיר
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default LevelUpModal;
