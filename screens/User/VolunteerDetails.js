import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as Calendar from 'expo-calendar';
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
  const [confirmBtnColor, setConfirmBtnColor] = useState('#6200EE');
  const [onConfirmClose, setOnConfirmClose] = useState(
    () => () => setConfirmVisible(false)
  );

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
      setOnConfirmClose(() => backHome);
      setConfirmText({ title: 'נרשמת', message: 'ההרשמה בוצעה בהצלחה!' });
      setConfirmBtnColor('#007AFF');
      setConfirmVisible(true);
    } catch (error) {
      setOnConfirmClose(() => () => setConfirmVisible(false));
      setConfirmText({
        title: 'שגיאה',
        message: error.response?.data?.message || 'אירעה שגיאה בעת הרישום',
      });
      setConfirmBtnColor('#D32F2F');
      setConfirmVisible(true);
    }
  };

  const handleUnregister = async () => {
    try {
      await axios.post(
        `${config.SERVER_URL}/volunteerings/${volunteering._id}/unregister`,
        { userId }
      );
      setOnConfirmClose(() => backHome);
      setConfirmText({ title: 'ביטול הצליח', message: 'ההרשמה בוטלה בהצלחה.' });
      setConfirmBtnColor('#007AFF');
      setConfirmVisible(true);
    } catch (error) {
      setOnConfirmClose(() => () => setConfirmVisible(false));
      setConfirmText({
        title: 'שגיאה',
        message:
          error.response?.data?.message || 'אירעה שגיאה בעת ביטול ההרשמה',
      });
      setConfirmBtnColor('#D32F2F');
      setConfirmVisible(true);
    }
  };

  const addToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        setOnConfirmClose(() => () => setConfirmVisible(false));
        setConfirmText({ title: 'אין הרשאה', message: 'לא ניתן לגשת ליומן' });
        setConfirmBtnColor('#D32F2F');
        setConfirmVisible(true);
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT
      );
      const calendar =
        calendars.find((cal) => cal.allowsModifications) || calendars[0];

      const [day, month, year] = volunteering.date.split(/[./-]/);
      const [hour, minute] = volunteering.time.split(':');

      const startDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute)
      );

      const endDate = new Date(
        startDate.getTime() + volunteering.durationInMinutes * 60000
      );

      await Calendar.createEventAsync(calendar.id, {
        title: volunteering.title || 'התנדבות',
        startDate,
        endDate,
        timeZone: 'Asia/Jerusalem',
        location: `${volunteering.address}, ${volunteering.city}`,
        notes: volunteering.description || '',
        alarms: [{ relativeOffset: -15 }],
      });

      setOnConfirmClose(() => () => setConfirmVisible(false));
      setConfirmText({
        title: 'נוסף ליומן',
        message: 'ההתנדבות נוספה בהצלחה ליומן שלך',
      });
      setConfirmBtnColor('#007AFF');
      setConfirmVisible(true);
    } catch (err) {
      setOnConfirmClose(() => () => setConfirmVisible(false));
      setConfirmText({
        title: 'שגיאה',
        message: 'אירעה שגיאה בעת ההוספה ליומן',
      });
      setConfirmBtnColor('#D32F2F');
      setConfirmVisible(true);
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

        {(volunteering.phone || volunteering.contactEmail) && (
          <InfoBox
            label="פרטי קשר"
            value={[
              volunteering.phone && `טלפון: ${volunteering.phone}`,
              volunteering.contactEmail &&
                `אימייל: ${volunteering.contactEmail}`,
            ]
              .filter(Boolean)
              .join('\n')}
          />
        )}
        <InfoBox
          label="תאריך ושעה"
          value={
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>
                {volunteering.date} בשעה {volunteering.time}
              </Text>
              <TouchableOpacity
                onPress={addToCalendar}
                style={styles.calendarButton}
              >
                <Text style={styles.calendarButtonText}>הוסף ליומן</Text>
              </TouchableOpacity>
            </View>
          }
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
                {volunteering.rewardCoins || 0} גוגואים
              </Text>
              <Text style={[styles.inlineText, { marginLeft: 12 }]}>
                🎖️{volunteering.exp || 0} נקודות ניסיון
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
        onClose={onConfirmClose}
        btnColor={confirmBtnColor}
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
  dateRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  dateText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'right',
    flexShrink: 1,
  },
  calendarButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    paddingLeft: 15,
    borderRadius: 6,
    backgroundColor: '#F0F4FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    minHeight: 36,
  },

  calendarButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
