import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import config from '../../config';
import VolunteerCard from '../../components/VolunteerCard';
import { adaptVolunteeringForCard } from '../../utils/adaptVolunteeringForCard';

export default function SearchVolunteering({ route, navigation }) {
  const { user } = route.params;
  const [loading, setLoading] = useState(true);
  const [volunteerings, setVolunteerings] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [volRes, cityOrgRes] = await Promise.all([
        axios.get(
          `${config.SERVER_URL}/volunteerings/byCity/${user.city.name}`
        ),
        axios.get(
          `${config.SERVER_URL}/cityOrganizations?city=${user.city._id}`
        ),
      ]);

      console.log('--- Volunteerings Loaded ---');
      console.log(JSON.stringify(volRes.data, null, 2));

      console.log('--- City Organizations Loaded ---');
      console.log(JSON.stringify(cityOrgRes.data, null, 2));

      const rawVols = volRes.data;
      const cityOrgsData = cityOrgRes.data;

      // צור מפה של orgId => CityOrg
      const orgMap = {};
      cityOrgsData.forEach((co) => {
        const idStr = co.organizationId?.toString?.();
        if (idStr) orgMap[idStr] = co;
      });

      const adapted = rawVols
        .map((v) => {
          const volOrgId = v.organizationId?.toString?.();
          const matchingOrg = orgMap[volOrgId];

          console.log('---------------------------------');
          console.log(`Trying to match volunteering "${v.title}"`);
          console.log('vol.organizationId as string:', volOrgId);

          if (!matchingOrg) {
            console.log(`❌ No match found for volunteering "${v.title}"`);
            return null;
          }

          console.log(`✅ Matched with cityOrg "${matchingOrg.name}"`);
          return adaptVolunteeringForCard(v, {
            cityOrganizationEntry: matchingOrg,
          });
        })
        .filter((v) => v !== null);

      setVolunteerings(adapted);
    } catch (err) {
      console.error('🚨 Error loading volunteerings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (volunteering) => {
    navigation.navigate('VolunteerDetails', { volunteering });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <FlatList
      data={volunteerings}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <VolunteerCard volunteering={item} onPress={handlePress} />
      )}
      ListEmptyComponent={<Text style={styles.empty}>לא נמצאו התנדבויות</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
