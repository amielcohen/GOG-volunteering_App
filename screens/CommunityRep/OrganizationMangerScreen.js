import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import OrganizationCard from '../../components/OrganizationCard';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import config from '../../config';

import OptionsModal from '../../components/OptionsModal';
import HelpModal from '../../components/HelpModal';
import CityHeader from '../../components/CityHeader';
import theColor from '../../constants/theColor';

export default function OrganizationManagerScreen({ route }) {
  const { user, cityName } = route.params;
  const navigation = useNavigation();

  const [optionsVisible, setOptionsVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user.city) {
      fetchOrganizations();
    }
  }, [user.city]);

  const fetchOrganizations = async () => {
    try {
      const cityId = typeof user.city === 'object' ? user.city._id : user.city;
      const response = await axios.get(
        `${config.SERVER_URL}/cityOrganizations?city=${cityId}`
      );
      setOrganizations(response.data);
    } catch (error) {
      console.error('שגיאה בטעינת עמותות:', error);
      Alert.alert('שגיאה', 'לא ניתן לטעון את רשימת העמותות.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (organization) => {
    navigation.navigate('CityOrganizationDetails', { organization, user });
  };

  const handlePrimaryAction = (organizationId) => {
    Alert.alert('מחיקה', 'האם אתה בטוח שברצונך למחוק עמותה זו?', [
      {
        text: 'כן',
        onPress: async () => {
          try {
            await axios.delete(
              `${config.SERVER_URL}/cityOrganizations/${organizationId}`
            );
            fetchOrganizations();
          } catch (error) {
            console.error('שגיאה במחיקה:', error);
            Alert.alert('שגיאה', 'לא ניתן למחוק את העמותה.');
          }
        },
        style: 'destructive',
      },
      { text: 'לא', style: 'cancel' },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CityHeader
        title="ניהול עמותות"
        cityName={cityName}
        color={theColor.calmBlue}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setOptionsVisible(true)}
      >
        <Text style={styles.addButtonText}>➕ הוסף עמותה</Text>
      </TouchableOpacity>

      {organizations.length === 0 ? (
        <Text style={styles.noOrganizationsText}>
          אין עמותות בעיר זו עדיין.
        </Text>
      ) : (
        <FlatList
          data={organizations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <OrganizationCard
              organization={{
                ...item,
                activeCities: undefined,
              }}
              onPrimaryAction={() => handlePrimaryAction(item._id)}
              onViewDetails={() => handleViewDetails(item)}
              primaryButtonLabel="מחק"
              viewDetailsLabel="פרטים"
            />
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}

      <OptionsModal
        visible={optionsVisible}
        onClose={() => setOptionsVisible(false)}
        title="בחירת סוג עמותה"
        subtitle="בחר האם להוסיף עמותה ארצית קיימת או ליצור עמותה עירונית חדשה."
        onHelpPress={() => setHelpVisible(true)}
        buttons={[
          {
            label: '➔ עמותה ארצית קיימת',
            color: '#2196F3',
            onPress: () => {
              setOptionsVisible(false);
              navigation.navigate('ChooseGlobalOrganization', {
                user,
                cityName,
              });
            },
          },
          {
            label: '➔ עמותה עירונית חדשה',
            color: '#FF9800',
            onPress: () => {
              setOptionsVisible(false);
              navigation.navigate('CreateCityOrganization', {
                user,
                cityName,
              });
            },
          },
        ]}
      />

      <HelpModal
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
        title="עמותה ארצית"
        message="עמותה ארצית היא עמותה שמוכרת על ידי האפליקציה ופועלת ברחבי הארץ. ניתן לקשר אותה לערים שונות לפי הצורך."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrganizationsText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
    fontSize: 16,
  },
});
