// EditShopItemScreen.js
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
  StatusBar, // Import StatusBar for consistent styling
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import config from '../../config';
import SuccessModal from '../../components/ErrorModal';

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

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
      console.error('שגיאה בטעינת קטגוריות:', err);
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
          headers: { 'Content-Type': 'multipart/form-data' },
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

  const handleUpdateItem = async () => {
    if (
      (deliveryType !== 'donation' && !name.trim()) ||
      !price.trim() ||
      !quantity.trim() ||
      (deliveryType === 'pickup' && !pickupLocation) ||
      (deliveryType === 'donation' &&
        (!donationTarget || !donationAmount.trim()))
    ) {
      Alert.alert('שגיאה', 'אנא מלא את כל שדות החובה בהתאם לסוג הפריט.');
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

    const updatedItem = {
      name: generatedName,
      price: Number(price),
      quantity: Number(quantity),
      level: level ? Number(level) : 0,
      description: description.trim() || '',
      imageUrl: imageUrl || '', // Image is optional
      categories: selectedCategories.length > 0 ? selectedCategories : ['אחר'], // Default to 'כללי' if none selected
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
        setSuccessMessage(`הפריט "${name}" עודכן בהצלחה`);
        setShowSuccess(true);
      } else {
        Alert.alert('שגיאה', data.error || 'עדכון הפריט נכשל.');
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
      <Text style={styles.title}>ערוך פריט בחנות</Text>

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
        placeholder="₪"
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
              onValueChange={(val) => {
                setDonationTarget(val);
                if (donationAmount) {
                  setName(`תרומה על סך ${donationAmount} ₪ ל-${val}`);
                }
              }}
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
            onChangeText={(amount) => {
              setDonationAmount(amount);
              if (donationTarget) {
                setName(`תרומה על סך ${amount} ₪ ל-${donationTarget}`);
              }
            }}
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
      <SuccessModal
        visible={showSuccess}
        title="✅ עדכון הצליח"
        message={successMessage}
        onClose={() => {
          setShowSuccess(false);
          navigation.goBack();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    textShadowColor: 'rgba(0, 0, 0, 0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    color: '#424242',
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
    borderColor: '#D0D0D0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    textAlign: 'right',
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#333333',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  radioGroup: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
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
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexShrink: 1,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4DD0E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioButtonSelected: {
    backgroundColor: '#4DD0E1',
  },
  radioText: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'right',
    flexShrink: 1,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginBottom: 0,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333333',
  },
  pickerItem: {
    textAlign: 'right',
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: '#A0A0A0',
  },
  imageButton: {
    backgroundColor: '#66BB6A', // Green for image button
    padding: 15,
    borderRadius: 12,
    marginTop: 30,
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
    borderRadius: 15,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  noImageText: {
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 15,
    color: '#757575',
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
    backgroundColor: '#66BB6A', // Green for update button
    padding: 18,
    borderRadius: 15,
    marginTop: 30,
    marginBottom: 40,
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 20,
    width: '90%',
    maxHeight: '70%',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  checkboxLabel: {
    flex: 1,
    textAlign: 'right',
    paddingRight: 10,
    fontSize: 17,
    color: '#424242',
  },
  checkboxIcon: {
    fontSize: 22,
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
