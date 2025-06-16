import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../../utils/cloudinary';
import config from '../../config';
import ErrorModal from '../../components/ErrorModal';

export default function EditCityProfileScreen({ route, navigation }) {
  const { user, cityData } = route.params;

  const [username, setUsername] = useState(user.username || '');
  const [password, setPassword] = useState('');
  const [cityName, setCityName] = useState(cityData.name || '');
  const [imageUrl, setImageUrl] = useState(cityData.imageUrl || '');
  const [isLoading, setIsLoading] = useState(false);

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState({ title: '', message: '' });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setIsLoading(true);
      const uploadedUrl = await uploadImageToCloudinary(result.assets[0].uri);
      setIsLoading(false);

      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
      } else {
        setErrorText({ title: 'שגיאה', message: 'העלאת התמונה נכשלה' });
        setErrorVisible(true);
      }
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setErrorText({ title: 'שגיאה', message: 'שם המשתמש לא יכול להיות ריק' });
      setErrorVisible(true);
      return;
    }

    if (password && password.length < 6) {
      setErrorText({
        title: 'שגיאה',
        message: 'הסיסמה חייבת להכיל לפחות 6 תווים',
      });
      setErrorVisible(true);
      return;
    }

    if (!cityName.trim()) {
      setErrorText({ title: 'שגיאה', message: 'שם העיר לא יכול להיות ריק' });
      setErrorVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      const userRes = await fetch(`${config.SERVER_URL}/auth/updateProfile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: user._id,
          username: username.trim(),
          password: password.trim() || undefined,
        }),
      });

      const userData = await userRes.json();
      if (!userRes.ok) {
        throw new Error(userData.message || 'שגיאה בעדכון המשתמש');
      }

      const cityRes = await fetch(
        `${config.SERVER_URL}/cities/${cityData._id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cityName.trim(),
            imageUrl: imageUrl,
          }),
        }
      );

      const cityDataRes = await cityRes.json();
      if (!cityRes.ok) {
        throw new Error(cityDataRes.error || 'שגיאה בעדכון העיר');
      }

      setErrorText({ title: 'הצלחה', message: 'הפרטים עודכנו בהצלחה' });
      setErrorVisible(true);
    } catch (err) {
      console.error('Update error:', err);
      setErrorText({ title: 'שגיאה', message: err.message || 'אירעה שגיאה' });
      setErrorVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>עריכת פרטי מנהל עירוני</Text>

        <TextInput
          style={styles.input}
          placeholder="שם משתמש"
          placeholderTextColor="#A0A0A0"
          value={username}
          onChangeText={setUsername}
          textAlign="right"
        />

        <TextInput
          style={styles.input}
          placeholder="סיסמה חדשה (לא חובה)"
          placeholderTextColor="#A0A0A0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textAlign="right"
        />

        <TextInput
          style={styles.input}
          placeholder="שם העיר"
          placeholderTextColor="#A0A0A0"
          value={cityName}
          onChangeText={setCityName}
          textAlign="right"
        />

        <Pressable style={styles.imagePicker} onPress={pickImage}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#3F51B5" />
          ) : (
            <>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>🖼️ בחר תמונה</Text>
                </View>
              )}
              <Text style={styles.imageText}>החלף/הוסף תמונה לעיר</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
          ]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>שמור שינויים</Text>
          )}
        </Pressable>

        <ErrorModal
          visible={errorVisible}
          title={errorText.title}
          message={errorText.message}
          onClose={() => setErrorVisible(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  title: {
    fontSize: 26,
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
  imagePicker: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EBF5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D4EEF7',
  },
  imagePlaceholderText: {
    fontSize: 18,
    color: '#3F51B5',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'cover',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#BBDEFB',
  },
  imageText: {
    fontSize: 16,
    color: '#3F51B5',
    fontWeight: 'bold',
  },
  saveButton: {
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
  saveButtonPressed: {
    backgroundColor: '#90CAF9',
  },
  saveButtonText: {
    color: '#1A237E',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
