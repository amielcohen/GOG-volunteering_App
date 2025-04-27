import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import OrganizationCard from '../../components/OrganizationCard';
import axios from 'axios';
import config from '../../config';
import { useNavigation } from '@react-navigation/native';

export default function ChooseGlobalOrganizationScreen({ route }) {
  const { user } = route.params;
  const city = user.city;
  const navigation = useNavigation();

  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalOrganizations();
  }, []);

  const fetchGlobalOrganizations = async () => {
    try {
      const response = await axios.get(`${config.SERVER_URL}/organizations`);
      const globalOrgs = response.data.filter((org) => org.isGlobal);

      const unlinkedOrgs = globalOrgs.filter((org) => {
        return !org.activeCities || !org.activeCities.includes(city);
      });

      setOrganizations(unlinkedOrgs);
      setFilteredOrganizations(unlinkedOrgs);
    } catch (error) {
      console.error('שגיאה בטעינת עמותות ארציות:', error);
      Alert.alert('שגיאה', 'לא ניתן לטעון את רשימת העמותות הארציות.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredOrganizations(organizations);
    } else {
      const filtered = organizations.filter((org) =>
        org.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredOrganizations(filtered);
    }
  };

  const handleSelectOrganization = (organization) => {
    navigation.navigate('LinkGlobalOrganization', { organization, user });
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
      <Text style={styles.header}>בחר עמותה ארצית לקישור לעיר {city}</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="חפש עמותה לפי שם..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {filteredOrganizations.length === 0 ? (
        <Text style={styles.noOrganizationsText}>לא נמצאו עמותות מתאימות.</Text>
      ) : (
        <FlatList
          data={filteredOrganizations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <OrganizationCard
              organization={{
                ...item,
                activeCities: undefined,
              }}
              onPrimaryAction={() => handleSelectOrganization(item)}
              onViewDetails={() => {}}
              primaryButtonLabel="בחר עמותה"
              viewDetailsLabel="פרטים"
            />
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
    elevation: 2,
    textAlign: 'right', // בשביל עברית
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
