import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function AddShopItemScreen({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [level, setLevel] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uploadedUrl = await uploadImageToCloudinary(result.assets[0].uri);
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
      } else {
        Alert.alert('שגיאה', 'העלאת התמונה נכשלה');
      }
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    let filename = imageUri.split('/').pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : 'image';

    let formData = new FormData();
    formData.append('file', { uri: imageUri, name: filename, type });
    formData.append('upload_preset', 'GOG-ProfilesIMG'); // שנה לפלואד שלך
    // אין צורך ב-cloud_name כששולחים לכתובת URL הנכונה

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
        console.log('Cloudinary response missing secure_url', data);
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleAddItem = async () => {
    if (!name || !price || !quantity) {
      Alert.alert('נא למלא את כל שדות החובה');
      return;
    }

    setIsLoading(true);

    const newItem = {
      name,
      price: Number(price),
      quantity: Number(quantity),
      level: level ? Number(level) : 0,
      description: description || '',
      imageUrl: imageUrl || '',
    };

    try {
      const response = await fetch('http://10.100.102.16:5000/shop/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      const data = await response.json();

      if (response.ok) {
        // Alert.alert('הצלחה', `הפריט "${data.name}" נשמר בהצלחה`);

        setName('');
        setPrice('');
        setQuantity('');
        setLevel('');
        setDescription('');
        setImageUrl('');

        setIsLoading(false);

        navigation.navigate('ShopMenu', {
          message: `הפריט "${data.name}" נשמר בהצלחה ✅`,
        });
      } else {
        Alert.alert('שגיאה', data.error || 'שמירת הפריט נכשלה');
      }
    } catch (err) {
      console.error('שגיאה:', err.message);
      Alert.alert('שגיאה', 'תקלה בעת שליחה לשרת');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>שם הפריט *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="כדורגל"
      />

      <Text style={styles.label}>מחיר *</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="120"
        keyboardType="numeric"
      />

      <Text style={styles.label}>כמות במלאי *</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="5"
        keyboardType="numeric"
      />

      <Text style={styles.label}>רמה נדרשת (אופציונלי)</Text>
      <TextInput
        style={styles.input}
        value={level}
        onChangeText={setLevel}
        placeholder="0"
        keyboardType="numeric"
      />

      <Text style={styles.label}>תיאור (לא חובה)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="תיאור של הפריט..."
        multiline
      />
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>📷 בחר תמונה</Text>
      </TouchableOpacity>

      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.previewImage} />
      ) : (
        <Text style={{ textAlign: 'center', marginVertical: 10 }}>
          לא נבחרה תמונה
        </Text>
      )}

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#6200EE"
          style={{ marginTop: 20 }}
        />
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.addButtonText}>➕ הוסף פריט</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 5,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    textAlign: 'right',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginVertical: 10,
    borderRadius: 8,
  },
  imageButton: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  imageButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },

  addButton: {
    backgroundColor: '#6200EE',
    padding: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
