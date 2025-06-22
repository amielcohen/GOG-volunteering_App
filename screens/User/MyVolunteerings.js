import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import config from '../../config';
import VolunteeringCard from '../../components/VolunteerCard';
import { adaptVolunteeringForCard } from '../../utils/adaptVolunteeringForCard';

export default function MyVolunteeringsScreen({ route, navigation }) {
  const { user } = route.params;

  const [volunteerings, setVolunteerings] = useState({
    upcoming: [],
    past: [],
  });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('upcoming'); // 'upcoming' | 'past'

  const loadMyVolunteerings = async () => {
    try {
      setLoading(true);

      const [volRes, cityOrgRes] = await Promise.all([
        axios.get(`${config.SERVER_URL}/volunteerings/forUser/${user._id}`),
        axios.get(
          `${config.SERVER_URL}/cityOrganizations?city=${user.city._id}`
        ),
      ]);

      const rawVols = volRes.data;
      const cityOrgs = cityOrgRes.data;

      const orgMap = {};
      cityOrgs.forEach((co) => {
        const idStr = co.organizationId?.toString?.();
        if (idStr) orgMap[idStr] = co;
      });

      const adapted = rawVols
        .map((v) => {
          const volOrgId = v.organizationId?.toString?.();
          const matchingOrg = orgMap[volOrgId];
          if (!matchingOrg) return null;

          const adaptedVol = adaptVolunteeringForCard(v, {
            cityOrganizationEntry: matchingOrg,
            user,
          });
          adaptedVol.originalDate = v.date;
          return adaptedVol;
        })
        .filter((v) => v !== null);

      const now = new Date();
      const upcoming = adapted.filter((v) => {
        const parsed = new Date(v.originalDate);
        return parsed.toString() !== 'Invalid Date' && parsed > now;
      });

      const past = adapted.filter((v) => {
        const parsed = new Date(v.originalDate);
        return parsed.toString() !== 'Invalid Date' && parsed <= now;
      });

      setVolunteerings({ upcoming, past });
    } catch (error) {
      console.error('❌ Failed to load volunteerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (volunteering) => {
    navigation.navigate('VolunteerDetails', {
      volunteering,
      userId: user._id,
      user,
      isRegistered: true,
      past: viewMode === 'past',
    });
  };

  useEffect(() => {
    loadMyVolunteerings();
  }, []);

  const displayedList =
    viewMode === 'upcoming' ? volunteerings.upcoming : volunteerings.past;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ההתנדבויות שלי</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'upcoming' && styles.activeToggle,
          ]}
          onPress={() => setViewMode('upcoming')}
        >
          <Text style={styles.toggleText}>📅 קרובות</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'past' && styles.activeToggle,
          ]}
          onPress={() => setViewMode('past')}
        >
          <Text style={styles.toggleText}>📜 היסטוריה</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : displayedList.length === 0 ? (
        <Text style={styles.noDataText}>לא נמצאו התנדבויות</Text>
      ) : (
        <FlatList
          data={displayedList}
          keyExtractor={(item) => item._id + viewMode}
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
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
