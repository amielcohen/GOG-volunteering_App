import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, StatusBar,ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'amitco8', password: '12345', role: 'user' },
    { username: 'ron5', password: '12345', role: 'CommunityRep' },
  ];

  function userNameInputHandler(enteredText) {
    setUsername(enteredText);
  }

  function passwordInputHandler(enteredText) {
    setPassword(enteredText);
  }

  function loginHandler(){
  // חיפוש המשתמש על פי שם המשתמש והסיסמה
  const user = users.find(
    user => user.username === username && user.password === password
  );

  if (user) {
    // ניווט בהתאם לתפקיד המשתמש
    switch (user.role) {
      case 'admin':
        navigation.navigate('AdminHomeScreen');
        break;
      case 'user':
        navigation.navigate('UserHomeScreen');
        break;
      default:
        // במקרה שיש תפקיד לא מוכר, אפשר להציג הודעה מתאימה
        alert('תפקיד לא ידוע. נא לפנות למנהל המערכת.');
    }
  } else {
    // במקרה של שם משתמש או סיסמה שגויים
    alert('שם המשתמש או הסיסמה שגויים');
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
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={{ alignItems: 'center', justifyContent: 'center',marginTop: 50 }}>
        <Text style={{ fontSize: 40, fontWeight: 'bold', color: 'white' }}>GoG</Text>
        <Text style={{ fontSize: 14, color: 'white', marginTop: 4 }}>Game of Giving</Text>
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
        <View style={styles.inputstyle}>
          <TextInput
            placeholder="סיסמה"
            placeholderTextColor="#000"
            secureTextEntry
            value={password}
            onChangeText={passwordInputHandler}
          />
        </View>
        <View style={styles.loginStyle}>
          <Pressable onPress={loginHandler}>
            <Text>התחבר</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.newaccount}>
        <Pressable>
          <Text>צור חשבון חדש</Text>
        </Pressable>
      </View>
    </View>
        </ImageBackground>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    datacontainer: {
      flex: 8,
      padding: 3,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 150
    },
    inputstyle: {
      marginBottom: 20,
      color: "#000000",
      borderBottomWidth: 1,
      width: 200,
    },
    newaccount: {
      flex: 1,
      marginBottom:40
    },
    appcontiner: {
      flex: 1,
    },
    imgappcontiner: {
      padding: 50,
      flex: 1,
    },
    loginStyle: {
      marginTop: 20
    },
    imagetranspernt: {
      opacity: 0.2
    }
  });
  