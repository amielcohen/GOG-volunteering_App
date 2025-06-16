import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import config from '../../config';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ConfirmModal from '../../components/ConfirmModal';

export default function ManageCitiesScreen() {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      fetchCities();
    }, [])
  );

  const fetchCities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${config.SERVER_URL}/cities?showAll=true`);
      const sorted = res.data.sort((a, b) => a.name.localeCompare(b.name));
      setCities(sorted);
      setFilteredCities(sorted);
    } catch (err) {
      console.error('שגיאה בטעינת ערים:', err);
      Alert.alert('שגיאה', 'לא ניתן לטעון את הערים');
    } finally {
      setLoading(false);
    }
  };

  const confirmToggleCity = (city, currentStatus) => {
    setSelectedCity(city);
    setPendingStatus(!currentStatus);
    setModalVisible(true);
  };

  const toggleCityStatus = async () => {
    if (!selectedCity) return;

    try {
      const endpoint = pendingStatus ? 'activate' : 'deactivate';
      await axios.patch(
        `${config.SERVER_URL}/cities/${selectedCity._id}/${endpoint}`
      );
      fetchCities();
    } catch (err) {
      console.error('שגיאה בשינוי סטטוס עיר:', err);
      Alert.alert('שגיאה', 'לא ניתן לשנות את סטטוס העיר');
    } finally {
      setModalVisible(false);
      setSelectedCity(null);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (!text.trim()) {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter((city) =>
        city.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  };

  const renderCity = ({ item }) => (
    <View style={styles.cityItem}>
      <View style={styles.cityNameContainer}>
        <Text style={styles.cityName}>{item.name}</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          { backgroundColor: item.isActive ? '#EF5350' : '#66BB6A' },
        ]}
        onPress={() => confirmToggleCity(item, item.isActive)}
      >
        <Text style={styles.buttonText}>
          {item.isActive ? 'הפוך ללא פעילה' : 'הפעל עיר'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ניהול ערים</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddCityScreen')}
      >
        <Text style={styles.addButtonText}>➕ הוסף עיר חדשה</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.searchInput}
        placeholder="חיפוש לפי שם עיר"
        placeholderTextColor="#A0A0A0"
        value={search}
        onChangeText={handleSearch}
      />

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#607D8B"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={filteredCities}
          keyExtractor={(item) => item._id}
          renderItem={renderCity}
          ListEmptyComponent={
            <Text style={styles.noResults}>לא נמצאו ערים</Text>
          }
        />
      )}

      <ConfirmModal
        visible={modalVisible}
        title={pendingStatus ? 'הפעלת עיר' : 'השבתת עיר'}
        message={
          pendingStatus
            ? 'האם אתה בטוח שברצונך להפעיל את העיר הזו?'
            : 'השבתת העיר תחסום את הגישה של מנהל העירוני למערכת. האם להמשיך?'
        }
        onConfirm={toggleCityStatus}
        onCancel={() => setModalVisible(false)}
        confirmColor={pendingStatus ? '#66BB6A' : '#EF5350'}
        confirmText={pendingStatus ? 'הפעל' : 'השבת'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#333333',
  },
  addButton: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addButtonText: {
    color: '#3F51B5',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    textAlign: 'right',
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cityItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cityNameContainer: {
    flex: 1,
    marginRight: 10,
  },
  cityName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#424242',
    textAlign: 'right',
    flexWrap: 'wrap',
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    flexShrink: 0,
    flexGrow: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 30,
    color: '#888888',
    fontSize: 16,
  },
});
