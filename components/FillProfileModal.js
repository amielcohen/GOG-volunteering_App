import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import config from '../config';

export default function FillProfileModal({ userId, onClose }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSave = async () => {
    if (!firstName || !lastName || !username || !password) {
      Alert.alert('שגיאה', 'נא למלא את כל השדות');
      return;
    }

    try {
      await axios.put(`${config.SERVER_URL}/auth/updateProfile`, {
        _id: userId,
        firstName,
        lastName,
        username,
        password,
      });

      Alert.alert('הצלחה', 'הפרטים נשמרו בהצלחה');
      onClose(); // סגירת המודל
    } catch (err) {
      console.error('שגיאה בעדכון פרופיל:', err);
      Alert.alert('שגיאה', 'אירעה שגיאה בשמירת הפרטים');
    }
  };

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>נא להשלים פרטי פרופיל</Text>

          <TextInput
            placeholder="שם פרטי"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
          />
          <TextInput
            placeholder="שם משפחה"
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
          />
          <TextInput
            placeholder="שם משתמש"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            placeholder="סיסמה"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            style={styles.input}
          />

          <Pressable style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>שמור והמשך</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
