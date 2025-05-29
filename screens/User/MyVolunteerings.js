import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import config from '../../config';
import VolunteeringCard from '../../components/VolunteerCard';
import { adaptVolunteeringForCard } from '../../utils/adaptVolunteeringForCard';

export default function MyVolunteeringsScreen({ route, navigation }) {
  const { user } = route.params;

  const [volunteerings, setVolunteerings] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMyVolunteerings = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching user volunteerings...');

      // שלב 1: שליפת התנדבויות של המשתמש
      const [volRes, cityOrgRes] = await Promise.all([
        axios.get(`${config.SERVER_URL}/volunteerings/forUser/${user._id}`),
        axios.get(
          `${config.SERVER_URL}/cityOrganizations?city=${user.city._id}`
        ),
      ]);

      const rawVols = volRes.data;
      const cityOrgs = cityOrgRes.data;

      console.log(`✅ Received ${rawVols.length} volunteerings`);
      console.log(`🏙️ Received ${cityOrgs.length} city organizations`);

      // שלב 2: יצירת מפת עמותות לפי organizationId
      const orgMap = {};
      cityOrgs.forEach((co) => {
        const idStr = co.organizationId?.toString?.();
        if (idStr) orgMap[idStr] = co;
      });

      // שלב 3: התאמת כל התנדבות עם adaptVolunteeringForCard
      const adapted = rawVols
        .map((v) => {
          const volOrgId = v.organizationId?.toString?.();
          const matchingOrg = orgMap[volOrgId];

          if (!matchingOrg) return null;

          return adaptVolunteeringForCard(v, {
            cityOrganizationEntry: matchingOrg,
          });
        })
        .filter((v) => v !== null);

      setVolunteerings(adapted);
    } catch (error) {
      console.error('❌ Failed to load volunteerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (volunteering) => {
    console.log('volunteer', volunteering);
    navigation.navigate('VolunteerDetails', {
      volunteering,
      userId: user._id,
      user,
      isRegistered: true,
    });
  };

  useEffect(() => {
    loadMyVolunteerings();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ההתנדבויות שלי</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : volunteerings.length === 0 ? (
        <Text style={styles.noDataText}>לא נמצאו התנדבויות</Text>
      ) : (
        <FlatList
          data={volunteerings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <VolunteeringCard volunteering={item} onPress={handlePress} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 40,
  },
});
