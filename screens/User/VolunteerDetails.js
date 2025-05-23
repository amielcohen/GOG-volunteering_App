import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import CustomCoinIcon from '../../components/CustomCoinIcon';
import axios from 'axios';
import config from '../../config';
import Confirm from '../../components/ErrorModal';

export default function VolunteerDetailsScreen() {
  const route = useRoute();
  const { volunteering, userId, user, isRegistered } = route.params;

  const navigation = useNavigation();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const backHome = () => {
    setConfirmVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'UserHomeScreen', params: { user } }],
    });
  };

  const handleRegister = async () => {
    try {
      await axios.post(
        `${config.SERVER_URL}/volunteerings/${volunteering._id}/register`,
        { userId }
      );

      setConfirmText({
        title: 'נרשמת',
        message: 'ההרשמה בוצעה בהצלחה!',
      });
      setConfirmVisible(true);
    } catch (error) {
      console.error('שגיאה ברישום:', error.response?.data || error.message);
      Alert.alert(
        'שגיאה',
        error.response?.data?.message || 'אירעה שגיאה בעת הרישום'
      );
    }
  };

  const handleUnregister = async () => {
    try {
      await axios.post(
        `${config.SERVER_URL}/volunteerings/${volunteering._id}/unregister`,
        { userId }
      );

      setConfirmText({
        title: 'ביטול הצליח',
        message: 'ההרשמה בוטלה בהצלחה.',
      });
      setConfirmVisible(true);
    } catch (error) {
      console.error('שגיאה בביטול:', error.response?.data || error.message);
      Alert.alert(
        'שגיאה',
        error.response?.data?.message || 'אירעה שגיאה בעת ביטול ההרשמה'
      );
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        {volunteering.imageUrl && (
          <Image
            source={{ uri: volunteering.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <Text style={styles.title}>{volunteering.title}</Text>

        <InfoBox
          label="תיאור"
          value={volunteering.description || 'אין תיאור'}
        />
        <InfoBox label="עמותה" value={volunteering.organizationName || '---'} />
        <InfoBox
          label="מיקום"
          value={`${volunteering.city || '---'}, ${volunteering.address || '---'}`}
        />
        <InfoBox
          label="תאריך ושעה"
          value={`${volunteering.date} בשעה ${volunteering.time}`}
        />
        <InfoBox
          label="משך ההתנדבות"
          value={`כ${volunteering.durationInMinutes} דקות `}
        />
        <InfoBox
          label="תגמול"
          value={
            <View style={styles.inline}>
              <CustomCoinIcon size={18} />
              <Text style={styles.inlineText}>
                {volunteering.rewardCoins || 0}
              </Text>
            </View>
          }
        />
        <InfoBox
          label="מקומות פנויים"
          value={`${volunteering.registeredSpots}/${volunteering.totalSpots}`}
        />
        {volunteering.notesForVolunteers && (
          <InfoBox label="הערות" value={volunteering.notesForVolunteers} />
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={isRegistered ? handleUnregister : handleRegister}
      >
        <Text style={styles.registerText}>
          {isRegistered ? 'ביטול הרשמה' : 'הצטרפות להתנדבות'}
        </Text>
      </TouchableOpacity>

      <Confirm
        visible={confirmVisible}
        title={confirmText.title}
        message={confirmText.message}
        onClose={backHome}
      />
    </View>
  );
}

function InfoBox({ label, value }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}:</Text>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text style={styles.value}>{value}</Text>
      ) : (
        value
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f2f4f5',
  },
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#555',
    textAlign: 'right',
  },
  value: {
    fontSize: 16,
    color: '#222',
    textAlign: 'right',
    lineHeight: 22,
  },
  inline: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  inlineText: {
    fontSize: 16,
    color: '#222',
  },
  registerButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  registerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
