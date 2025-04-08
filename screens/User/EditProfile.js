import React, { useState, useCallback, useEffect } from 'react';
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
  const [userData, setUserData] = useState(user);

  // שדות עריכה – מתחילים כריקים (למעט נתונים שמוצגים כ- placeholder)
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newDateOfBirth, setNewDateOfBirth] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newHouseNumber, setNewHouseNumber] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [gender, setGender] = useState(userData.gender || '');
  const [isUploading, setIsUploading] = useState(false);

  // בקשת הרשאות לגלריה בעת טעינת הקומפוננטה
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'מצטער',
          'האפליקציה דורשת הרשאה לגישה לגלריה כדי לבחור תמונות'
        );
      }
    })();
  }, []);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewDateOfBirth(selectedDate);
    }
  };

  // פונקציה לבחירת תמונה מהגלריה (תואמת את גרסת expo-image-picker ~16.0.6)
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // שימוש במאפיין הנכון
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      console.log('ImagePicker result:', result);

      if (!result.canceled) {
        // במבנה החדש: result.assets הוא מערך, אנו לוקחים את הנכס הראשון
        if (result.assets && result.assets.length > 0) {
          console.log('Selected image URI:', result.assets[0].uri);
          return result.assets[0].uri;
        }
        // תמיכה גם במבנה ישן (אם קיים)
        if (result.uri) {
          console.log('Selected image URI (old structure):', result.uri);
          return result.uri;
        }
      }
      return null;
    } catch (error) {
      console.error('Error in pickImage:', error);
      return null;
    }
  };

  // פונקציה להעלאת תמונה ל-Cloudinary
  const uploadImageToCloudinary = async (imageUri) => {
    // חילוץ שם הקובץ מה-URI
    let filename = imageUri.split('/').pop();
    // קביעת סוג הקובץ
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : 'image';

    let formData = new FormData();
    formData.append('file', { uri: imageUri, name: filename, type });
    // עדכון: יש להשתמש ב-upload preset שהגדרת ב-Cloudinary (כאן: GOG-ProfilesIMG)
    formData.append('upload_preset', 'GOG-ProfilesIMG');

    try {
      let response = await fetch(
        'https://api.cloudinary.com/v1_1/drlrtt5dz/image/upload',
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      let data = await response.json();
      if (data.secure_url) {
        console.log('Upload successful, URL:', data.secure_url);
        return data.secure_url;
      } else {
        console.log('Upload error:', data);
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // פונקציה שמשלבת בחירת התמונה והעלאתה
  const handleProfilePicUpdate = async () => {
    if (isUploading) return; // מניעה מפני לחיצות כפולות
    setIsUploading(true);
    console.log('handleProfilePicUpdate pressed');
    const imageUri = await pickImage();
    if (imageUri) {
      const uploadedUrl = await uploadImageToCloudinary(imageUri);
      if (uploadedUrl) {
        setNewProfilePic(uploadedUrl);
        Alert.alert('העלאת תמונה', 'התמונה הועלתה בהצלחה');
      } else {
        Alert.alert('שגיאה', 'העלאת התמונה נכשלה');
      }
    } else {
      console.log('No image URI received from picker');
    }
    setIsUploading(false);
  };

  const updateProfileHandler = async () => {
    const finalEmail = newEmail.trim() === '' ? userData.email : newEmail;
    const finalCity = newCity.trim() === '' ? userData.city : newCity;
    const finalStreet = newStreet.trim() === '' ? userData.street : newStreet;
    const finalHouseNumber =
      newHouseNumber.trim() === '' ? userData.houseNumber : newHouseNumber;
    const finalDateOfBirth = newDateOfBirth
      ? newDateOfBirth.toISOString().split('T')[0]
      : userData.dateOfBirth
        ? new Date(userData.dateOfBirth).toISOString().split('T')[0]
        : null;

    if (!/\S+@\S+\.\S+/.test(finalEmail)) {
      Alert.alert('Error', 'אימייל לא תקין');
      return;
    }
    if (
      !finalDateOfBirth ||
      finalCity.trim() === '' ||
      finalStreet.trim() === '' ||
      finalHouseNumber.trim() === ''
    ) {
      Alert.alert('Error', 'יש למלא את כל השדות החיוניים');
      return;
    }
    let finalPassword = userData.password;
    if (newPassword !== '') {
      if (newPassword.length < 6) {
        Alert.alert('Error', 'סיסמה חייבת להכיל לפחות 6 תווים');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'סיסמה ואימות סיסמה אינם תואמים');
        return;
      }
      finalPassword = newPassword;
    }

    const updatedProfile = {
      _id: userData._id,
      email: finalEmail,
      password: finalPassword,
      dateOfBirth: finalDateOfBirth,
      city: finalCity,
      street: finalStreet,
      houseNumber: finalHouseNumber,
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
        Alert.alert(
          'עדכון פרופיל',
          'הפרופיל עודכן בהצלחה',
          [
            {
              text: 'OK',
              onPress: () =>
                navigation.navigate('UserHomeScreen', { user: data.user }),
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Error', data.message || 'עדכון הפרופיל נכשל');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'אירעה שגיאה בעדכון הפרופיל');
    }
  };

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
          <Pressable
            onPress={handleProfilePicUpdate}
            style={styles.changePicButton}
          >
            <Text style={styles.changePicText}>שנה תמונת פרופיל</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>אימייל</Text>
        <TextInput
          style={styles.input}
          placeholder={userData.email || 'אימייל'}
          value={newEmail}
          onChangeText={setNewEmail}
          textAlign="right"
        />

        <Text style={styles.label}>סיסמה חדשה</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          textAlign="right"
        />

        <Text style={styles.label}>אימות סיסמה</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          textAlign="right"
        />

        <Text style={styles.label}>תאריך לידה</Text>
        <Pressable
          style={[styles.input, styles.dateInput]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateText, { textAlign: 'right' }]}>
            {newDateOfBirth
              ? newDateOfBirth.toLocaleDateString('he-IL')
              : userData.dateOfBirth
                ? new Date(userData.dateOfBirth).toLocaleDateString('he-IL')
                : 'בחר תאריך'}
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

        <Text style={styles.label}>עיר</Text>
        <TextInput
          style={styles.input}
          placeholder={userData.city || 'עיר'}
          value={newCity}
          onChangeText={setNewCity}
          textAlign="right"
        />

        <Text style={styles.label}>רחוב</Text>
        <TextInput
          style={styles.input}
          placeholder={userData.street || 'רחוב'}
          value={newStreet}
          onChangeText={setNewStreet}
          textAlign="right"
        />

        <Text style={styles.label}>מספר בית</Text>
        <TextInput
          style={styles.input}
          placeholder={userData.houseNumber || 'מספר בית'}
          value={newHouseNumber}
          onChangeText={setNewHouseNumber}
          textAlign="right"
        />

        <Text style={styles.label}>מגדר</Text>
        <View style={styles.pickerContainer}>
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
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    textAlign: 'right',
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
    marginBottom: 15,
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
    marginBottom: 15,
    overflow: 'hidden',
    width: '100%',
  },
  picker: {
    height: 55,
    width: '100%',
    textAlign: 'right',
  },
});
