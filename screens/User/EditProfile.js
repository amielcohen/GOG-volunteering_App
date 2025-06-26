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
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';
import HelpModal from '../../components/HelpModal';
import ConfirmModal from '../../components/ConfirmModal';
import SuccessModal from '../../components/ErrorModal';

export default function EditProfile({ navigation, route }) {
  const { user } = route.params;
  const [userData, setUserData] = useState(user);

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
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [citiesList, setCitiesList] = useState([]);

  const [helpVisible, setHelpVisible] = useState(false);
  const openHelp = () => setHelpVisible(true);

  const [confirmResetVisible, setConfirmResetVisible] = useState(false);
  const [updatedProfilePayload, setUpdatedProfilePayload] = useState(null);

  const [SuccessVisible, setSuccessVisible] = useState(false);

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

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(`${config.SERVER_URL}/cities`);
        const data = await res.json();
        setCitiesList(data);
      } catch (err) {
        console.error('שגיאה בשליפת ערים:', err);
      }
    };
    fetchCities();
  }, []);

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewDateOfBirth(selectedDate);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        if (result.assets && result.assets.length > 0) {
          return result.assets[0].uri;
        }
        if (result.uri) {
          return result.uri;
        }
      }
      return null;
    } catch (error) {
      console.error('Error in pickImage:', error);
      return null;
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    let filename = imageUri.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : 'image';

    let formData = new FormData();
    formData.append('file', { uri: imageUri, name: filename, type });
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
        return data.secure_url;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleProfilePicUpdate = async () => {
    if (isUploading) return;
    setIsUploading(true);
    const imageUri = await pickImage();
    if (imageUri) {
      const uploadedUrl = await uploadImageToCloudinary(imageUri);
      if (uploadedUrl) {
        setNewProfilePic(uploadedUrl);
        Alert.alert('העלאת תמונה', 'התמונה הועלתה בהצלחה');
      } else {
        Alert.alert('שגיאה', 'העלאת התמונה נכשלה');
      }
    }
    setIsUploading(false);
  };

  const updateProfileHandler = async () => {
    const finalEmail =
      newEmail.trim() === '' ? userData.email : newEmail.trim();
    const finalCity =
      newCity ||
      (typeof userData.city === 'object' ? userData.city._id : userData.city);
    const finalStreet =
      newStreet.trim() === '' ? userData.street : newStreet.trim();
    const finalHouseNumber =
      newHouseNumber.trim() === ''
        ? userData.houseNumber
        : newHouseNumber.trim();
    const finalDateOfBirth = newDateOfBirth
      ? newDateOfBirth.toISOString().split('T')[0]
      : userData.dateOfBirth
        ? new Date(userData.dateOfBirth).toISOString().split('T')[0]
        : null;
    const finalFirstName =
      newFirstName.trim() === '' ? userData.firstName : newFirstName.trim();
    const finalLastName =
      newLastName.trim() === '' ? userData.lastName : newLastName.trim();
    const finalPassword = newPassword.trim();
    const finalConfirmPassword = confirmPassword.trim();

    if (!/\S+@\S+\.\S+/.test(finalEmail)) {
      Alert.alert('Error', 'אימייל לא תקין');
      return;
    }

    if (
      !finalDateOfBirth ||
      finalCity === '' ||
      finalStreet === '' ||
      finalHouseNumber === ''
    ) {
      Alert.alert('Error', 'יש למלא את כל השדות החיוניים');
      return;
    }

    let passwordToSend = userData.password;
    if (finalPassword !== '') {
      if (finalPassword.length < 6) {
        Alert.alert('Error', 'סיסמה חייבת להכיל לפחות 6 תווים');
        return;
      }
      if (finalPassword !== finalConfirmPassword) {
        Alert.alert('Error', 'סיסמה ואימות סיסמה אינם תואמים');
        return;
      }
      passwordToSend = finalPassword;
    }

    const updatedProfile = {
      _id: userData._id,
      email: finalEmail,
      password: passwordToSend,
      dateOfBirth: finalDateOfBirth,
      city: finalCity,
      street: finalStreet,
      houseNumber: finalHouseNumber,
      profilePic: newProfilePic || userData.profilePic,
      gender: gender,
      firstName: finalFirstName,
      lastName: finalLastName,
    };

    const originalCity =
      typeof userData.city === 'object' ? userData.city._id : userData.city;

    if (finalCity !== originalCity) {
      setUpdatedProfilePayload(updatedProfile);
      setConfirmResetVisible(true); // מציג את המודל
    } else {
      await continueProfileUpdate(updatedProfile);
    }
  };
  const continueProfileUpdate = async (profile) => {
    try {
      const response = await fetch(`${config.SERVER_URL}/auth/updateProfile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessVisible(true);
      } else {
        Alert.alert('Error', data.message || 'עדכון הפרופיל נכשל');
      }
    } catch (error) {
      Alert.alert('Error', 'אירעה שגיאה בעדכון הפרופיל');
    }
  };

  const fetchUpdatedUserData = async () => {
    try {
      const response = await fetch(
        `${config.SERVER_URL}/auth/profile/${userData._id}`
      );
      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser.user || updatedUser);
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

        <Text style={styles.label}>שם פרטי</Text>
        <TextInput
          style={styles.input}
          placeholder={userData.firstName || 'שם פרטי'}
          value={newFirstName}
          onChangeText={setNewFirstName}
          textAlign="right"
        />

        <Text style={styles.label}>שם משפחה</Text>
        <TextInput
          style={styles.input}
          placeholder={userData.lastName || 'שם משפחה'}
          value={newLastName}
          onChangeText={setNewLastName}
          textAlign="right"
        />

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
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          textAlign="right"
        />

        <Text style={styles.label}>אימות סיסמה</Text>
        <TextInput
          style={styles.input}
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
            {' '}
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
        <View style={styles.row}>
          <Text style={styles.label}>עיר</Text>
          <TouchableOpacity onPress={openHelp}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="red"
              style={{ marginStart: 5, marginRight: 5 }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={
              newCity ||
              (typeof userData.city === 'object'
                ? userData.city._id
                : userData.city)
            }
            onValueChange={(itemValue) => setNewCity(itemValue)}
            style={styles.picker}
            itemStyle={{ textAlign: 'right' }}
          >
            {citiesList
              .slice() // מונע שינוי של המערך המקורי
              .sort((a, b) => a.name.localeCompare(b.name, 'he')) // מיון לפי עברית
              .map((city) => (
                <Picker.Item
                  key={city._id}
                  label={city.name}
                  value={city._id}
                />
              ))}
          </Picker>
        </View>

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

        <ConfirmModal
          visible={confirmResetVisible}
          title="שינוי עיר מגורים"
          message="שינוי העיר יאפס את כל הגוגואים שצברת. האם אתה בטוח שברצונך להמשיך?"
          onCancel={() => {
            setConfirmResetVisible(false);
            setUpdatedProfilePayload(null);
          }}
          onConfirm={async () => {
            setConfirmResetVisible(false);
            try {
              await fetch(`${config.SERVER_URL}/auth/resetGoGs`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: userData._id }),
              });
            } catch (err) {
              console.error('Reset GoGs failed:', err);
            }
            if (updatedProfilePayload) {
              await continueProfileUpdate(updatedProfilePayload);
            }
          }}
        />
        {SuccessVisible && (
          <SuccessModal
            title="פרופיל עדכון"
            message="הפרופיל עודכן בהצלחה"
            onClose={() => {
              setSuccessVisible(false);
              navigation.navigate('UserHomeScreen', { user: user });
            }}
          />
        )}

        <HelpModal
          visible={helpVisible}
          onClose={() => setHelpVisible(false)}
          title="אזהרה!"
          message="שינוי העיר מגורים יאפס את כל הגוגואים בחשבון, לא ניתן לשחזר גוגואים שיאופסו!  "
        />
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
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 5,
  },
});
