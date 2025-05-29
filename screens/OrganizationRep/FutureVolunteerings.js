// screens/FutureVolunteeringsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import config from '../../config';
import ConfirmModal from '../../components/ConfirmModal';

export default function FutureVolunteeringsScreen({ route }) {
  const { user } = route.params;
  const [volunteerings, setVolunteerings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    fetch(
      `${config.SERVER_URL}/volunteerings/future/open/byCityOfRep/${user._id}`
    )
      .then((res) => res.json())
      .then((data) => {
        setVolunteerings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('שגיאה בשליפת התנדבויות עתידיות:', err);
        setLoading(false);
      });
  }, []);

  const handleCancel = async () => {
    try {
      const res = await fetch(
        `${config.SERVER_URL}/volunteerings/${selectedId}/cancel`,
        {
          method: 'PUT',
        }
      );
      if (res.ok) {
        setVolunteerings((prev) => prev.filter((v) => v._id !== selectedId));
      } else {
        console.warn('ביטול נכשל');
      }
    } catch (err) {
      console.error('שגיאה בביטול:', err);
    } finally {
      setConfirmVisible(false);
      setSelectedId(null);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.titleBox}>
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <View style={styles.detailsBox}>
        <Text style={styles.detail}>
          {new Date(item.date).toLocaleString('he-IL')} 📅
        </Text>
        <Text style={styles.detail}>📍 {item.address}</Text>
        <Text style={styles.detail}>
          מתנדבים מאושרים: {item.registeredVolunteers?.length || 0} /{' '}
          {item.maxParticipants || 'ללא הגבלה'}
        </Text>
      </View>
      <Pressable
        style={styles.cancelButton}
        onPress={() => {
          setSelectedId(item._id);
          setConfirmVisible(true);
        }}
      >
        <Text style={styles.cancelButtonText}>ביטול התנדבות</Text>
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text>טוען התנדבויות עתידיות...</Text>
      </View>
    );
  }

  if (!volunteerings.length) {
    return (
      <View style={styles.centered}>
        <Text>לא נמצאו התנדבויות פתוחות עתידיות.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={volunteerings}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
      <ConfirmModal
        visible={confirmVisible}
        title="אישור פעולה"
        message="האם אתה בטוח שברצונך לבטל את ההתנדבות הזו?"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleCancel}
        confirmText="כן, בטל"
        cancelText="חזור"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  card: {
    backgroundColor: '#fdf7e3',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d4af37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'column',
    alignItems: 'flex-end', // יישור כל התוכן בכרטיס לימין
  },
  titleBox: {
    borderBottomWidth: 1,
    borderColor: '#d4af37',
    paddingBottom: 6,
    marginBottom: 10,
    width: '100%', // ודא שהכותרת תופסת את כל הרוחב
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4e342e',
    textAlign: 'right', // יישור טקסט הכותרת לימין
  },
  detailsBox: {
    alignItems: 'flex-end', // יישור הפרטים לימין
    width: '100%', // ודא שתיבת הפרטים תופסת את כל הרוחב
  },
  detail: {
    fontSize: 14,
    color: '#3e3e3e',
    textAlign: 'right', // יישור טקסט הפרטים לימין
    marginBottom: 4,
  },
  cancelButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e53935',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-end', // ממקם את הכפתור לימין
  },
  cancelButtonText: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
