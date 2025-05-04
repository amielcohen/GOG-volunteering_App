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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import config from '../../config';

export default function CommunityRepHomeScreen({ navigation, route }) {
  const { user } = route.params;
  const [cityName, setCityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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
    } catch (error) {
      console.error('Error fetching city name:', error);
      setCityName('עיר לא ידועה');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen, { user });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
              source={
                user.city?.imageUrl
                  ? { uri: user.city.imageUrl }
                  : require('../../images/defaultProfile.png')
              }
              style={styles.cityImage}
            />
          </TouchableOpacity>
          <Text style={styles.title}>
            שלום מנהל העיר {cityName || 'לא ידועה'}!
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => handleNavigate('ShopMenu')}
        >
          <Icon name="store" size={28} color="#007bff" />
          <Text style={styles.actionText}>צפה בחנות</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => handleNavigate('ManageCategoriesScreen')}
        >
          <Icon name="category" size={28} color="#007bff" />
          <Text style={styles.actionText}>ניהול קטגוריות</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() =>
            navigation.navigate('OrganizationManagerScreen', { user, cityName })
          }
        >
          <Icon name="groups" size={28} color="#007bff" />
          <Text style={styles.actionText}>ניהול ארגונים</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => Alert.alert('פעולה', 'עריכת התנדבויות')}
        >
          <Icon name="edit" size={24} color="#007bff" />
          <Text style={styles.secondaryText}>עריכת התנדבויות</Text>
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
              user.city?.imageUrl
                ? { uri: user.city.imageUrl }
                : require('../../images/defaultProfile.png')
            }
            style={styles.enlargedImage}
          />
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF0F0',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9B3B5',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginLeft: 20,
    marginRight: 20,
  },
  cityImage: {
    width: 120,
    height: 120,
    marginBottom: 12,
    borderWidth: 2,
    resizeMode: 'stretch',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
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
