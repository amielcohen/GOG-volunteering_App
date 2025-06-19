import React, { useEffect, useState, useCallback } from 'react'; // הוסף useCallback
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FillProfileModal from '../../components/FillProfileModal';
import axios from 'axios';
import config from '../../config';
import OrganizationRepHeader from '../../components/OrganizationRepHeader';
import { useFocusEffect } from '@react-navigation/native'; // 💡 ייבוא חדש!

export default function OrganizationRepHomeScreen({ route, navigation }) {
  const { user: initialUser } = route.params;
  // אין צורך ב-shouldRefresh יותר
  // const [shouldRefresh, setShouldRefresh] = useState(false);

  const [user, setUser] = useState(initialUser);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [volunteeringList, setVolunteeringList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [cityNames, setCityNames] = useState([]);

  // עזר: הפקת ObjectId כמחרוזת
  const extractId = (val) => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (val.$oid) return val.$oid;
    if (val._id) return val._id.toString?.();
    return val.toString?.() ?? null;
  };

  // הפקת cities: תמיד יחזיר מערך עם מזהה אחד
  const cities =
    Array.isArray(user.cities) && user.cities.length > 0
      ? [extractId(user.cities[0])]
      : user.city
        ? [extractId(user.city)]
        : [];

  // 💡 שימוש ב-useFocusEffect במקום useEffect ותלות ב-shouldRefresh
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true); // הצג לודר בכל רענון
        try {
          const res = await axios.get(
            `${config.SERVER_URL}/auth/profile/${initialUser._id}`
          );
          const fullUser = res.data;
          setUser(fullUser);

          if (!fullUser.firstName || !fullUser.lastName) {
            setShowModal(true);
          }

          try {
            const vRes = await axios.get(
              `${config.SERVER_URL}/volunteerings/by-org-rep/${fullUser._id}` // השתמש ב-fullUser המעודכן
            );
            setVolunteeringList(vRes.data);
          } catch (err) {
            // לתפוס שגיאה ספציפית
            console.warn('לא נמצאו התנדבויות או שהראוט לא קיים עדיין', err);
            setVolunteeringList([]); // וודא שהרשימה ריקה במקרה של שגיאה
          }
        } catch (err) {
          console.error('שגיאה בטעינת הנתונים:', err);
          // ניתן להציג הודעת שגיאה למשתמש
        } finally {
          setLoading(false);
        }
      };

      fetchData();

      // פונקציית ניקוי (אופציונלי אך מומלץ)
      return () => {
        // ניתן לבצע כאן פעולות ניקוי אם נדרש
      };
    }, [initialUser._id]) // התלות היא ב-initialUser._id כדי לטעון נתוני המשתמש הנכונים
  );

  useEffect(() => {
    const fetchCityNames = async () => {
      const validIds = cities.filter(
        (id) => typeof id === 'string' && id.length === 24
      );
      if (validIds.length === 0) {
        setCityNames([]); // וודא שהרשימה ריקה אם אין ID-ים
        return;
      }

      try {
        const res = await axios.get(
          `${config.SERVER_URL}/cities/byIds?ids=${validIds.join(',')}`
        );
        const names = res.data.map((city) => city.name);
        setCityNames(names);
      } catch (err) {
        console.error('שגיאה בשליפת שמות ערים:', err);
        setCityNames([]); // וודא שהרשימה ריקה במקרה של שגיאה
      }
    };

    // קריאה לפונקציה רק אם יש שינויים ב-cities
    if (cities && cities.length > 0) {
      fetchCityNames();
    } else {
      setCityNames([]); // נקה את שמות הערים אם אין ערים
    }
  }, [cities]); // שים לב, עכשיו cities היא תלות

  const handleNavigate = (screen) => {
    if (screen === 'EditOrganizationRepProfileScreen') {
      navigation.navigate(screen, {
        user, // העבר את אובייקט המשתמש הנוכחי
        organization: user.organization,
        // onGoBack כבר לא נחוץ עם useFocusEffect
        // onGoBack: () => setShouldRefresh(true),
      });
    } else {
      navigation.navigate(screen, { user });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <OrganizationRepHeader
          repName={user.firstName + ' ' + user.lastName}
          organizationName={user.organization?.name}
          organizationImage={
            user.organization?.imageUrl
              ? { uri: user.organization.imageUrl }
              : require('../../images/noImageFound.webp')
          }
          cities={cityNames} // שמות, לא מזהים
          backgroundColor="#e6f0ff"
          onImagePress={() => setModalVisible(true)}
        />

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => handleNavigate('CreateVolunteering')}
        >
          <Icon name="add-circle" size={28} color="#007bff" />
          <Text style={styles.actionText}>צור התנדבות חדשה</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => handleNavigate('FutureVolunteerings')}
        >
          <Icon name="event" size={28} color="#007bff" />
          <Text style={styles.actionText}>התנדבויות פעילות ועתידיות</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => handleNavigate('OpenVolunteerings')}
        >
          <Icon name="check-circle" size={28} color="#007bff" />
          <Text style={styles.actionText}>סימון נוכחות</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => handleNavigate('VolunteeringsHistory')}
        >
          <Icon name="bar-chart" size={28} color="#007bff" />
          <Text style={styles.actionText}>צפייה בדוחות</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryCard}
          onPress={() => handleNavigate('EditOrganizationRepProfileScreen')}
        >
          <Icon name="settings" size={24} color="#999" />
          <Text style={styles.secondaryText}>עריכת פרטי עמותה</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackground}
          onPress={() => setModalVisible(false)}
        >
          <Image
            source={
              user.organization?.imageUrl
                ? { uri: user.organization.imageUrl }
                : require('../../images/defaultProfile.png')
            }
            style={styles.enlargedImage}
          />
        </Pressable>
      </Modal>

      {showModal && (
        <FillProfileModal
          userId={user._id}
          onClose={() => setShowModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionText: {
    fontSize: 18,
    marginRight: 12,
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
  secondaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 30,
    padding: 12,
    borderRadius: 10,
  },
  secondaryText: {
    fontSize: 16,
    marginRight: 10,
    color: '#666',
    textAlign: 'right',
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
});
