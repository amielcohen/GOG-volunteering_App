// AddShopItemScreen.js
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

export default function AddShopItemScreen({ navigation, route }) {
  const { user } = route.params;

  const [deliveryType, setDeliveryType] = useState('pickup');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [level, setLevel] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [donationTarget, setDonationTarget] = useState('');
  const [donationAmount, setDonationAmount] = useState('');

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

  const handleAddItem = async () => {
    if (
      (deliveryType !== 'donation' && !name) ||
      !price ||
      !quantity ||
      (deliveryType === 'pickup' && !pickupLocation) ||
      (deliveryType === 'donation' && (!donationTarget || !donationAmount))
    ) {
      Alert.alert('נא למלא את כל שדות החובה');
      return;
    }

    const generatedName =
      deliveryType === 'donation'
        ? `תרומה על סך ${donationAmount} ₪ ל${donationTarget}`
        : name;

    setIsLoading(true);

    const newItem = {
      name: generatedName,
      price: Number(price),
      quantity: Number(quantity),
      level: level ? Number(level) : 0,
      description: description || '',
      imageUrl: imageUrl || '',
      city: user.city,
      categories: selectedCategories.length > 0 ? selectedCategories : ['אחר'],
      deliveryType,
      pickupLocation: deliveryType === 'pickup' ? pickupLocation : '',
      donationTarget: deliveryType === 'donation' ? donationTarget : '',
      donationAmount:
        deliveryType === 'donation' ? Number(donationAmount) : null,
    };

    try {
      const response = await fetch(`${config.SERVER_URL}/shop/add`, {
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
        setPickupLocation('');
        setDonationTarget('');
        setDonationAmount('');
        setDeliveryType('pickup');
        setIsLoading(false);

        navigation.reset({
          index: 1,
          routes: [
            { name: 'CommunityRepHomeScreen', params: { user } },
            {
              name: 'ShopMenu',
              params: { user, message: `הפריט "${data.name}" נשמר בהצלחה ✅` },
            },
          ],
        });
      } else {
        Alert.alert('שגיאה', data.error || 'שמירת הפריט נכשלה');
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

      {deliveryType !== 'donation' && (
        <>
          <Text style={styles.label}>שם הפריט *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="כדורגל"
          />
        </>
      )}

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

      {deliveryType === 'pickup' && (
        <>
          <Text style={styles.label}>מיקום לאיסוף *</Text>
          <TextInput
            style={styles.input}
            value={pickupLocation}
            onChangeText={setPickupLocation}
            placeholder="שם בית העסק וכתובת מדויקת"
          />
        </>
      )}

      {deliveryType === 'donation' && (
        <>
          <Text style={styles.label}>יעד תרומה *</Text>
          <TextInput
            style={styles.input}
            value={donationTarget}
            onChangeText={setDonationTarget}
            placeholder="שם עמותה או גוף"
          />

          <Text style={styles.label}>סכום התרומה *</Text>
          <TextInput
            style={styles.input}
            value={donationAmount}
            onChangeText={setDonationAmount}
            placeholder="100"
            keyboardType="numeric"
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
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.addButtonText}>➕ הוסף פריט</Text>
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
                  user,
                  onCategoriesUpdated: fetchCategories,
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
  manageLink: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  manageLinkText: {
    color: '#2196F3',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'column',
    marginVertical: 10,
  },
  radioOption: {
    paddingVertical: 6,
  },
  radioText: {
    fontSize: 16,
    textAlign: 'right',
  },
});
