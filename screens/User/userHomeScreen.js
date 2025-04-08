import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  BackHandler,
  Image,
} from 'react-native';
import CustomCoinIcon from '../../components/CustomCoinIcon'; // עדכן את הנתיב לפי מיקום הקובץ
import { Button } from 'react-native-paper';

export default function UserHomeScreen({ navigation, route }) {
  // חסימת לחיצת כפתור החזרה הפיזי
  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, []);

  const { user } = route.params;

  const handlePress = () => {
    Alert.alert('Button Pressed!', 'You pressed the button.');
  };

  const giftshopnav = () => {
    navigation.navigate('giftshop');
  };

  const editProfile_nav = () => {
    navigation.navigate('EditProfile', { user });
  };
  const tester = () => {
    navigation.navigate('TestImagePicker');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* תמונת פרופיל עגולה */}
        <Image
          source={
            user.profilePic
              ? { uri: user.profilePic }
              : require('../../images/defaultProfile.png')
          }
          style={styles.profileImage}
        />

        <Text style={styles.welcomeText}>שלום, {user.username}!</Text>

        <View style={styles.coinContainer}>
          <Text style={styles.coinLabel}>גוגואים:</Text>
          <Text style={styles.coinNumber}>{user.GoGs}</Text>
          <CustomCoinIcon size={20} coinColor="#FFD700" seedColor="#8B4513" />
        </View>

        <Pressable style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>חפש התנדבויות</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>היסטוריית התנדבויות</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={giftshopnav}>
          <Text style={styles.buttonText}>חנות המתנות</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={editProfile_nav}>
          <Text style={styles.buttonText}>עריכת פרטים אישיים</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 100, // גודל הרוחב
    height: 100, // גודל הגובה
    borderRadius: 50, // הופך את התמונה לעגולה (חצי מהגודל)
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 22,
    marginBottom: 10,
    color: '#333',
    fontWeight: '600',
  },
  coinContainer: {
    flexDirection: 'row-reverse', // מסדר את האלמנטים מימין לשמאל
    alignItems: 'center',
    marginBottom: 30,
  },
  coinLabel: {
    fontSize: 16,
    color: '#555',
    marginLeft: 5,
  },
  coinNumber: {
    fontSize: 16,
    color: '#555',
    marginHorizontal: 5,
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
