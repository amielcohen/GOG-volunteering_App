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
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    if (!name.trim()) {
      setError('נא להזין שם עיר');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      await axios.post(`${config.SERVER_URL}/cities`, {
        name: name.trim(),
        state: state || undefined,
        imageUrl: imageUrl || undefined,
      });

      setSuccess(true);
      setName('');
      setState('');
      setImageUrl('');
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'שגיאה ביצירת העיר');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>הוסף עיר חדשה</Text>

      <TextInput
        style={styles.input}
        placeholder="שם עיר"
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
          color="#6200EE"
          style={{ marginTop: 20 }}
        />
      ) : imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.previewImage} />
      ) : (
        <Text style={{ textAlign: 'center', marginVertical: 10 }}>
          לא נבחרה תמונה
        </Text>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? (
        <Text style={styles.success}>✅ העיר נוספה בהצלחה!</Text>
      ) : null}

      <Pressable
        style={styles.button}
        onPress={handleAddCity}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>הוסף עיר</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    textAlign: 'right',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
  },
  selectedChip: {
    backgroundColor: '#007BFF',
  },
  chipText: {
    color: '#333',
  },
  selectedChipText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imageButton: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  imageButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginTop: 15,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
  },
});
