import React from 'react';
import { View, Text, StyleSheet, Button, Alert, Pressable } from 'react-native';

function UserHomeScreen ({navigation})  {
  const handlePress = () => {
    Alert.alert('Button Pressed!', 'You pressed the button.');
  };

function giftshopnav(){
  navigation.navigate('giftshop');
}

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>ברוך הבא לעמוד הבית</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>שלום, יוזר!</Text>
        <Text style={styles.userInfo}>רמה: 4 | נקודות: 408 | מטבעות: 504</Text>

        <Pressable style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>חפש התנדבויות</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>היסטוריית התנדבויות</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={giftshopnav}>
          <Text style={styles.buttonText}>חנות המתנות</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 22,
    marginBottom: 10,
    color: '#333',
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 30,
    color: '#555',
  },
  button: {
    backgroundColor: '#6200ee',
    width: '80%',
    paddingVertical: 12,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UserHomeScreen;
