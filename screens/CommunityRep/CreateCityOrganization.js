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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import config from '../../config';
import HelpModal from '../../components/HelpModal';
import { uploadImageToCloudinary } from '../../utils/cloudinary';
import OptionsModal from '../../components/OptionsModal';
import ErrorModal from '../../components/ErrorModal';
import axios from 'axios';

export default function CreateCityOrganizationScreen({ route, navigation }) {
  const { user, cityName } = route.params;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState(null);
  const [maxReward, setMaxReward] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newCityOrganizationId, setNewCityOrganizationId] = useState(null);

  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState({ title: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [helpVisible, setHelpVisible] = useState(false);
  const openHelp = () => setHelpVisible(true);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'הרשאה נדרשת',
        'יש לאפשר גישה לגלריית התמונות כדי להעלות תמונה.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setUploadingImage(true);
      try {
        const uploadedImageUrl = await uploadImageToCloudinary(
          result.assets[0].uri
        );
        if (uploadedImageUrl) {
          setImage(uploadedImageUrl);
        } else {
          setErrorText({
            title: 'שגיאה',
            message: 'העלאת התמונה נכשלה. אנא נסה שוב.',
          });
          setErrorVisible(true);
        }
      } catch (err) {
        console.error('שגיאה בהעלאת תמונה:', err);
        setErrorText({
          title: 'שגיאה',
          message: 'אירעה שגיאה בהעלאת התמונה. אנא נסה שוב.',
        });
        setErrorVisible(true);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (isSubmitting) return;

    if (!name.trim() || !type || !maxReward.trim()) {
      setErrorText({
        title: 'שדות חובה חסרים',
        message: 'אנא מלא את כל השדות המסומנים כחובה (שם, סוג, סכום תגמול).',
      });
      setErrorVisible(true);
      return;
    }
    if (isNaN(Number(maxReward)) || Number(maxReward) <= 0) {
      setErrorText({
        title: 'תגמול מקסימלי שגוי',
        message: 'אנא הזן סכום תגמול מקסימלי חוקי (מספר חיובי).',
      });
      setErrorVisible(true);
      return;
    }

    setIsSubmitting(true);

    let finalImageUrl = image;
    if (image && !image.startsWith('http')) {
      try {
        finalImageUrl = await uploadImageToCloudinary(image);
        if (!finalImageUrl) {
          setErrorText({
            title: 'שגיאה',
            message: 'העלאת התמונה נכשלה לפני יצירת העמותה.',
          });
          setErrorVisible(true);
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        console.error('שגיאה בהעלאת תמונה לפני שליחה:', error);
        setErrorText({
          title: 'שגיאה',
          message: 'אירעה שגיאה קריטית בהעלאת התמונה.',
        });
        setErrorVisible(true);
        setIsSubmitting(false);
        return;
      }
    }

    const newOrganization = {
      name: `${name.trim()} (${cityName})`,
      description,
      type,
      contactEmail: email,
      phone,
      imageUrl: finalImageUrl,
      isGlobal: false,
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
        const organizationId = data._id;
        setNewCityOrganizationId(organizationId);

        try {
          await axios.post(`${config.SERVER_URL}/cityOrganizations/link`, {
            organizationId: organizationId,
            city: user.city,
            addedBy: user._id,
            maxRewardPerVolunteering: Number(maxReward),
          });
          setModalVisible(true);
        } catch (error) {
          console.error('שגיאה בקישור עמותה לעיר:', error);
          const errorMessage =
            error.response?.data?.message || 'לא ניתן לקשר את העמותה לעיר.';
          setErrorText({
            title: 'שגיאת קישור',
            message: errorMessage,
          });
          setErrorVisible(true);
        }
      } else {
        const errorMessage = data.message || 'שגיאה בהוספת עמותה חדשה.';
        setErrorText({
          title: 'שגיאת יצירה',
          message: errorMessage,
        });
        setErrorVisible(true);
      }
    } catch (error) {
      console.error('שגיאה כללית בשמירת עמותה:', error);
      setErrorText({
        title: 'שגיאה כללית',
        message: 'שגיאה בחיבור לשרת או בתהליך יצירת העמותה.',
      });
      setErrorVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>הוספת עמותה עירונית</Text>

          <Text style={styles.label}>שם העמותה: *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="הכנס שם עמותה"
            placeholderTextColor="#999"
            textAlign="right"
          />

          <Text style={styles.label}>תיאור:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="תיאור קצר על פעילות העמותה"
            placeholderTextColor="#999"
            textAlign="right"
            textAlignVertical="top"
          />

          <Text style={styles.label}>סוג עמותה: *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={type}
              onValueChange={(itemValue) => setType(itemValue)}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item
                label="בחר סוג עמותה"
                value=""
                style={{ color: '#999' }}
              />
              <Picker.Item label="עמותה" value="עמותה" />
              <Picker.Item label="בית אבות" value="בית אבות" />
              <Picker.Item label="בית ספר" value="בית ספר" />
              <Picker.Item label="אחר" value="אחר" />
            </Picker>
          </View>

          <Text style={styles.label}>אימייל ליצירת קשר:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="example@example.com"
            placeholderTextColor="#999"
            textAlign="right"
          />

          <Text style={styles.label}>טלפון ליצירת קשר:</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="05X-XXXXXXX"
            placeholderTextColor="#999"
            textAlign="right"
          />

          <View style={styles.row}>
            <Text style={styles.label}>
              הגדר סכום מטבעות מקסימלי להתנדבות: *
            </Text>
            <TouchableOpacity onPress={openHelp} style={styles.helpIcon}>
              <Ionicons name="help-circle-outline" size={20} color="#555" />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={maxReward}
            onChangeText={setMaxReward}
            keyboardType="numeric"
            placeholder="לדוגמה: 50"
            placeholderTextColor="#999"
            textAlign="right"
          />

          <TouchableOpacity
            style={styles.imagePicker}
            onPress={pickImage}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.imagePickerText}>בחר תמונת לוגו</Text>
            )}
          </TouchableOpacity>

          {image && !uploadingImage && (
            <Image source={{ uri: image }} style={styles.image} />
          )}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>הוסף עמותה</Text>
            )}
          </TouchableOpacity>

          <HelpModal
            visible={helpVisible}
            onClose={() => setHelpVisible(false)}
            title="מהו תגמול מקסימלי?"
            message="הגדר את כמות המטבעות המרבית שניתן להעניק עבור התנדבות בודדת במסגרת עמותה זו בעיר. זה עוזר לוודא שהתגמול הולם את הפעילות ולא גבוה מדי."
          />

          <OptionsModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            title="קישור עמותה הושלם"
            subtitle="העמותה העירונית נוצרה וקושרו בהצלחה! האם תרצה ליצור אחראי עמותה לעיר? ניתן גם להוסיף אחראי בהמשך."
            buttons={[
              {
                label: 'צור אחראי עמותה',
                color: '#2196F3',
                onPress: () => {
                  setModalVisible(false);
                  navigation.reset({
                    index: 1,
                    routes: [
                      { name: 'CommunityRepHomeScreen', params: { user } },
                      {
                        name: 'CreateOrganizationRepScreen',
                        params: {
                          cityName,
                          user,
                          organizationName: name,
                          organizationId: newCityOrganizationId,
                        },
                      },
                    ],
                  });
                },
              },
              {
                label: 'אולי אחר כך',
                color: '#FF9800',
                onPress: () => {
                  setModalVisible(false);
                  navigation.reset({
                    index: 1,
                    routes: [
                      { name: 'CommunityRepHomeScreen', params: { user } },
                      {
                        name: 'OrganizationManagerScreen',
                        params: { user, cityName },
                      },
                    ],
                  });
                },
              },
            ]}
          />
          <ErrorModal
            visible={errorVisible}
            title={errorText.title}
            message={errorText.message}
            onClose={() => setErrorVisible(false)}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#F7F9FC',
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'right',
    color: '#555',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D7DE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D0D7DE',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  pickerItem: {
    textAlign: 'right',
    color: '#333',
    fontSize: 16,
  },
  imagePicker: {
    backgroundColor: '#5C6BC0',
    padding: 14,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
    resizeMode: 'cover',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  helpIcon: {
    marginLeft: 8,
    marginTop: 2,
  },
});
