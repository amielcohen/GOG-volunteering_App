import React, { useState, useEffect } from 'react';
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
  Alert,
  StatusBar, // ייבוא StatusBar לניהול סרגל המצב
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import config from '../../config';

export default function CommunityRepHomeScreen({ navigation, route }) {
  const { user } = route.params;
  const [cityName, setCityName] = useState('');
  const [cityImageUrl, setCityImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // console.log(user); // נשאר כפי שהיה
  }, []);

  useEffect(() => {
    if (user.city) {
      const cityId = typeof user.city === 'object' ? user.city._id : user.city;
      fetchCityName(cityId);
    }
  }, [user.city]);

  const fetchCityName = async (cityId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${config.SERVER_URL}/cities/${cityId}`);
      setCityName(res.data.name);
      setCityImageUrl(res.data.imageUrl);
    } catch (error) {
      console.error('Error fetching city name:', error);
      setCityName('עיר לא ידועה');
      setCityImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen, { user });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {loading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <Image
              source={
                cityImageUrl
                  ? { uri: cityImageUrl }
                  : require('../../images/defaultProfile.png')
              }
              style={styles.cityImage}
            />
          )}
        </TouchableOpacity>
        <Text style={styles.title}>
          שלום מנהל העיר {cityName || 'לא ידועה'}!
        </Text>
      </View>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => handleNavigate('ShopMenu')}
      >
        <Icon name="store" size={28} color="#4CAF50" style={styles.cardIcon} />
        <Text style={styles.actionText}> צפה בחנות </Text>
        <Icon name="arrow-forward-ios" size={20} color="#757575" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => handleNavigate('ManageShopInfo')}
      >
        <Icon
          name="category"
          size={28}
          color="#2196F3"
          style={styles.cardIcon}
        />
        <Text style={styles.actionText}> ניהול פרטי חנות </Text>
        <Icon name="arrow-forward-ios" size={20} color="#757575" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() =>
          navigation.navigate('OrganizationManagerScreen', {
            user,
            cityName,
          })
        }
      >
        <Icon name="groups" size={28} color="#FF9800" style={styles.cardIcon} />
        <Text style={styles.actionText}> ניהול ארגונים </Text>
        <Icon name="arrow-forward-ios" size={20} color="#757575" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionCard} // ניתן להשתמש באותו סגנון כרטיס
        onPress={() => Alert.alert('פעולה', 'עריכת התנדבויות')}
      >
        <Icon name="edit" size={28} color="#9C27B0" style={styles.cardIcon} />
        <Text style={styles.actionText}>עריכת התנדבויות</Text>
        <Icon name="arrow-forward-ios" size={20} color="#757575" />
      </TouchableOpacity>

      {/* ייתכן שתרצה להוסיף כאן כרטיסים נוספים בעתיד באותו סגנון */}

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
              cityImageUrl
                ? { uri: cityImageUrl }
                : require('../../images/defaultProfile.png') // נתיב תמונת ברירת המחדל המקורית שלך
            }
            style={styles.enlargedImage}
          />
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F0F4F8', // רקע אפרפר-כחלחל בהיר מאוד
    paddingBottom: 30, // רווח למטה
  },
  header: {
    backgroundColor: '#4CAF50', // ירוק מרגיע
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  cityImage: {
    width: 120,
    height: 120,
    marginBottom: 12,
    borderWidth: 3, // עובי מסגרת עדין
    borderColor: '#FFFFFF', // מסגרת לבנה
    resizeMode: 'cover', // נשאר מרובע, אבל מכסה את השטח
    borderRadius: 10, // פינות מעוגלות קלות לתמונה מרובעת
  },
  title: {
    fontSize: 24, // מעט גדול יותר
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  actionCard: {
    flexDirection: 'row-reverse', // כדי שהאייקון יהיה מימין
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginHorizontal: 20,
    padding: 18, // הגדלתי פדינג
    marginBottom: 15, // מרווח בין כרטיסים
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  cardIcon: {
    marginRight: 15, // מרווח מהטקסט אחרי יישור row-reverse
  },
  actionText: {
    flex: 1, // מאפשר לטקסט לתפוס את רוב השטח
    fontSize: 18, // גודל קריא
    fontWeight: '600', // מעט מודגש
    color: '#333333', // צבע כהה לקריאות
    textAlign: 'right', // יישור לימין
    marginLeft: 10, // רווח מהחץ השמאלי
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedImage: {
    width: '95%',
    height: '70%',
    resizeMode: 'contain',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 10, // פינות מעוגלות קלות לתמונה מוגדלת
  },
});
