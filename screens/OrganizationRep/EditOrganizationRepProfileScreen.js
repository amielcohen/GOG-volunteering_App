import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // עדיין בייבוא, למרות שאינו בשימוש פעיל
import { uploadImageToCloudinary } from '../../utils/cloudinary'; // עדיין בייבוא
import config from '../../config';
import ErrorModal from '../../components/ErrorModal';
import axios from 'axios';

export default function EditOrganizationRepProfileScreen({
  route,
  navigation,
}) {
  const { user, organization } = route.params || {};

  // מצבים לשדות של נציג העמותה
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [username, setUsername] = useState(user.username || '');
  const [password, setPassword] = useState('');

  // מצבים לשדות של העמותה העירונית
  const [cityOrgId, setCityOrgId] = useState(null);
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [orgNameDisplay, setOrgNameDisplay] = useState(''); // יוצג משם העמותה העירונית
  const [imageUrlDisplay, setImageUrlDisplay] = useState(''); // יוצג מתמונת העמותה העירונית

  const [isLoading, setIsLoading] = useState(true);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState({ title: '', message: '' });

  const handleError = (title, message) => {
    setErrorText({ title, message });
    setErrorVisible(true);
  };

  useEffect(() => {
    const fetchCityOrganizationData = async () => {
      if (!user || !organization?._id || !user.city?._id) {
        handleError('שגיאה', 'נתוני משתמש או עמותה חסרים.');
        setIsLoading(false);
        return;
      }

      const orgId =
        typeof organization._id === 'object'
          ? organization._id.$oid
          : organization._id;
      const cityId =
        typeof user.city._id === 'object' ? user.city._id.$oid : user.city._id;

      console.log('Fetching city organization with:', {
        organizationId: orgId,
        cityId: cityId,
      });

      try {
        const response = await axios.get(
          `${config.SERVER_URL}/cityOrganizations/by-org-and-city`,
          {
            params: { organizationId: orgId, cityId: cityId },
          }
        );

        const cityOrgData = response.data;
        console.log('City Organization Data:', cityOrgData);

        // שמור את ה-ID של העמותה העירונית
        setCityOrgId(cityOrgData._id.$oid || cityOrgData._id);

        // **עדכון קריטי כאן:**
        // הצג את הפרטים של העמותה העירונית (שם ותמונה)
        setOrgNameDisplay(cityOrgData.name || '');
        setImageUrlDisplay(cityOrgData.imageUrl || '');

        // עדכן את המצבים הניתנים לעריכה
        setContactEmail(cityOrgData.contactEmail || '');
        setPhone(cityOrgData.phone || '');
      } catch (err) {
        console.error('Error fetching city organization data:', err);
        handleError(
          'שגיאה בטעינה',
          err.response?.data?.message ||
            'לא ניתן לטעון את פרטי העמותה העירונית.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCityOrganizationData();
  }, [user, organization]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !username.trim()) {
      handleError('שגיאה', 'אנא מלא את כל שדות חובה אישיים.');
      return;
    }
    if (!contactEmail.trim() || !phone.trim()) {
      handleError('שגיאה', 'אנא מלא את כל שדות חובה של העמותה.');
      return;
    }

    if (password && password.length < 6) {
      handleError('שגיאה', 'הסיסמה חייבת להכיל לפחות 6 תווים.');
      return;
    }

    if (!cityOrgId) {
      handleError('שגיאה', 'אין מזהה עמותה עירונית לעדכון.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. עדכון פרטי נציג העמותה (המשתמש)
      const userRes = await fetch(`${config.SERVER_URL}/auth/updateProfile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: user._id,
          username: username.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password: password.trim() || undefined,
        }),
      });

      const userRaw = await userRes.text();
      console.log('User Update Response (RAW):', userRaw);
      const userData = JSON.parse(userRaw);
      if (!userRes.ok) {
        throw new Error(userData.message || 'שגיאה בעדכון פרטי המשתמש.');
      }

      // 2. עדכון פרטי העמותה העירונית
      const orgRes = await fetch(
        `${config.SERVER_URL}/cityOrganizations/${cityOrgId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactEmail: contactEmail.trim(),
            phone: phone.trim(),
          }),
        }
      );

      const orgRaw = await orgRes.text();
      console.log('City Organization Update Response (RAW):', orgRaw);
      const orgData = JSON.parse(orgRaw);

      if (!orgRes.ok) {
        throw new Error(
          orgData.message || 'שגיאה בעדכון פרטי העמותה העירונית.'
        );
      }

      handleError('הצלחה', 'הפרטים עודכנו בהצלחה!');
      navigation.goBack();
    } catch (err) {
      console.error('General Error during save:', err);
      handleError(
        'שגיאה',
        err.message || 'אירעה שגיאה כללית בעת שמירת הנתונים.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loadingText}>טוען נתוני עמותה...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>עריכת פרטי אחראי עמותה</Text>

        {/* תצוגת תמונת העמותה ושם העמותה העירונית (לא ניתנים לעריכה כאן) */}
        <View style={styles.imageDisplayContainer}>
          {imageUrlDisplay ? (
            <Image
              source={{ uri: imageUrlDisplay }}
              style={styles.imagePreview}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🖼️</Text>
            </View>
          )}
          <Text style={styles.imageDisplayName}>{orgNameDisplay}</Text>
          <Text style={styles.imageDisplaySubText}>
            (שם ותמונת העמותה מוצגים מהעמותה העירונית)
          </Text>
        </View>

        <Text style={styles.sectionTitle}>פרטים אישיים</Text>
        <TextInput
          style={styles.input}
          placeholder="שם פרטי"
          value={firstName}
          onChangeText={setFirstName}
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="שם משפחה"
          value={lastName}
          onChangeText={setLastName}
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="שם משתמש"
          value={username}
          onChangeText={setUsername}
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="סיסמה חדשה (לא חובה)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          textAlign="right"
        />

        <Text style={styles.sectionTitle}>פרטי קשר של העמותה העירונית</Text>
        <TextInput
          style={styles.input}
          placeholder="אימייל ליצירת קשר"
          value={contactEmail}
          onChangeText={setContactEmail}
          keyboardType="email-address"
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="טלפון ליצירת קשר"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          textAlign="right"
        />

        {/* כפתור שמירה */}
        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>שמור שינויים</Text>
          )}
        </Pressable>

        {/* מודל שגיאה/הצלחה */}
        <ErrorModal
          visible={errorVisible}
          title={errorText.title}
          message={errorText.message}
          onClose={() => setErrorVisible(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F8F8F8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 15,
    marginTop: 25,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 18,
    textAlign: 'right',
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  imageDisplayContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EBF5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePlaceholderText: { fontSize: 40, color: '#3F51B5', fontWeight: 'bold' },
  imagePreview: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  imageDisplayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  imageDisplaySubText: { fontSize: 14, color: '#777', textAlign: 'center' },
  saveButton: {
    backgroundColor: '#BBDEFB',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: { color: '#1A237E', fontWeight: 'bold', fontSize: 18 },
});
