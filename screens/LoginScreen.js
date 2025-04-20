import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  StatusBar,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);

  function userNameInputHandler(enteredText) {
    setUsername(enteredText);
  }

  function passwordInputHandler(enteredText) {
    setPassword(enteredText);
  }

  async function loginHandler() {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    console.log('loginHandler started', cleanUsername, cleanPassword);

    try {
      const response = await fetch('http://10.100.102.16:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
        }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const user = await response.json();
        console.log('User received:', user);

        if (user.role === 'admin') {
          navigation.navigate('AdminHomeScreen');
        } else if (user.role === 'CommunityRep') {
          navigation.navigate('CommunityRepHomeScreen');
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'UserHomeScreen', params: { user } }],
          });
        }
      } else {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        alert(errorData.message || 'שם המשתמש או הסיסמה שגויים');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('אירעה שגיאה במהלך ההתחברות');
    }
  }

  return (
    <LinearGradient style={{ flex: 1 }} colors={['#e43613', '#f1ea22']}>
      <ImageBackground
        style={{ flex: 1 }}
        source={require('../images/handpen.jpg')}
        resizeMode="cover"
        imageStyle={{ opacity: 0.5 }}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <StatusBar style="dark" />
            <View style={styles.headerSection}>
              <Text style={styles.headerText}>GoG</Text>
              <Text style={styles.subHeaderText}>Game of Giving</Text>
            </View>
            <View style={styles.datacontainer}>
              <View style={styles.inputstyle}>
                <TextInput
                  placeholder="שם משתמש"
                  placeholderTextColor="#000"
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={username}
                  onChangeText={userNameInputHandler}
                />
              </View>
              <View style={[styles.inputstyle, styles.passwordContainer]}>
                <TextInput
                  style={{ flex: 1 }}
                  placeholder="סיסמה"
                  placeholderTextColor="#000"
                  secureTextEntry={secureText}
                  value={password}
                  onChangeText={passwordInputHandler}
                />
                <Pressable
                  onPress={() => setSecureText(!secureText)}
                  style={styles.eyeButton}
                >
                  {secureText ? (
                    <Ionicons name="eye-off" size={24} color="black" />
                  ) : (
                    <Ionicons name="eye" size={24} color="black" />
                  )}
                </Pressable>
              </View>
              <View style={styles.loginStyle}>
                <Pressable onPress={loginHandler}>
                  <Text style={styles.loginText}>התחבר</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.newaccount}>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={styles.newAccountText}>צור חשבון חדש</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  headerText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  subHeaderText: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  datacontainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 150,
  },
  inputstyle: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: 200,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeButton: {
    padding: 5,
  },
  loginStyle: {
    marginTop: 20,
  },
  loginText: {
    fontSize: 18,
    color: 'black', // טקסט "התחבר" בשחור
  },
  newaccount: {
    alignItems: 'center',
    marginBottom: 40,
  },
  newAccountText: {
    fontSize: 16,
    color: 'black', // טקסט "צור חשבון חדש" בשחור
    textDecorationLine: 'underline',
  },
});
