import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import config from '../config';
import ErrorModal from '../components/ErrorModal';
import theColor from '../constants/theColor';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [citiesList, setCitiesList] = useState([]);
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [gender, setGender] = useState('זכר');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState({ title: '', message: '' });
  const [btnColor, setBtnColor] = useState(theColor.CancelRed);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(`${config.SERVER_URL}/cities?showAll=true`);
        const data = await res.json();
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        setCitiesList(sorted);
        if (sorted.length > 0) {
          setCity(sorted[0]._id);
        }
      } catch (err) {
        console.error('שגיאה בטעינת ערים:', err);
        setErrorText({
          title: 'שגיאה',
          message: 'לא ניתן לטעון את רשימת הערים',
        });
        setErrorVisible(true);
      }
    };
    fetchCities();
  }, []);

  const registerHandler = async () => {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();
    const cleanEmail = email.trim();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanStreet = street.trim();
    const cleanHouseNumber = houseNumber.trim();

    if (
      !cleanUsername ||
      !cleanPassword ||
      !cleanConfirmPassword ||
      !cleanEmail ||
      !cleanFirstName ||
      !cleanLastName ||
      !city
    ) {
      setErrorText({ title: 'שגיאה', message: 'אנא מלא את כל השדות החובה' });
      setErrorVisible(true);
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      setErrorText({ title: 'שגיאה', message: 'הסיסמאות לא תואמות' });
      setErrorVisible(true);
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorText({
        title: 'שגיאה',
        message: 'הסיסמה חייבת להכיל לפחות 6 תווים',
      });
      setErrorVisible(true);
      return;
    }

    setIsRegistering(true);
    try {
      const response = await fetch(`${config.SERVER_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
          email: cleanEmail,
          dateOfBirth: dateOfBirth
            ? dateOfBirth.toISOString().split('T')[0]
            : '',
          city,
          street: cleanStreet,
          houseNumber: cleanHouseNumber,
          gender,
          firstName: cleanFirstName,
          lastName: cleanLastName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setErrorText({ title: 'הרשמה הצליחה', message: 'המשתמש נרשם בהצלחה!' });
        setBtnColor(theColor.Green);
        setErrorVisible(true);
        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrorText({
          title: 'שגיאה',
          message: errorData.message || 'הרשמה נכשלה',
        });
        setErrorVisible(true);
      }
    } catch (error) {
      console.error('אירעה שגיאה בהרשמה:', error);
      setErrorText({ title: 'שגיאה', message: 'אירעה שגיאה בהרשמה' });
      setErrorVisible(true);
    } finally {
      setIsRegistering(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDateOfBirth(selectedDate);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>הרשמה</Text>

        <TextInput
          style={styles.input}
          placeholder="שם משתמש"
          placeholderTextColor="#A0A0A0"
          value={username}
          onChangeText={setUsername}
          textAlign="right"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="אימות סיסמה"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="שם פרטי"
          placeholderTextColor="#A0A0A0"
          value={firstName}
          onChangeText={setFirstName}
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="שם משפחה"
          placeholderTextColor="#A0A0A0"
          value={lastName}
          onChangeText={setLastName}
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="אימייל"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={setEmail}
          textAlign="right"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Pressable
          style={[styles.input, styles.dateInput]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text
            style={[
              styles.dateText,
              dateOfBirth ? styles.dateSelected : styles.datePlaceholder,
              { textAlign: 'right' },
            ]}
          >
            {dateOfBirth
              ? dateOfBirth.toLocaleDateString('he-IL')
              : 'תאריך לידה'}
          </Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth || new Date()}
            mode="date"
            display="spinner"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>בחר עיר:</Text>
          <Picker
            selectedValue={city}
            onValueChange={(itemValue) => setCity(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="בחר עיר" value="" color="#A0A0A0" />
            {citiesList.map((c) => (
              <Picker.Item key={c._id} label={c.name} value={c._id} />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="רחוב"
          placeholderTextColor="#A0A0A0"
          value={street}
          onChangeText={setStreet}
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="מספר בית"
          placeholderTextColor="#A0A0A0"
          value={houseNumber}
          onChangeText={setHouseNumber}
          textAlign="right"
          keyboardType="numeric"
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>מגדר:</Text>
          <Picker
            selectedValue={gender}
            style={styles.picker}
            onValueChange={(itemValue) => setGender(itemValue)}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="זכר" value="זכר" />
            <Picker.Item label="נקבה" value="נקבה" />
          </Picker>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.registerButton,
            pressed && styles.registerButtonPressed,
          ]}
          onPress={registerHandler}
          disabled={isRegistering}
        >
          {isRegistering ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>הרשמה</Text>
          )}
        </Pressable>
      </ScrollView>

      <ErrorModal
        visible={errorVisible}
        title={errorText.title}
        message={errorText.message}
        onClose={() => {
          setErrorVisible(false);
          if (errorText.title === 'הרשמה הצליחה') {
            setBtnColor(theColor.CancelRed);
          }
        }}
        btnColor={btnColor}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 18,
    textAlign: 'right',
    fontSize: 16,
    color: '#424242',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateInput: {
    justifyContent: 'center',
    height: 50,
  },
  dateText: {
    fontSize: 16,
    color: '#424242',
  },
  datePlaceholder: {
    color: '#A0A0A0',
  },
  dateSelected: {
    color: '#424242',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    marginBottom: 18,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    paddingVertical: 0,
  },
  pickerLabel: {
    fontSize: 14,
    textAlign: 'right',
    paddingHorizontal: 15,
    paddingTop: 8,
    color: '#888888',
    fontWeight: '600',
  },
  picker: {
    height: 40,
    width: '100%',
    color: '#424242',
  },
  pickerItem: {
    textAlign: 'right',
  },
  registerButton: {
    backgroundColor: '#BBDEFB',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  registerButtonPressed: {
    backgroundColor: '#90CAF9',
  },
  registerButtonText: {
    color: '#1A237E',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
