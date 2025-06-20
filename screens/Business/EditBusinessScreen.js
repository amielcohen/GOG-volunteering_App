import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Modal, // ייבוא Modal
} from 'react-native';
import axios from 'axios';
import config from '../../config';
import ErrorModal from '../../components/ErrorModal';
import CustomToast from '../../components/CustomToast';

export default function EditBusinessScreen({ route, navigation }) {
  const { user } = route.params; // אובייקט המשתמש המקורי
  const [username, setUsername] = useState(user.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false); // סטייט למודל אישור

  // פונקציה לבדיקת תקינות הקלט לפני הצגת מודל האישור
  const handlePreSave = () => {
    if (password !== '' && password !== confirmPassword) {
      setErrorMessage('הסיסמאות אינן תואמות.');
      setErrorVisible(true);
      return;
    }

    if (username.trim() === '') {
      setErrorMessage('שם המשתמש אינו יכול להיות ריק.');
      setErrorVisible(true);
      return;
    }

    // אם הכל תקין, הצג את מודל האישור
    setConfirmationModalVisible(true);
  };

  const handleSave = async () => {
    setConfirmationModalVisible(false); // סגור את מודל האישור

    try {
      setLoading(true);

      const updatePayload = {
        _id: user._id,
        username: username.trim(), // שמור שם משתמש ללא רווחים מיותרים
      };

      if (password !== '') {
        // רק אם הוזנה סיסמה חדשה
        updatePayload.password = password;
      }

      const response = await axios.put(
        `${config.SERVER_URL}/auth/updateProfile`,
        updatePayload
      );

      if (response.status === 200) {
        setToastMessage('🎉 הפרטים עודכנו בהצלחה!');
        setToastVisible(true);

        // יצירת אובייקט משתמש מעודכן (רק שם המשתמש השתנה במסך זה)
        const updatedUser = { ...user, username: username.trim() };

        setTimeout(() => {
          // מעבירים את הנתונים המעודכנים בחזרה למסך הקודם
          navigation.navigate('BusinessPartnerHomeScreen', {
            user: updatedUser,
            refresh: true,
          });
        }, 1500); // נותן לטוסט זמן להופיע
      } else {
        setErrorMessage(response.data?.message || 'אירעה שגיאה בעדכון.');
        setErrorVisible(true);
      }
    } catch (err) {
      console.error('שגיאה בעדכון:', err);
      const msg = err.response?.data?.message || 'אירעה שגיאה בעדכון, נסה שוב.';
      setErrorMessage(msg);
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1A2B42" />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>עריכת משתמש עסקי</Text>
        </View>

        <View style={styles.card}>
          {/* שדות הניתנים לעריכה */}
          <Text style={styles.label}>שם משתמש:</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="שם משתמש"
            placeholderTextColor="#6A7B9B"
            autoCapitalize="none"
            selectionColor="#00E0FF"
          />

          <Text style={styles.label}>
            סיסמה חדשה (השאר ריק אם לא רוצה לשנות):
          </Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="הזן סיסמה חדשה"
            placeholderTextColor="#6A7B9B"
            autoCapitalize="none"
            selectionColor="#00E0FF"
          />

          <Text style={styles.label}>אימות סיסמה:</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="הזן שוב את הסיסמה"
            placeholderTextColor="#6A7B9B"
            autoCapitalize="none"
            selectionColor="#00E0FF"
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handlePreSave} // קורא לפונקציה החדשה
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#1A2B42" />
            ) : (
              <Text style={styles.buttonText}>שמור שינויים</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>בטל</Text>
          </TouchableOpacity>
        </View>

        {/* --- מודל אישור --- */}
        <Modal
          visible={confirmationModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmationModalVisible(false)} // מאפשר סגירה בלחיצת כפתור חזרה באנדרואיד
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>אישור פרטי עדכון</Text>
              <Text style={styles.modalMessage}>
                האם ברצונך לשמור את השינויים הבאים?
              </Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>שם משתמש חדש:</Text>
                <Text style={styles.detailValue}>{username}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>סיסמה:</Text>
                <Text style={styles.detailValue}>
                  {password !== '' ? '*** (שוּנתה)' : 'ללא שינוי'}
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setConfirmationModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>ביטול</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  onPress={handleSave}
                >
                  <Text style={styles.modalButtonText}>אשר ושמור</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* --- סוף מודל אישור --- */}

        <ErrorModal
          visible={errorVisible}
          title="שגיאה"
          message={errorMessage}
          onClose={() => setErrorVisible(false)}
        />
        {toastVisible && (
          <CustomToast
            message={toastMessage}
            onHide={() => setToastVisible(false)}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1E3A52',
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    backgroundColor: '#1A2B42',
    paddingVertical: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 15,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00E0FF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 224, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  card: {
    backgroundColor: '#2A445C',
    borderRadius: 25,
    padding: 35,
    width: '90%',
    alignItems: 'flex-end',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 224, 255, 0.2)',
  },
  label: {
    color: '#E0F2F7',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'right',
    width: '100%',
  },
  input: {
    backgroundColor: '#1A2B42',
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 25,
    width: '100%',
    fontSize: 18,
    color: '#00E0FF',
    textAlign: 'right',
    marginBottom: 15,
    borderColor: '#00E0FF',
    borderWidth: 2,
    elevation: 5,
    shadowColor: 'rgba(0, 224, 255, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
  },
  saveButton: {
    backgroundColor: '#00E0FF',
    paddingVertical: 16,
    paddingHorizontal: 45,
    borderRadius: 30,
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: 'rgba(0, 224, 255, 0.5)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  cancelButton: {
    backgroundColor: '#4A627A',
    paddingVertical: 16,
    paddingHorizontal: 45,
    borderRadius: 30,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonText: {
    color: '#1A2B42',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cancelButtonText: {
    color: '#E0F2F7',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // --- סגנונות למודל אישור ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,15,25,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#2A445C',
    borderRadius: 25,
    padding: 30,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 224, 255, 0.3)',
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00E0FF',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 224, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  modalMessage: {
    fontSize: 18,
    color: '#E0F2F7',
    marginBottom: 25,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row-reverse', // כדי שהתווית תהיה מימין
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A0D8F0',
    textAlign: 'right',
  },
  detailValue: {
    fontSize: 16,
    color: '#00E0FF',
    textAlign: 'left',
    flexShrink: 1, // כדי למנוע גלישה
  },
  modalButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 30,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  modalCancelButton: {
    backgroundColor: '#4A627A',
  },
  modalConfirmButton: {
    backgroundColor: '#00E0FF',
  },
  modalButtonText: {
    color: '#1A2B42',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 17,
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
