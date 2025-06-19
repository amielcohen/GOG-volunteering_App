import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
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
          {/* קונפטי בצבעי זהב, לבן וכחול יהלום */}
          {visible && (
            <ConfettiCannon
              ref={confettiCannonRef}
              count={250} // הגדלה קלה של הכמות
              origin={{ x: width / 2, y: -20 }}
              fadeOut={true}
              autoStart={false}
              fallSpeed={3500} // קצת יותר איטי
              explosionSpeed={900}
              animationDuration={6000} // קצת יותר ארוך
              colors={['#FFD700', '#B8860B', '#FFFFFF', '#A9D6E5', '#4CA1AF']} // זהב טהור, זהב עמוק, לבן, תכלת בהיר, כחול-טורקיז עמוק
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
    backgroundColor: 'rgba(0,0,0,0.8)', // רקע כהה יותר להבלטת הצבעים
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#F8F8F8', // לבן-אוף-וויט רך
    padding: 30,
    borderRadius: 25, // פינות מעוגלות יותר
    alignItems: 'center',
    width: '90%', // קצת יותר רחב
    maxWidth: 420,
    shadowColor: '#B8860B', // צל זהוב עשיר
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 3,
    borderColor: '#FFD700', // מסגרת זהב יוקרתית
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 34, // קצת יותר גדול
    fontWeight: 'bold',
    color: '#333333', // אפור כהה מאוד
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'BodoniSvtyTwoITCTT-Bold' : 'serif', // פונט יותר דרמטי ל-iOS
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subMessage: {
    fontSize: 20, // קצת יותר גדול
    color: '#555555', // אפור בינוני
    marginBottom: 35, // רווח גדול יותר
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Cochin-Italic' : 'serif', // פונט קלאסי ורך
  },
  levelContainer: {
    backgroundColor: '#E0FFFF', // תכלת בהיר מאוד, בסיס "יהלום"
    borderWidth: 4, // גבול עבה יותר
    borderColor: '#4CA1AF', // כחול-טורקיז עמוק כצבע "יהלום" מסגרת
    borderRadius: 130, // עיגול גדול יותר
    width: 230,
    height: 230,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 45, // רווח גדול יותר
    shadowColor: '#A9D6E5', // צל כחול בהיר
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 12,
    position: 'relative',
  },
  levelPrefix: {
    fontSize: 38, // משמעותית יותר גדול
    color: '#B8860B', // זהב עמוק וברור
    fontWeight: 'bold',
    position: 'absolute',
    top: 30, // **הכי חשוב: מיקום גבוה יותר!**
    fontFamily: Platform.OS === 'ios' ? 'Georgia-Bold' : 'serif', // פונט מודגש
    textShadowColor: 'rgba(255, 215, 0, 0.4)', // צל זהוב עדין
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 6,
  },
  levelText: {
    fontSize: 110, // מספר עצום ובולט מאוד
    fontWeight: '900',
    color: '#DAA520', // גוון זהב בהיר יותר למספר
    textShadowColor: 'rgba(0, 0, 0, 0.3)', // צל שחור עדין
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 8,
    marginTop: 40, // מרווח מהטקסט שלפניו
    fontFamily:
      Platform.OS === 'ios' ? 'TimesNewRomanPS-BoldMT' : 'sans-serif-black', // פונט חזק מאוד
  },
  closeButton: {
    backgroundColor: '#4CA1AF', // כחול-טורקיז עמוק לכפתור
    paddingVertical: 20,
    paddingHorizontal: 60,
    borderRadius: 18, // פינות עגולות יותר
    marginTop: 30,
    shadowColor: '#A9D6E5', // צל כחול בהיר לכפתור
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.7,
    shadowRadius: 15,
    elevation: 10,
  },
  closeButtonText: {
    color: '#FFFFFF', // טקסט לבן נקי על כחול
    fontSize: 25, // קצת יותר גדול
    fontWeight: 'bold',
    fontFamily:
      Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'sans-serif-medium',
  },
});

export default LevelUpModal;
