import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import config from '../../config';
import { uploadImageToCloudinary } from '../../utils/cloudinary';

const ISRAEL_DISTRICTS = [
  '',
  'צפון',
  'דרום',
  'מרכז',
  'תל אביב',
  'חיפה',
  'ירושלים',
  'יו"ש',
];

export default function AddCityScreen({ navigation }) {
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState({
    username: '',
    password: '',
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploadingImage(true);
      const uploadedUrl = await uploadImageToCloudinary(result.assets[0].uri);
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
      } else {
        Alert.alert('שגיאה', 'העלאת התמונה נכשלה');
      }
      setUploadingImage(false);
    }
  };

  const handleAddCity = async () => {
    if (!name.trim() || !username.trim() || !password.trim() || !email.trim()) {
      setError('יש למלא את כל שדות העיר ואחראי העיר');
      return;
    }
    if (password.trim().length < 6) {
      setError('סיסמה קצרה מדי – נדרש לפחות 6 תווים');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      const cityRes = await axios.post(`${config.SERVER_URL}/cities`, {
        name: name.trim(),
        state: state || undefined,
        imageUrl: imageUrl || undefined,
      });

      const cityId = cityRes.data.city._id;

      await axios.post(`${config.SERVER_URL}/auth/register`, {
        username,
        password,
        email,
        role: 'CommunityRep',
        city: cityId,
      });

      setCreatedCredentials({ username, password });
      setShowModal(true);
      setSuccess(true);
      setName('');
      setState('');
      setImageUrl('');
      setUsername('');
      setPassword('');
      setEmail('');
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'שגיאה ביצירת העיר או המשתמש');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>הוסף עיר חדשה</Text>

        <TextInput
          style={styles.input}
          placeholder="שם עיר"
          placeholderTextColor="#A0A0A0"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>בחר מחוז (לא חובה)</Text>
        <View style={styles.chipsContainer}>
          {ISRAEL_DISTRICTS.map((district, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.chip, state === district && styles.selectedChip]}
              onPress={() => setState(district)}
            >
              <Text
                style={[
                  styles.chipText,
                  state === district && styles.selectedChipText,
                ]}
              >
                {district || 'ללא מחוז'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>📷 בחר תמונה לעיר</Text>
        </TouchableOpacity>

        {uploadingImage ? (
          <ActivityIndicator
            size="large"
            color="#607D8B"
            style={{ marginTop: 20 }}
          />
        ) : imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.previewImage} />
        ) : (
          <Text style={styles.noImageText}>לא נבחרה תמונה</Text>
        )}

        <Text style={styles.sectionTitle}>פרטי אחראי עיר</Text>

        <TextInput
          style={styles.input}
          placeholder="שם משתמש"
          placeholderTextColor="#A0A0A0"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          placeholderTextColor="#A0A0A0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="אימייל"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? (
          <Text style={styles.success}>✅ העיר ואחראי העיר נוספו בהצלחה!</Text>
        ) : null}

        <Pressable
          style={styles.button}
          onPress={handleAddCity}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>הוסף עיר + אחראי</Text>
          )}
        </Pressable>

        <Modal transparent visible={showModal} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>📝 פרטי התחברות</Text>
              <Text style={styles.modalMessage}>
                שם משתמש: {createdCredentials.username}
              </Text>
              <Text style={styles.modalMessage}>
                סיסמה: {createdCredentials.password}
              </Text>
              <Text style={styles.modalNote}>
                אנא צלם מסך או רשום את הפרטים – לא ניתן יהיה לשחזר אותם!
              </Text>
              <Pressable
                style={[styles.button, { marginTop: 20 }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.buttonText}>הבנתי</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8F8F8',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 25,
    fontWeight: 'bold',
    color: '#333333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 25,
    textAlign: 'center',
    color: '#444444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 18,
    textAlign: 'right',
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'right',
    fontWeight: '600',
    color: '#555555',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    margin: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  selectedChip: {
    backgroundColor: '#BBDEFB',
    borderColor: '#90CAF9',
  },
  chipText: {
    color: '#666666',
    fontSize: 14,
  },
  selectedChipText: {
    color: '#212121',
    fontWeight: 'bold',
  },
  imageButton: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imageButtonText: {
    fontSize: 16,
    color: '#3F51B5',
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginTop: 15,
    borderRadius: 10,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  noImageText: {
    textAlign: 'center',
    marginVertical: 15,
    color: '#888888',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#BBDEFB',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#1A237E',
    fontWeight: 'bold',
    fontSize: 18,
  },
  error: {
    color: '#D32F2F',
    marginBottom: 12,
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  success: {
    color: '#388E3C',
    marginBottom: 12,
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 8,
  },
  modalNote: {
    fontSize: 14,
    textAlign: 'center',
    color: '#D32F2F',
    marginTop: 10,
  },
});
