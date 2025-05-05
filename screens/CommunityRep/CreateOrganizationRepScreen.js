// גרסה מעודכנת של CreateOrganizationRepScreen עם תיקון להצגת תוצאות ההגרלה ומניעת תקיעה
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import config from '../../config';
import CityHeader from '../../components/CityHeader';
import theColor from '../../constants/theColor';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function CreateOrganizationRepScreen({ route }) {
  const { cityName, organizationId, user, organizationName } = route.params;
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  const isValidUsername = (username) => {
    const regex = /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/;
    return regex.test(username);
  };

  const generateRandomCredentials = async () => {
    const generateUsername = () => {
      const prefix = 'User';
      const suffix = Math.floor(1000 + Math.random() * 9000);
      return `${prefix}${suffix}`;
    };

    const generatePassword = () => {
      const characters =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
      }
      return password;
    };

    let tempUsername;
    let attempts = 0;

    while (true) {
      tempUsername = generateUsername();
      if (!isValidUsername(tempUsername)) continue;

      try {
        const response = await axios.get(
          `${config.SERVER_URL}/auth/checkUsername`,
          {
            params: { username: tempUsername },
          }
        );

        if (!response.data.exists) break;
      } catch (err) {
        console.error('שגיאה בבדיקת זמינות משתמש:', err);
        return;
      }

      attempts++;
      if (attempts > 10) {
        Alert.alert('שגיאה', 'לא ניתן להגריל שם משתמש ייחודי, נסה שוב.');
        return;
      }
    }

    setUsername(tempUsername);
    setPassword(generatePassword());
  };

  const handleCreate = async () => {
    if (!username || !password) {
      Alert.alert('שגיאה', 'אנא מלא שם משתמש וסיסמה');
      return;
    }

    try {
      await axios.post(`${config.SERVER_URL}/organizationReps`, {
        username,
        password,
        city: typeof user.city === 'object' ? user.city._id : user.city,
        cities: [typeof user.city === 'object' ? user.city._id : user.city],

        organization: organizationId,
      });

      setShowSummary(true);
    } catch (error) {
      console.error('Error creating OrganizationRep:', error);
      if (error.response?.data?.message) {
        Alert.alert('שגיאה', error.response.data.message);
      } else {
        Alert.alert('שגיאה', 'לא ניתן ליצור אחראי עמותה.');
      }
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <CityHeader
        title="צור אחראי עמותה"
        cityName={cityName}
        color={theColor.primaryBlue}
      />

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="שם משתמש"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.iconButton}
          onPress={generateRandomCredentials}
        >
          <Icon name="casino" size={20} color="#fff" />
          <Text style={styles.iconButtonText}>הגרל משתמש וסיסמה</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreate}>
        <Text style={styles.buttonText}>צור אחראי עמותה</Text>
      </TouchableOpacity>

      <Modal visible={showSummary} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>האחראי נוצר בהצלחה!</Text>
            <Text style={styles.modalText}>שם משתמש: {username}</Text>
            <Text style={styles.modalText}>סיסמה: {password}</Text>
            <Text style={styles.modalText}>עמותה: {organizationName}</Text>
            <Text style={styles.modalNote}>
              אנא כתוב או צלם מסך – לא ניתן לשחזר את הסיסמה מאוחר יותר.
            </Text>
            <TouchableOpacity
              style={[styles.button, { marginTop: 10 }]}
              onPress={() => {
                setShowSummary(false);
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
              }}
            >
              <Text style={styles.buttonText}>אישור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
    writingDirection: 'rtl',
  },
  form: {
    marginTop: 20,
    gap: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    elevation: 2,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    gap: 6,
  },
  iconButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginVertical: 4,
  },
  modalNote: {
    fontSize: 14,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
  },
});
