import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [password, setPassword] = useState('');

  const registerHandler = async () => {
    console.log('Registering user:', {
      username,
      email,
      dateOfBirth,
      city,
      street,
      houseNumber,
      password
    });
  
    try {
      const response = await fetch('http://10.100.102.16:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          email,
          dateOfBirth,
          city,
          street,
          houseNumber,
          password
        })
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Registration successful:', data);
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'הרשמה נכשלה');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('אירעה שגיאה בהרשמה');
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>הרשמה</Text>
      
      <TextInput
        style={styles.input}
        placeholder="שם משתמש"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="אימייל"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="תאריך לידה (למשל: 1990-01-01)"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />

      <TextInput
        style={styles.input}
        placeholder="עיר"
        value={city}
        onChangeText={setCity}
      />

      <TextInput
        style={styles.input}
        placeholder="רחוב"
        value={street}
        onChangeText={setStreet}
      />

      <TextInput
        style={styles.input}
        placeholder="מספר בית"
        value={houseNumber}
        onChangeText={setHouseNumber}
      />

      <TextInput
        style={styles.input}
        placeholder="סיסמה"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="הרשם" onPress={registerHandler} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
});
