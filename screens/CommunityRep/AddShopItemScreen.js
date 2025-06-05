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
  StatusBar,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
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
  const [availableDonationTargets, setAvailableDonationTargets] = useState([]);
  const [availablePickupLocations, setAvailablePickupLocations] = useState([]);
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
      Alert.alert('שגיאה', 'לא ניתן לטעון קטגוריות. אנא נסה שוב.');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    const fetchDonationTargets = async () => {
      try {
        const res = await fetch(
          `${config.SERVER_URL}/donation-organizations/by-city/${user.city._id}`
        );
        const data = await res.json();
        if (res.ok) setAvailableDonationTargets(data);
      } catch (err) {
        console.error('שגיאה בטעינת עמותות:', err);
        Alert.alert('שגיאה', 'לא ניתן לטעון עמותות. אנא נסה שוב.');
      }
    };

    const fetchPickupLocations = async () => {
      try {
        const res = await fetch(
          `${config.SERVER_URL}/business-partners/by-city/${user.city._id}`
        );
        const data = await res.json();
        if (res.ok) setAvailablePickupLocations(data);
      } catch (err) {
        console.error('שגיאה בטעינת עסקים:', err);
        Alert.alert('שגיאה', 'לא ניתן לטעון עסקים. אנא נסה שוב.');
      }
    };

    fetchDonationTargets();
    fetchPickupLocations();
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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'הרשאת מצלמה נדחתה',
        'יש לאפשר גישה לגלריית התמונות כדי לבחור תמונה.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uploadedUrl = await uploadImageToCloudinary(result.assets[0].uri);
      if (uploadedUrl) setImageUrl(uploadedUrl);
      else Alert.alert('שגיאה', 'העלאת התמונה נכשלה. אנא נסה שוב.');
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
        console.error('Cloudinary upload error:', data.error.message);
        return null;
      }
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      return null;
    }
  };

  const handleAddItem = async () => {
    if (
      (deliveryType !== 'donation' && !name.trim()) ||
      !price.trim() ||
      !quantity.trim() ||
      (deliveryType === 'pickup' && !pickupLocation) ||
      (deliveryType === 'donation' &&
        (!donationTarget || !donationAmount.trim()))
    ) {
      Alert.alert('שגיאה', 'אנא מלא את כל שדות החובה.');
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('שגיאה', 'מחיר חייב להיות מספר חיובי.');
      return;
    }
    if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      Alert.alert('שגיאה', 'כמות במלאי חייבת להיות מספר חיובי.');
      return;
    }
    if (level.trim() !== '' && (isNaN(Number(level)) || Number(level) < 0)) {
      Alert.alert('שגיאה', 'רמה נדרשת חייבת להיות מספר חיובי או ריק.');
      return;
    }
    if (
      deliveryType === 'donation' &&
      (isNaN(Number(donationAmount)) || Number(donationAmount) <= 0)
    ) {
      Alert.alert('שגיאה', 'סכום התרומה חייב להיות מספר חיובי.');
      return;
    }

    const generatedName =
      deliveryType === 'donation'
        ? `תרומה על סך ${donationAmount} ₪ ל-${donationTarget}`
        : name.trim();

    setIsLoading(true);

    const newItem = {
      name: generatedName,
      price: Number(price),
      quantity: Number(quantity),
      level: level ? Number(level) : 0,
      description: description.trim() || '',
      imageUrl: imageUrl || '', // Now imageUrl is optional
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
        Alert.alert('שגיאה', data.error || 'שמירת הפריט נכשלה.');
      }
    } catch (err) {
      console.error('שגיאה:', err.message);
      Alert.alert('שגיאה', 'תקלה בעת שליחה לשרת. אנא ודא שאתה מחובר לאינטרנט.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={styles.container.backgroundColor}
      />
      <Text style={styles.title}>הוסף פריט חדש לחנות</Text>

      <Text style={styles.label}>
        סוג הפריט <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.radioGroup}>
        {['pickup', 'donation'].map((type) => (
          <TouchableOpacity
            key={type}
            style={styles.radioOption}
            onPress={() => setDeliveryType(type)}
          >
            <View
              style={[
                styles.radioButton,
                deliveryType === type && styles.radioButtonSelected,
              ]}
            />
            <Text style={styles.radioText}>
              {type === 'pickup' ? 'איסוף מבית עסק' : 'תרומה בשם המשתמש'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {deliveryType !== 'donation' && (
        <>
          <Text style={styles.label}>
            שם הפריט <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="לדוגמה: כדורגל, ספר לימוד, חולצה"
            placeholderTextColor="#A0A0A0"
          />
        </>
      )}

      <Text style={styles.label}>
        מחיר <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholderTextColor="#A0A0A0"
      />

      <Text style={styles.label}>
        כמות במלאי <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        placeholder="מספר פריטים זמינים"
        placeholderTextColor="#A0A0A0"
      />

      <Text style={styles.label}>רמה נדרשת (אופציונלי)</Text>
      <TextInput
        style={styles.input}
        value={level}
        onChangeText={setLevel}
        keyboardType="numeric"
        placeholder="לדוגמה: 1-20"
        placeholderTextColor="#A0A0A0"
      />

      <Text style={styles.label}>תיאור מפורט (לא חובה)</Text>
      <TextInput
        style={[
          styles.input,
          { height: 100, textAlignVertical: 'top', paddingVertical: 12 },
        ]}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="תיאור מפורט של הפריט, מצבו, גודלו וכו׳"
        placeholderTextColor="#A0A0A0"
      />

      {deliveryType === 'donation' && (
        <>
          <Text style={styles.label}>
            בחר עמותה <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={donationTarget}
              onValueChange={(val) => setDonationTarget(val)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item
                label="בחר עמותה"
                value=""
                enabled={false}
                style={styles.pickerPlaceholder}
              />
              {availableDonationTargets.map((org) => (
                <Picker.Item key={org._id} label={org.name} value={org.name} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>
            סכום התרומה <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={donationAmount}
            onChangeText={setDonationAmount}
            keyboardType="numeric"
            placeholder="₪"
            placeholderTextColor="#A0A0A0"
          />
        </>
      )}

      {deliveryType === 'pickup' && (
        <>
          <Text style={styles.label}>
            בחר מיקום לאיסוף <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={pickupLocation}
              onValueChange={(val) => setPickupLocation(val)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item
                label="בחר מיקום איסוף"
                value=""
                enabled={false}
                style={styles.pickerPlaceholder}
              />
              {availablePickupLocations.map((loc) => (
                <Picker.Item
                  key={loc._id}
                  label={loc.locationDescription}
                  value={loc.locationDescription}
                />
              ))}
            </Picker>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>📷 בחר תמונה (אופציונלי)</Text>
      </TouchableOpacity>

      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.previewImage} />
      ) : (
        <Text style={styles.noImageText}>לא נבחרה תמונה.</Text>
      )}

      <TouchableOpacity
        style={styles.categoryButton}
        onPress={() => setCategoryModalVisible(true)}
      >
        {loadingCategories ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.categoryButtonText}>🏷️ בחר קטגוריות</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.selectedCategoriesText}>
        {selectedCategories.length > 0
          ? `נבחרו: ${selectedCategories.join(', ')}`
          : 'לא נבחרו קטגוריות. יוגדר כ"אחר".'}
      </Text>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#66BB6A"
          style={{ marginTop: 30 }}
        />
      ) : (
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Text style={styles.addButtonText}>➕ הוסף פריט לחנות</Text>
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

            <ScrollView style={styles.modalScrollView}>
              {availableCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={styles.checkboxRow}
                  onPress={() => toggleCategory(cat.name)}
                >
                  <Text style={styles.checkboxLabel}>{cat.name}</Text>
                  <Text style={styles.checkboxIcon}>
                    {selectedCategories.includes(cat.name) ? '✅' : '⬜'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Allows content to scroll
    padding: 25,
    backgroundColor: '#E8F5E9', // Lightest green background
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333', // Dark gray for better readability
    textAlign: 'center',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.05)', // Very subtle shadow
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#424242', // Slightly lighter dark gray
    marginTop: 18,
    marginBottom: 8,
    textAlign: 'right',
  },
  required: {
    color: '#EF5350', // Red for required asterisk
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D0D0', // Light gray border
    borderRadius: 10, // More rounded corners
    paddingHorizontal: 15,
    paddingVertical: 12,
    textAlign: 'right',
    backgroundColor: '#FFFFFF', // White background
    fontSize: 16,
    color: '#333333',
    shadowColor: 'rgba(0, 0, 0, 0.05)', // Subtle shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  radioGroup: {
    flexDirection: 'row-reverse', // Align radio options right
    justifyContent: 'space-around', // Distribute space
    marginVertical: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  radioOption: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 10, // Reduced padding horizontally
    paddingVertical: 8,
    flexShrink: 1, // Allow text to shrink if needed
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4DD0E1', // Light blue border for radio
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8, // Reduced margin
  },
  radioButtonSelected: {
    backgroundColor: '#4DD0E1', // Light blue when selected
  },
  radioText: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'right',
    flexShrink: 1, // Allow text to wrap if it's too long
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 0, // No extra margin as label has margin
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  picker: {
    height: 50, // Standard height for picker
    width: '100%',
    color: '#333333',
  },
  pickerItem: {
    textAlign: 'right',
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: '#A0A0A0', // Placeholder color for picker
  },
  imageButton: {
    backgroundColor: '#66BB6A', // Green for image button
    padding: 15,
    borderRadius: 12, // More rounded
    marginTop: 30, // More space
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  imageButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginVertical: 20,
    borderRadius: 15, // Large rounded corners
    resizeMode: 'cover', // Ensures image covers area
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  noImageText: {
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 15,
    color: '#757575', // Gray for informative text
    fontStyle: 'italic',
  },
  categoryButton: {
    backgroundColor: '#4DD0E1', // Light blue for category button
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  categoryButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedCategoriesText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 15,
    color: '#424242',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#66BB6A', // Green for add button
    padding: 18,
    borderRadius: 15, // Very rounded
    marginTop: 30,
    marginBottom: 40, // Space at bottom
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)', // Darker overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#FFFFFF', // White modal background
    padding: 25,
    borderRadius: 20, // More rounded
    width: '90%', // Slightly wider
    maxHeight: '70%', // Limit height for scroll
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    textAlign: 'center',
  },
  manageLink: {
    alignSelf: 'flex-end',
    marginBottom: 15,
  },
  manageLinkText: {
    color: '#4DD0E1', // Light blue for link
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  modalScrollView: {
    maxHeight: 300,
    marginBottom: 15,
  },
  checkboxRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12, // More padding
    borderBottomWidth: 1,
    borderColor: '#EEEEEE', // Lighter border
  },
  checkboxLabel: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 10,
    fontSize: 17,
    color: '#424242',
  },
  checkboxIcon: {
    fontSize: 22, // Larger icon
  },
  modalCloseButton: {
    backgroundColor: '#66BB6A', // Green close button
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
