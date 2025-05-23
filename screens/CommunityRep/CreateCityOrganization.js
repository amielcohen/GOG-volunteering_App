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
  const [errorText, setErrorText] = useState('');

  const [helpVisible, setHelpVisible] = useState(false);
  const openHelp = () => setHelpVisible(true);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('צריך הרשאה לגשת לגלריה!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !type || !maxReward.trim()) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות החיוניים.');
      return;
    }

    let uploadedImageUrl = '';
    if (image) {
      uploadedImageUrl = await uploadImageToCloudinary(image);
      if (!uploadedImageUrl) {
        Alert.alert('שגיאה', 'העלאת התמונה נכשלה.');
        return;
      }
    }

    const newOrganization = {
      name: `${name.trim()} (${cityName})`,
      description,
      type,
      contactEmail: email,
      phone,
      imageUrl: uploadedImageUrl,
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
        console.log('organization added');
        const organizationId = data._id;
        setNewCityOrganizationId(organizationId);
        console.log('ID של העמותה החדשה:', organizationId);

        try {
          await axios.post(`${config.SERVER_URL}/cityOrganizations/link`, {
            organizationId: organizationId,
            city: user.city,
            addedBy: user._id,
            maxRewardPerVolunteering: Number(maxReward),
          });
          setModalVisible(true);
        } catch (error) {
          console.error('שגיאה בקישור עמותה:', error);
          if (error.response?.data?.message) {
            setErrorText({
              title: 'שגיאה',
              message: error.response.data.message,
            });
            setErrorVisible(true);
          } else {
            setErrorText({
              title: 'שגיאה',
              message: 'לא ניתן לקשר את העמותה',
            });
            setErrorVisible(true);
          }
        }
      } else {
        Alert.alert('שגיאה', data.message || 'שגיאה בהוספת עמותה.');
      }
    } catch (error) {
      console.error('שגיאה בשמירת עמותה:', error);
      Alert.alert('שגיאה', 'שגיאה כללית בהוספת עמותה.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>הוספת עמותה עירונית</Text>

      <Text style={styles.label}>שם העמותה:</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>תיאור:</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>סוג עמותה:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={type}
          onValueChange={(itemValue) => setType(itemValue)}
        >
          <Picker.Item label="בחר סוג עמותה" value="" />
          <Picker.Item label="עמותה" value="עמותה" />
          <Picker.Item label="בית אבות" value="בית אבות" />
          <Picker.Item label="בית ספר" value="בית ספר" />
        </Picker>
      </View>

      <Text style={styles.label}>אימייל ליצירת קשר:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>טלפון ליצירת קשר:</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <View style={styles.row}>
        <Text style={styles.label}>הגדר סכום מטבעות מקסימלי להתנדבות:</Text>
        <TouchableOpacity onPress={openHelp}>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color="#555"
            style={{ marginStart: 5 }}
          />
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        value={maxReward}
        onChangeText={setMaxReward}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Text style={styles.imagePickerText}>בחר תמונה</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>הוסף עמותה</Text>
      </TouchableOpacity>

      <HelpModal
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
        title="מהו תגמול מקסימלי?"
        message="הגדר את כמות המטבעות המרבית שניתן להעניק עבור התנדבות בודדת במסגרת עמותה זו בעיר."
      />

      <OptionsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="קישור עמותה הושלם"
        subtitle="האם תרצה ליצור אחראי עמותה לעיר? ניתן גם להוסיף אחראי בהמשך."
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    textAlign: 'right',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  imagePicker: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 5,
  },
});
