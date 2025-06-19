import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import config from '../../config';
import { uploadImageToCloudinary } from '../../utils/cloudinary';
import ErrorModal from '../../components/ErrorModal'; // ודא שרכיב זה קיים

export default function GlobalOrganizationDetailsScreen({ route }) {
  const { organizationId } = route.params;

  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    title: '',
    message: '',
    btnColor: '#5C6BC0', // צבע כפתור ברירת מחדל (כחול רגוע)
  });

  useFocusEffect(
    useCallback(() => {
      const fetchOrganization = async () => {
        setLoading(true);
        try {
          const res = await axios.get(
            `${config.SERVER_URL}/organizations/${organizationId}`
          );
          const org = res.data;
          setOrganization(org);
          setName(org.name || '');
          setDescription(org.description || '');
          setContactEmail(org.contactEmail || '');
          setPhone(org.phone || '');
          setImageUrl(org.imageUrl || '');
        } catch (err) {
          console.error('שגיאה בשליפת פרטי עמותה:', err);
          setModalInfo({
            title: 'שגיאה',
            message: 'לא ניתן לטעון את פרטי העמותה. נסה שוב מאוחר יותר.',
            btnColor: '#EF5350', // אדום לשגיאה
          });
          setModalVisible(true);
        } finally {
          setLoading(false);
        }
      };

      fetchOrganization();
    }, [organizationId])
  );

  const handleSave = async () => {
    setSaving(true);
    Keyboard.dismiss(); // סגור מקלדת בלחיצת שמור
    try {
      await axios.put(`${config.SERVER_URL}/organizations/${organizationId}`, {
        name,
        description,
        contactEmail,
        phone,
        imageUrl,
      });
      setModalInfo({
        title: 'הצלחה',
        message: 'העמותה עודכנה בהצלחה!',
        btnColor: '#66BB6A', // ירוק להצלחה
      });
    } catch (err) {
      console.error('שגיאה בעדכון:', err);
      setModalInfo({
        title: 'שגיאה',
        message: 'אירעה שגיאה בעדכון הפרטים. אנא נסה שוב.',
        btnColor: '#EF5350', // אדום לשגיאה
      });
    } finally {
      setModalVisible(true);
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setModalInfo({
        title: 'הרשאה נדרשת',
        message: 'יש לאפשר גישה לגלריית התמונות כדי להעלות תמונה.',
        btnColor: '#FFD54F', // כתום לאזהרה
      });
      setModalVisible(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
      aspect: [4, 3], // שמירה על יחס גובה-רוחב
    });

    if (!result.canceled && result.assets?.length > 0) {
      setUploadingImage(true);
      try {
        const uploaded = await uploadImageToCloudinary(result.assets[0].uri);
        if (uploaded) {
          setImageUrl(uploaded);
          setModalInfo({
            title: 'העלאה הסתיימה',
            message: 'התמונה הועלתה בהצלחה.',
            btnColor: '#66BB6A',
          });
          setModalVisible(true);
        } else {
          setModalInfo({
            title: 'שגיאה',
            message: 'אירעה שגיאה בהעלאת התמונה. אנא נסה שוב.',
            btnColor: '#EF5350',
          });
          setModalVisible(true);
        }
      } catch (err) {
        console.error('שגיאה בהעלאת תמונה:', err);
        setModalInfo({
          title: 'שגיאה',
          message: 'אירעה שגיאה בהעלאת התמונה. אנא נסה שוב.',
          btnColor: '#EF5350',
        });
        setModalVisible(true);
      } finally {
        setUploadingImage(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#5C6BC0" />
        <Text style={styles.loadingText}>טוען פרטי עמותה...</Text>
      </View>
    );
  }

  if (!organization) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>שגיאה: לא נמצאה עמותה.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F2F5F8" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scrollViewStyle}
          contentContainerStyle={styles.scrollViewContentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* סעיף תמונת עמותה */}
          <View style={styles.imageSection}>
            <TouchableOpacity
              onPress={pickImage}
              disabled={uploadingImage}
              style={styles.imageUploadArea}
            >
              <Image
                source={{
                  uri:
                    imageUrl ||
                    'https://via.placeholder.com/300x200/CFD8DC/607D8B?text=הוסף+תמונה',
                }}
                style={styles.image}
              />
              {uploadingImage ? (
                <View style={styles.imageOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.imageOverlayText}>מעלה תמונה...</Text>
                </View>
              ) : (
                // וודא ש-imageLabel ממורכז כמו שצריך
                <Text style={styles.imageLabel}>לחץ להחלפת תמונה</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* סעיף פרטי עמותה */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionHeading}>פרטי עמותה</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>שם עמותה:</Text>
              <TextInput
                style={styles.input}
                placeholder="הכנס שם עמותה"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>תיאור:</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                placeholder="הכנס תיאור מפורט על פעילות העמותה"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>אימייל ליצירת קשר:</Text>
              <TextInput
                style={styles.input}
                placeholder="example@example.com"
                value={contactEmail}
                onChangeText={setContactEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>טלפון:</Text>
              <TextInput
                style={styles.input}
                placeholder="05X-XXXXXXX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>שמור שינויים</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* סעיף ערים מקושרות */}
          <View style={styles.linkedCitiesSection}>
            <Text style={styles.sectionHeading}>ערים מקושרות</Text>
            <View style={styles.cityTagsContainer}>
              {organization.linkedCities?.length > 0 ? (
                organization.linkedCities.map((city) => (
                  <View key={city._id} style={styles.cityTag}>
                    <Text style={styles.cityTagName}>{city.name}</Text>
                  </View>
                ))
              ) : (
                // וודא ש-noCitiesText מיושר לימין
                <Text style={styles.noCitiesText}>
                  אין ערים מקושרות לעמותה זו.
                </Text>
              )}
            </View>
          </View>

          {/* סעיף ערים פעילות */}
          <View style={styles.activeCitiesSection}>
            <Text style={styles.sectionHeading}>ערים פעילות</Text>
            <View style={styles.cityTagsContainer}>
              {organization.activeCities?.length > 0 ? (
                organization.activeCities.map((city) => (
                  <View key={city._id} style={styles.cityTag}>
                    <Text style={styles.cityTagName}>{city.name}</Text>
                  </View>
                ))
              ) : (
                // וודא ש-noCitiesText מיושר לימין
                <Text style={styles.noCitiesText}>
                  אין ערים פעילות לעמותה זו.
                </Text>
              )}
            </View>
          </View>

          {/* מודל שגיאות */}
          <ErrorModal
            visible={modalVisible}
            title={modalInfo.title}
            message={modalInfo.message}
            btnColor={modalInfo.btnColor}
            onClose={() => setModalVisible(false)}
          />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#F2F5F8',
  },
  scrollViewStyle: {
    flex: 1,
  },
  scrollViewContentContainer: {
    padding: 20,
    paddingBottom: 40,
    // direction: 'rtl', // כבר לא נחוץ כאן אם מטפלים ב-textAlign בכל אלמנט
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F5F8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center', // יישור למרכז לטקסט טעינה
  },
  errorText: {
    fontSize: 16,
    color: '#EF5350',
    textAlign: 'center', // יישור למרכז לטקסט שגיאה כללי
  },
  // סעיף תמונת עמותה
  imageSection: {
    marginBottom: 25,
    alignItems: 'center',
  },
  imageUploadArea: {
    width: '100%',
    height: 200,
    backgroundColor: '#E8EBF0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 12,
  },
  imageLabel: {
    position: 'absolute',
    bottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 25,
    fontSize: 15,
    fontWeight: '600',
    alignSelf: 'center', // חשוב מאוד כדי למרכז את ה-Text בתוך ה-TouchableOpacity
    textAlign: 'center', // וודא שהטקסט בתוך ה-Text מיושר למרכז
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    marginTop: 8,
    fontSize: 16,
    textAlign: 'center',
  },

  // סעיף פרטי עמותה (כולל שדות קלט וכפתור שמירה)
  detailsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionHeading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textAlign: 'right', // **ודא יישור לימין**
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444444',
    marginBottom: 8,
    textAlign: 'right', // **ודא יישור לימין**
  },
  input: {
    borderWidth: 1,
    borderColor: '#D0D7DE',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#333333',
    textAlign: 'right', // **ודא יישור לימין עבור קלט הטקסט**
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#5C6BC0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#5C6BC0',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center', // **ודא יישור למרכז לטקסט הכפתור**
  },

  // סעיפי ערים מקושרות/פעילות
  linkedCitiesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  activeCitiesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  cityTagsContainer: {
    flexDirection: 'row-reverse', // **ארגון התגים מימין לשמאל**
    flexWrap: 'wrap',
    gap: 8, // רווח בין תגים (או השתמש ב-margin ימני ושמאלי שלילי על הקונטיינר + margin על התגים)
  },
  cityTag: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#90CAF9',
    // marginHorizontal: 4, // אם אין תמיכה ב-gap
    marginBottom: 8, // רווח שורות בין תגים
  },
  cityTagName: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    textAlign: 'right', // **ודא יישור לימין לטקסט התג**
  },
  noCitiesText: {
    fontSize: 15,
    color: '#777777',
    textAlign: 'right', // **ודא יישור לימין**
    marginTop: 5,
  },
});
