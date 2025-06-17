import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import CustomCoinIcon from '../../components/CustomCoinIcon';
import axios from 'axios';
import config from '../../config';
import Confirm from '../../components/ErrorModal';

export default function VolunteerDetailsScreen() {
  const route = useRoute();
  const { volunteering, userId, user, isRegistered, past } = route.params;

  const navigation = useNavigation();

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const openInGoogleMaps = () => {
    const query = encodeURIComponent(
      `${volunteering.address}, ${volunteering.city}`
    );
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load Google Maps", err)
    );
  };

  const openInWaze = () => {
    const query = encodeURIComponent(
      `${volunteering.address}, ${volunteering.city}`
    );
    const url = `https://waze.com/ul?q=${query}&navigate=yes`;
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't load Waze", err)
    );
  };

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

  const isFull = volunteering.registeredSpots >= volunteering.totalSpots;

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

        <View style={styles.mapButtonsHeaderRow}>
          <TouchableOpacity onPress={openInGoogleMaps} style={styles.mapButton}>
            <Image
              source={require('../../images/google_maps_icon.png')}
              style={styles.mapIcon}
            />
            <Text style={styles.mapText}>גוגל מפות</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openInWaze} style={styles.mapButton}>
            <Image
              source={require('../../images/waze_app_icon.png')}
              style={styles.mapIcon}
            />
            <Text style={styles.mapText}>וויז</Text>
          </TouchableOpacity>
        </View>
        <InfoBox
          label="מיקום"
          value={`${volunteering.city || '---'}, ${volunteering.address || '---'}`}
        />
        <InfoBox
          label="תיאור"
          value={volunteering.description || 'אין תיאור'}
        />
        <InfoBox label="עמותה" value={volunteering.organizationName || '---'} />

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

      {!past && (
        <TouchableOpacity
          style={[
            styles.registerButton,
            isFull && !isRegistered && styles.disabledButton,
          ]}
          disabled={isFull && !isRegistered}
          onPress={isRegistered ? handleUnregister : handleRegister}
        >
          <Text style={styles.registerText}>
            {isRegistered
              ? 'ביטול הרשמה'
              : isFull
                ? 'אין מקומות פנויים'
                : 'הצטרפות להתנדבות'}
          </Text>
        </TouchableOpacity>
      )}

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
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
    lineHeight: 36,
  },
  mapButtonsHeaderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 25,
  },
  mapButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#E0F2F7',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    minWidth: 120,
  },
  mapIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  mapText: {
    fontSize: 14,
    color: '#0D47A1',
    fontWeight: '700',
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
  registerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
