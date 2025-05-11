import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import config from '../../config';

export default function AddOrganizationScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('צריך הרשאה לגשת לגלריה!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
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
      return data.secure_url || null;
    } catch (error) {
      console.error('שגיאה בהעלאת תמונה:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס שם לעמותה.');
      return;
    }
    if (!type) {
      Alert.alert('שגיאה', 'אנא בחר סוג עמותה.');
      return;
    }

    let uploadedImageUrl = '';
    if (image) {
      uploadedImageUrl = await uploadImageToCloudinary(image);
      if (!uploadedImageUrl) {
        Alert.alert('שגיאה', 'העלאת התמונה נכשלה.');
        return;
      }
    }

    const newOrganization = {
      name: name.trim(),
      description,
      type,
      contactEmail: email,
      phone,
      imageUrl: uploadedImageUrl,
      isGlobal: true,
      activeCities: [],
    };

    try {
      const response = await fetch(`${config.SERVER_URL}/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrganization),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('הצלחה', 'העמותה נוספה בהצלחה!');
        navigation.goBack();
      } else {
        Alert.alert('שגיאה', data.message || 'שגיאה בהוספת עמותה.');
      }
    } catch (error) {
      console.error('שגיאה בשמירת עמותה:', error);
      Alert.alert('שגיאה', 'שגיאה כללית בהוספת עמותה.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>הוספת עמותה חדשה</Text>

      <TextInput
        style={styles.input}
        placeholder="שם העמותה"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="תיאור"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={type}
          onValueChange={(itemValue) => setType(itemValue)}
        >
          <Picker.Item label="בחר סוג עמותה" value="" />
          <Picker.Item label="עמותה" value="עמותה" />
          <Picker.Item label="בית אבות" value="בית אבות" />
          <Picker.Item label="בית ספר" value="בית ספר" />
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="אימייל ליצירת קשר"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="טלפון ליצירת קשר"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>בחר תמונה</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>הוסף עמותה</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    textAlign: 'right',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  imagePicker: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
