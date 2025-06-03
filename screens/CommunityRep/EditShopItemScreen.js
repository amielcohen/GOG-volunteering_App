// EditShopItemScreen.js
// מבוסס על AddShopItemScreen עם שינויים לעריכה
import React, { useState, useEffect, useCallback } from 'react';
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
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';

export default function EditShopItemScreen({ navigation, route }) {
  const { user, item } = route.params;

  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price.toString());
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [level, setLevel] = useState(item.level?.toString() || '');
  const [description, setDescription] = useState(item.description || '');
  const [imageUrl, setImageUrl] = useState(item.imageUrl || '');
  const [selectedCategories, setSelectedCategories] = useState(
    item.categories || []
  );
  const [availableCategories, setAvailableCategories] = useState([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const [deliveryType, setDeliveryType] = useState(
    item.deliveryType || 'pickup'
  );
  const [pickupLocation, setPickupLocation] = useState(
    item.pickupLocation || ''
  );
  const [donationTarget, setDonationTarget] = useState(
    item.donationTarget || ''
  );
  const [donationAmount, setDonationAmount] = useState(
    item.donationAmount?.toString() || ''
  );

  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch(
        `${config.SERVER_URL}/shops/${user.city._id}/all`
      );
      const data = await res.json();
      if (res.ok) {
        setAvailableCategories(data);
      } else {
        throw new Error(data.error || 'שגיאה בטעינת קטגוריות');
      }
    } catch (err) {
      console.error('שגיאה בטעינת קטגוריות', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

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

  const handleUpdateItem = async () => {
    if (
      !name ||
      !price ||
      !quantity ||
      !deliveryType ||
      (deliveryType === 'pickup' && !pickupLocation) ||
      (deliveryType === 'donation' && (!donationTarget || !donationAmount))
    ) {
      Alert.alert('נא למלא את כל שדות החובה בהתאם לסוג הפריט');
      return;
    }

    setIsLoading(true);

    const updatedItem = {
      name,
      price: Number(price),
      quantity: Number(quantity),
      level: level ? Number(level) : 0,
      description: description || '',
      imageUrl: imageUrl || '',
      categories: selectedCategories.length > 0 ? selectedCategories : ['אחר'],
      deliveryType,
      pickupLocation: deliveryType === 'pickup' ? pickupLocation : '',
      donationTarget: deliveryType === 'donation' ? donationTarget : '',
      donationAmount:
        deliveryType === 'donation' ? Number(donationAmount) : null,
    };

    try {
      const response = await fetch(`${config.SERVER_URL}/shop/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });

      const data = await response.json();

      if (response.ok) {
        setIsLoading(false);
        navigation.goBack();
      } else {
        Alert.alert('שגיאה', data.error || 'עדכון הפריט נכשל');
      }
    } catch (err) {
      console.error('שגיאה:', err.message);
      Alert.alert('שגיאה', 'תקלה בעת שליחה לשרת');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>סוג הפריט *</Text>
      <View style={styles.radioGroup}>
        {['pickup', 'donation'].map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.radioOption}
            onPress={() => setDeliveryType(type)}
          >
            <Text style={styles.radioText}>
              {deliveryType === type ? '🔘' : '⚪'}{' '}
              {type === 'pickup' ? 'איסוף מהחנות' : 'תרומה בשם המשתמש'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {deliveryType === 'donation' && (
        <>
          <Text style={styles.label}>יעד התרומה *</Text>
          <TextInput
            style={styles.input}
            value={donationTarget}
            onChangeText={(text) => {
              setDonationTarget(text);
              if (donationAmount) {
                setName(`תרומה על סך ${donationAmount} ₪ ל-${text}`);
              }
            }}
          />

          <Text style={styles.label}>סכום התרומה (₪) *</Text>
          <TextInput
            style={styles.input}
            value={donationAmount}
            keyboardType="numeric"
            onChangeText={(amount) => {
              setDonationAmount(amount);
              if (donationTarget) {
                setName(`תרומה על סך ${amount} ₪ ל-${donationTarget}`);
              }
            }}
          />
        </>
      )}

      <Text style={styles.label}>שם הפריט *</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>מחיר *</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>כמות במלאי *</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />

      <Text style={styles.label}>רמה נדרשת (אופציונלי)</Text>
      <TextInput
        style={styles.input}
        value={level}
        onChangeText={setLevel}
        keyboardType="numeric"
      />

      <Text style={styles.label}>תיאור (לא חובה)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {deliveryType === 'pickup' && (
        <>
          <Text style={styles.label}>מיקום לאיסוף *</Text>
          <TextInput
            style={styles.input}
            value={pickupLocation}
            onChangeText={setPickupLocation}
            placeholder="שם בית העסק וכתובת מדוייקת"
          />
        </>
      )}

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
        {loadingCategories ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.imageButtonText}>🏷️ בחר קטגוריות</Text>
        )}
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
        <TouchableOpacity style={styles.addButton} onPress={handleUpdateItem}>
          <Text style={styles.addButtonText}>💾 עדכן פריט</Text>
        </TouchableOpacity>
      )}

      <Modal visible={categoryModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>בחר קטגוריות</Text>
            <Pressable
              style={styles.manageLink}
              onPress={() => {
                setCategoryModalVisible(false);
                navigation.navigate('ManageCategoriesScreen', {
                  onCategoriesUpdated: fetchCategories,
                  user,
                });
              }}
            >
              <Text style={styles.manageLinkText}>נהל קטגוריות</Text>
            </Pressable>
            <ScrollView style={{ maxHeight: 300 }}>
              {availableCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
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
  container: { padding: 20 },
  label: { fontSize: 16, marginTop: 12, marginBottom: 5, textAlign: 'right' },
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
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  imageButtonText: {
    fontSize: 16,
    color: '#fff',
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
  checkboxLabel: { flex: 1, textAlign: 'right', paddingRight: 8, fontSize: 16 },
  modalClose: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  manageLink: { alignSelf: 'flex-end', marginBottom: 10 },
  manageLinkText: {
    color: '#2196F3',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  radioGroup: { flexDirection: 'column', marginVertical: 10 },
  radioOption: { paddingVertical: 6 },
  radioText: { fontSize: 16, textAlign: 'right' },
});
