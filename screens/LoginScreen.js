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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ErrorModal from '../components/ErrorModal';
import config from '../config';
import { saveUserId } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [usernameAlign, setUsernameAlign] = useState('right');

  const [isLoading, setIsLoading] = useState(false);

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState('');

  function userNameInputHandler(enteredText) {
    setUsername(enteredText);
    if (enteredText.length === 0) {
      setUsernameAlign('right'); // placeholder בלבד
    } else {
      const firstChar = enteredText[0];
      const isEnglish = /^[A-Za-z]/.test(firstChar);
      setUsernameAlign(isEnglish ? 'left' : 'right');
    }
  }

  function passwordInputHandler(enteredText) {
    setPassword(enteredText);
  }

  async function loginHandler() {
    if (isLoading) return; // מניעת לחיצות כפולות
    setIsLoading(true);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    console.log('loginHandler started', cleanUsername, cleanPassword);

    try {
      const response = await fetch(`${config.SERVER_URL}/auth/login`, {
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
        await saveUserId(user._id);

        if (user.role === 'admin') {
          navigation.navigate('AdminHomeScreen');
        } else if (user.role === 'CommunityRep') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'CommunityRepHomeScreen', params: { user } }],
          });
        } else if (user.role === 'OrganizationRep') {
          navigation.reset({
            index: 0,
            routes: [{ name: 'OrganizationRepHomeScreen', params: { user } }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'UserHomeScreen', params: { user } }],
          });
        }
      } else {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        setErrorText({
          title: 'אופס...',
          message: ' שם המשתמש או הסיסמה שגויים',
        });
        setErrorVisible(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorText({
        title: 'שגיאה',
        message: 'אירעה שגיאה במהלך ההתחברות',
      });
      setErrorVisible(true);
    } finally {
      setIsLoading(false);
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
                  style={{
                    flex: 1,
                    textAlign: usernameAlign,
                  }}
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
                <Pressable onPress={loginHandler} disabled={isLoading}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.loginText}>התחבר</Text>
                  )}
                </Pressable>
              </View>
            </View>
            <View style={styles.newaccount}>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={styles.newAccountText}>צור חשבון חדש</Text>
              </Pressable>
            </View>
            <ErrorModal
              visible={errorVisible}
              title={errorText.title}
              message={errorText.message}
              onClose={() => setErrorVisible(false)}
            />
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
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // רקע בהיר עם שקיפות
    borderRadius: 12, // גבולות מעוגלים
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 250,
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  loginText: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  newaccount: {
    alignItems: 'center',
    marginBottom: 40,
  },
  newAccountText: {
    fontSize: 16,
    color: 'black',
    textDecorationLine: 'underline',
  },
});
