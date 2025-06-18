import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
  StatusBar,
  StyleSheet,
  SafeAreaView, // שימוש ב-SafeAreaView עבור אזורים בטוחים
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import config from '../../config';
import { useFocusEffect } from '@react-navigation/native';

export default function CommunityRepHomeScreen({ navigation, route }) {
  const [currentUser, setCurrentUser] = useState(route.params.user);
  const [cityName, setCityName] = useState('');
  const [cityImageUrl, setCityImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  // מצב חדש לשליטה על רענון
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          const res = await axios.get(
            `${config.SERVER_URL}/auth/profile/${currentUser._id}`
          );
          if (res.data) setCurrentUser(res.data);
        } catch (err) {
          console.warn('שגיאה בטעינת המשתמש מחדש:', err.message);
        }
      };

      // רענן משתמש רק אם shouldRefresh הוא true או בטעינה ראשונית
      // הוסף !cityName כדי לוודא טעינה ראשונית
      if (shouldRefresh || !cityName) {
        fetchUser();
        setShouldRefresh(false); // אפס את הדגל לאחר הרענון
      }
    }, [currentUser._id, shouldRefresh, cityName]) // הוסף את cityName לתלויות
  );

  useEffect(() => {
    if (currentUser.city) {
      const cityId =
        typeof currentUser.city === 'object'
          ? currentUser.city._id
          : currentUser.city;
      fetchCityName(cityId);
    }
  }, [currentUser.city]);

  const fetchCityName = async (cityId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${config.SERVER_URL}/cities/${cityId}`);
      setCityName(res.data.name);
      setCityImageUrl(res.data.imageUrl);
    } catch (error) {
      console.error('שגיאה באחזור שם העיר:', error);
      setCityName('עיר לא ידועה');
      setCityImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (screen, params = {}) => {
    // עבור מסך EditCityProfileScreen, העבר פונקציית קריאה חוזרת שתפעיל רענון
    if (screen === 'EditCityProfileScreen') {
      navigation.navigate(screen, {
        user: currentUser,
        cityData: currentUser.city,
        onGoBack: () => setShouldRefresh(true), // קריאה חוזרת שתגדיר את דגל הרענון
      });
    } else {
      navigation.navigate(screen, { user: currentUser, ...params });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* אייקון גלגל שיניים עבור "עריכת פרטי עיר" בפינה הימנית העליונה */}
        <TouchableOpacity
          style={styles.settingsIconContainer}
          onPress={() => handleNavigate('EditCityProfileScreen')} // קרא ל-handleNavigate
        >
          <Icon name="settings" size={28} color="#FFFFFF" />
        </TouchableOpacity>

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

      <View style={styles.cardsGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => handleNavigate('ShopMenu')}
        >
          <Icon name="store" size={30} color="#4CAF50" />
          <Text style={styles.actionText}> צפה בחנות </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => handleNavigate('ManageShopInfo')}
        >
          <Icon name="category" size={30} color="#2196F3" />
          <Text style={styles.actionText}> ניהול פרטי חנות </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            handleNavigate('OrganizationManagerScreen', { cityName })
          }
        >
          <Icon name="groups" size={30} color="#FF9800" />
          <Text style={styles.actionText}> ניהול ארגונים </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            handleNavigate('CommunityLeaderboardScreen', {
              cityData: currentUser.city,
            })
          }
        >
          <Icon name="leaderboard" size={30} color="#9C27B0" />
          <Text style={styles.actionText}> לוח מובילים </Text>
        </TouchableOpacity>

        {/* placeholder עבור כרטיס סטטיסטיקות עתידי */}
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {
            /* Placeholder for navigation to statistics screen */
          }}
        >
          <Icon name="bar-chart" size={30} color="#E040FB" />
          <Text style={styles.actionText}> סטטיסטיקות </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            handleNavigate('SendCityMessage', { cityData: currentUser.city })
          }
        >
          <Icon name="mail" size={30} color="#E91E63" />
          <Text style={styles.actionText}> שליחת הודעה </Text>
        </TouchableOpacity>
      </View>

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
                : require('../../images/defaultProfile.png')
            }
            style={styles.enlargedImage}
          />
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#66BB6A',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
    position: 'relative',
  },
  settingsIconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
  },
  cityImage: {
    width: 125,
    height: 125,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    resizeMode: 'cover',
    borderRadius: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  cardsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '45%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
    aspectRatio: 1,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginTop: 10,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlargedImage: {
    width: '90%',
    height: '60%',
    resizeMode: 'contain',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 15,
  },
});
