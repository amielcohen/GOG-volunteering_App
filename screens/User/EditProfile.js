import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';

export default function EditProfile({ navigation, route }) {
  const { user } = route.params;

  // state חדש לאחסון נתוני המשתמש המעודכנים
  const [userData, setUserData] = useState(user);

  // State עבור שדות עריכה נפרדים
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDateOfBirth, setNewDateOfBirth] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newHouseNumber, setNewHouseNumber] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [gender, setGender] = useState(userData.gender || '');

  // פונקציה לטיפול בשינוי תאריך
  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewDateOfBirth(selectedDate);
    }
  };

  // פונקציה לבחירת תמונה
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.cancelled) {
      setNewProfilePic(result.uri);
    }
  };

  // פונקציה לעדכון הפרופיל בשרת
  const updateProfileHandler = async () => {
    const updatedProfile = {
      _id: userData._id,
      email: newEmail || userData.email,
      password: newPassword || userData.password,
      dateOfBirth: newDateOfBirth
        ? newDateOfBirth.toISOString().split('T')[0]
        : userData.dateOfBirth,
      city: newCity || userData.city,
      street: newStreet || userData.street,
      houseNumber: newHouseNumber || userData.houseNumber,
      profilePic: newProfilePic || userData.profilePic,
      gender: gender,
    };

    console.log('Updating profile with:', updatedProfile);
    try {
      const response = await fetch(
        'http://10.100.102.16:5000/auth/updateProfile',
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProfile),
        }
      );

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { message: responseText };
      }

      if (response.ok) {
        console.log('Profile updated successfully:', data);
        Alert.alert('עדכון פרופיל', 'הפרופיל עודכן בהצלחה');
        navigation.goBack();
      } else {
        Alert.alert('Error', data.message || 'עדכון הפרופיל נכשל');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'אירעה שגיאה בעדכון הפרופיל');
    }
  };

  // פונקציה לקבלת נתוני המשתמש המעודכנים מהשרת
  const fetchUpdatedUserData = async () => {
    try {
      console.log('Fetching updated user data...');
      const response = await fetch(
        `http://10.100.102.16:5000/auth/profile/${userData._id}`
      );
      if (response.ok) {
        const updatedUser = await response.json();
        console.log('Updated user received:', updatedUser);
        setUserData(updatedUser.user || updatedUser);
      } else {
        console.error('Failed to fetch updated user data');
      }
    } catch (error) {
      console.error('Error fetching updated user data:', error);
    }
  };

  // שימוש ב-useFocusEffect לרענון הנתונים בכל פעם שהמסך מופיע
  useFocusEffect(
    useCallback(() => {
      fetchUpdatedUserData();
    }, [])
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>עריכת פרופיל</Text>

        {/* תמונת פרופיל */}
        <View style={styles.profilePicContainer}>
          <Image
            source={
              newProfilePic
                ? { uri: newProfilePic }
                : userData.profilePic
                  ? { uri: userData.profilePic }
                  : require('../../images/defaultProfile.png')
            }
            style={styles.profilePic}
          />
          <Pressable onPress={pickImage} style={styles.changePicButton}>
            <Text style={styles.changePicText}>שנה תמונת פרופיל</Text>
          </Pressable>
        </View>

        {/* שדות עריכה – הערכים הקיימים מוצגים כ-placeholder */}
        <TextInput
          style={styles.input}
          placeholder={userData.email || 'אימייל'}
          placeholderTextColor="#888"
          value={newEmail}
          onChangeText={setNewEmail}
          textAlign="right"
        />

        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          placeholderTextColor="#888"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          textAlign="right"
        />

        <Pressable
          style={[styles.input, styles.dateInput]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateText, { textAlign: 'right' }]}>
            {newDateOfBirth
              ? newDateOfBirth.toLocaleDateString('he-IL')
              : userData.dateOfBirth
                ? new Date(userData.dateOfBirth).toLocaleDateString('he-IL')
                : 'תאריך לידה'}
          </Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={newDateOfBirth || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date()}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder={userData.city || 'עיר'}
          placeholderTextColor="#888"
          value={newCity}
          onChangeText={setNewCity}
          textAlign="right"
        />

        <TextInput
          style={styles.input}
          placeholder={userData.street || 'רחוב'}
          placeholderTextColor="#888"
          value={newStreet}
          onChangeText={setNewStreet}
          textAlign="right"
        />

        <TextInput
          style={styles.input}
          placeholder={userData.houseNumber || 'מספר בית'}
          placeholderTextColor="#888"
          value={newHouseNumber}
          onChangeText={setNewHouseNumber}
          textAlign="right"
        />

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

        <Button mode="contained" onPress={updateProfileHandler}>
          עדכן פרופיל
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  changePicButton: {
    marginTop: 10,
  },
  changePicText: {
    fontSize: 16,
    color: '#6200ee',
    textDecorationLine: 'underline',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    color: '#000',
    textAlign: 'right',
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
});
