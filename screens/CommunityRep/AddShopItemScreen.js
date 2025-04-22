import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AddShopItemScreen({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [level, setLevel] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('http://10.100.102.16:5000/categories/all')
      .then((res) => res.json())
      .then((data) => setAvailableCategories(data))
      .catch((err) => console.error('שגיאה בטעינת קטגוריות', err));
  }, []);

  const toggleCategory = (name) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

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
    newItem.categories =
      selectedCategories.length > 0 ? selectedCategories : ['אחר'];

    try {
      const response = await fetch('http://10.100.102.16:5000/shop/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      const data = await response.json();

      if (response.ok) {
        setName('');
        setPrice('');
        setQuantity('');
        setLevel('');
        setDescription('');
        setImageUrl('');
        setSelectedCategories([]);
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

      <TouchableOpacity
        style={styles.imageButton}
        onPress={() => setCategoryModalVisible(true)}
      >
        <Text style={styles.imageButtonText}>🏷️ בחר קטגוריות</Text>
      </TouchableOpacity>
      <Text style={{ textAlign: 'center', marginTop: 8 }}>
        {selectedCategories.length > 0
          ? selectedCategories.join(', ')
          : 'לא נבחרו קטגוריות'}
      </Text>

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

      <Modal visible={categoryModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>בחר קטגוריות</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {availableCategories.map((cat) => (
                <TouchableOpacity
                  key={cat._id}
                  style={styles.checkboxRow}
                  onPress={() => toggleCategory(cat.name)}
                >
                  <Text style={styles.checkboxLabel}>{cat.name}</Text>
                  <Text>
                    {selectedCategories.includes(cat.name) ? '✅' : '⬜'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  checkboxRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  checkboxLabel: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 8,
    fontSize: 16,
  },
  modalClose: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
});
