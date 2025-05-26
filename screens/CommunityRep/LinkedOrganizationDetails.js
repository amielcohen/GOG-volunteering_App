// LinkedOrganizationDetails.js
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
  Switch,
  Button,
  I18nManager,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import config from '../../config';
import theColor from '../../constants/theColor';
import { uploadImageToCloudinary } from '../../utils/cloudinary';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

I18nManager.forceRTL(true);

const LinkedOrganizationDetails = ({ route }) => {
  const { organization, user } = route.params;
  const navigation = useNavigation();

  const [mainorganization, setMainOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGlobal, setIsGlobal] = useState(true);
  const [isLocalOnly, setIsLocalOnly] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);

  // הסרת סוגריים מהשם להצגה
  const originalName = organization.name.replace(/\s*\([^)]*\)\s*$/, '');
  const [name, setName] = useState(originalName);
  const [description, setDescription] = useState(
    organization.description || ''
  );
  const [contactEmail, setContactEmail] = useState(
    organization.contactEmail || ''
  );
  const [phone, setPhone] = useState(organization.phone || '');
  const [type, setType] = useState(organization.type || '');
  const [maxAmount, setMaxAmount] = useState(
    organization.maxRewardPerVolunteering || 0
  );
  const [imageUrl, setImageUrl] = useState(organization.imageUrl || '');

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await fetch(
          `${config.SERVER_URL}/organizations/${organization.organizationId}`
        );
        const data = await response.json();
        setMainOrganization(data);
        setIsLocalOnly(data.isLocalOnly || false);
      } catch (error) {
        console.error('שגיאה בשליפת עמותה:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrganization();
  }, [organization]);

  useEffect(() => {
    if (mainorganization) {
      setIsGlobal(mainorganization.isGlobal);
    }
  }, [mainorganization]);

  const handleSave = async () => {
    const city = organization.cityName || '';
    let finalName = name;

    if (!isGlobal && !name.includes('(')) {
      finalName = `${name.trim()} (${city})`;
    }

    const payload = {};

    if (!isGlobal) {
      payload.name = finalName;
      payload.description = description;
      payload.contactEmail = contactEmail;
      payload.phone = phone;
      payload.imageUrl = imageUrl;
      payload.type = type;
    } else {
      payload.isLocalOnly = isLocalOnly;
    }

    payload.maxRewardPerVolunteering = maxAmount;

    try {
      const response = await fetch(
        `${config.SERVER_URL}/cityOrganizations/${organization._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('שגיאה:', error);
        alert('שגיאה בעדכון העמותה: ' + error.message);
        return;
      }

      const updated = await response.json();
      alert('העמותה עודכנה בהצלחה!');
      console.log('✅ עמותה עודכנה:', updated);
    } catch (err) {
      console.error('❌ שגיאה בשמירה:', err);
      alert('שגיאה כללית בעדכון העמותה');
    }
  };

  const handleImageUpload = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('נדרש אישור לגשת לגלריה.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const uploadedUrl = await uploadImageToCloudinary(result.assets[0].uri);
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
        setImageUploaded(true);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>טוען נתוני עמותה...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />

      {!isGlobal && (
        <TouchableOpacity
          onPress={handleImageUpload}
          style={styles.uploadButton}
        >
          <Text style={styles.uploadButtonText}>העלה תמונה חדשה</Text>
          {imageUploaded && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="green"
              style={{ marginLeft: 5 }}
            />
          )}
        </TouchableOpacity>
      )}

      <Text style={styles.title}>פרטי העמותה</Text>

      <View style={styles.section}>
        <Text style={styles.label}>שם העמותה</Text>
        {!isGlobal ? (
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        ) : (
          <Text style={styles.value}>{name}</Text>
        )}

        <Text style={styles.label}>תיאור</Text>
        {!isGlobal ? (
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        ) : (
          <Text style={styles.value}>{description || 'לא צוין תיאור'}</Text>
        )}

        <Text style={styles.label}>סוג עמותה</Text>
        <Text style={styles.value}>
          {isGlobal ? 'עמותה ארצית' : 'עמותה עירונית'}
        </Text>

        <Text style={styles.label}>תחום פעילות</Text>
        {!isGlobal ? (
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={type}
              onValueChange={(itemValue) => setType(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="בחר תחום" value="" />
              <Picker.Item label="עמותה" value="עמותה" />
              <Picker.Item label="בית ספר" value="בית ספר" />
              <Picker.Item label="בית אבות" value="בית אבות" />
            </Picker>
          </View>
        ) : (
          <Text style={styles.value}>{type || 'לא צוין'}</Text>
        )}

        <Text style={styles.label}>אימייל</Text>
        {!isGlobal ? (
          <TextInput
            style={styles.input}
            value={contactEmail}
            onChangeText={setContactEmail}
          />
        ) : (
          <Text style={styles.value}>{contactEmail || 'לא צוין'}</Text>
        )}

        <Text style={styles.label}>טלפון</Text>
        {!isGlobal ? (
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{phone || 'לא צוין'}</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>סכום מקסימלי (למתנדב)</Text>
        <TextInput
          style={styles.input}
          value={maxAmount.toString()}
          onChangeText={(text) => setMaxAmount(Number(text))}
          keyboardType="numeric"
          onFocus={() => setMaxAmount('')}
        />

        {isGlobal && (
          <>
            <Text style={styles.label}>התנדבות בעיר בלבד</Text>
            <Switch
              value={isLocalOnly}
              onValueChange={setIsLocalOnly}
              style={styles.switch}
            />
          </>
        )}
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="שמור שינויים"
          onPress={handleSave}
          color={theColor.primary || '#4A90E2'}
        />
        <View style={{ width: 10 }} />
        <Button
          title="ביטול"
          color="#999"
          onPress={() => navigation.goBack()}
        />
      </View>
    </ScrollView>
  );
};

export default LinkedOrganizationDetails;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f2f7fa',
    alignItems: 'flex-end',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 15,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },
  uploadButtonText: {
    color: '#007aff',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
    color: '#222',
  },
  section: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
    textAlign: 'right',
  },
  value: {
    fontSize: 16,
    color: '#222',
    marginBottom: 12,
    textAlign: 'right',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  switch: {
    alignSelf: 'flex-start',
    marginTop: 5,
    marginBottom: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 48,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});
