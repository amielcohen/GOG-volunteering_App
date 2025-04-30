import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import config from '../../config';

const CommunityRepHomeScreen = ({ navigation, route }) => {
  const { user } = route.params;
  const [cityName, setCityName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user.city) {
      fetchCityName(user.city);
    }
  }, [user.city]);

  const fetchCityName = async (cityId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${config.SERVER_URL}/cities/${cityId}`);
      setCityName(res.data.name);
    } catch (error) {
      console.error('Error fetching city name:', error);
      setCityName('עיר לא ידועה');
    } finally {
      setLoading(false);
    }
  };

  const Shopinfo = () => {
    navigation.navigate('ShopMenu', { user });
  };

  const CategoriesManger = () => {
    navigation.navigate('ManageCategoriesScreen');
  };

  const OrganizationManger = () => {
    navigation.navigate('OrganizationManagerScreen', { user, cityName }); // ⬅️ שולחים גם את שם העיר
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#6200EE" />
        ) : (
          <>
            <Text style={styles.welcomeText}>
              {cityName ? `שלום מנהל העיר ${cityName}!` : 'שלום מנהל עיר!'}
            </Text>

            <Pressable style={styles.button} onPress={() => Shopinfo()}>
              <Text style={styles.buttonText}>צפה בחנות</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={() => CategoriesManger()}>
              <Text style={styles.buttonText}>ניהול קטגוריות</Text>
            </Pressable>

            <Pressable
              style={styles.button}
              onPress={() => OrganizationManger()}
            >
              <Text style={styles.buttonText}>ניהול ארגונים</Text>
            </Pressable>

            <Pressable
              style={styles.button}
              onPress={() => handlePress('עריכת התנדבויות')}
            >
              <Text style={styles.buttonText}>עריכת התנדבויות</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 22,
    marginBottom: 30,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6200ee',
    width: '80%',
    paddingVertical: 12,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CommunityRepHomeScreen;
