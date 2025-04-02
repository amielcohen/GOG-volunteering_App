import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Button } from 'react-native-paper';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null); // אין תאריך דיפולטי
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [gender, setGender] = useState('זכר'); // ברירת מחדל
  const [errorMessage, setErrorMessage] = useState('');

  const registerHandler = async () => {
    console.log('Registering user:', {
      username,
      password,
      email,
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : '',
      city,
      street,
      houseNumber,
      gender,
    });

    try {
      const response = await fetch('http://10.100.102.16:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          email,
          dateOfBirth: dateOfBirth
            ? dateOfBirth.toISOString().split('T')[0]
            : '',
          city,
          street,
          houseNumber,
          gender,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Registration successful:', data);
        setErrorMessage('');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'הרשמה נכשלה');
        Alert.alert('Registration Error', errorData.message || 'הרשמה נכשלה');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('אירעה שגיאה בהרשמה');
      Alert.alert('Registration Error', 'אירעה שגיאה בהרשמה');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>הרשמה</Text>

        {/* סדר השדות כפי שביקשת: שם משתמש, סיסמה, אימייל, תאריך לידה, עיר, רחוב, מספר בית, מגדר */}
        <TextInput
          style={styles.input}
          placeholder="שם משתמש"
          placeholderTextColor="#000"
          value={username}
          onChangeText={setUsername}
          textAlign="right"
        />

        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          placeholderTextColor="#000"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          textAlign="right"
        />

        <TextInput
          style={styles.input}
          placeholder="אימייל"
          placeholderTextColor="#000"
          value={email}
          onChangeText={setEmail}
          textAlign="right"
        />

        {/* Pressable לבחירת תאריך לידה עם DateTimePicker */}
        <Pressable
          style={[styles.input, styles.dateInput]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateText, { textAlign: 'right' }]}>
            {dateOfBirth
              ? dateOfBirth.toISOString().split('T')[0]
              : 'תאריך לידה'}
          </Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="עיר"
          placeholderTextColor="#000"
          value={city}
          onChangeText={setCity}
          textAlign="right"
        />

        <TextInput
          style={styles.input}
          placeholder="רחוב"
          placeholderTextColor="#000"
          value={street}
          onChangeText={setStreet}
          textAlign="right"
        />

        <TextInput
          style={styles.input}
          placeholder="מספר בית"
          placeholderTextColor="#000"
          value={houseNumber}
          onChangeText={setHouseNumber}
          textAlign="right"
        />

        {/* חלון גלילה לבחירת מגדר */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>מגדר:</Text>
          <Picker
            selectedValue={gender}
            style={styles.picker}
            itemStyle={{ textAlign: 'right' }}
            onValueChange={(itemValue) => setGender(itemValue)}
          >
            <Picker.Item label="זכר" value="זכר" />
            <Picker.Item label="נקבה" value="נקבה" />
          </Picker>
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <Button mode="contained" onPress={registerHandler}>
          הרשמה
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    color: '#000',
    textAlign: 'right', // מיישר את הטקסט וה-placeholder לימין
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    color: '#000',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
    width: '100%',
  },
  pickerLabel: {
    fontSize: 14,
    textAlign: 'right',
    paddingHorizontal: 10,
    color: '#555',
  },
  picker: {
    height: 55,
    width: '100%',
    textAlign: 'right',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});
