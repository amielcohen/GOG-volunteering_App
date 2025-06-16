import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import config from '../../config';
import VolunteerCard from '../../components/VolunteerCard';
import FilterVolunteeringModal from '../../components/FilterVolunteeringModal';
import { adaptVolunteeringForCard } from '../../utils/adaptVolunteeringForCard';

export default function SearchVolunteering({ route, navigation }) {
  const { user } = route.params;

  const [loading, setLoading] = useState(true);
  const [volunteerings, setVolunteerings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    tag: '',
    minExp: '',
    maxExp: '',
    minCoins: '',
    maxCoins: '',
    location: '',
    organizationName: '',
    onlyWithAvailableSpots: false,
    onlyMatchingLevel: false,
  });

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

      const now = new Date();
      const rawVols = volRes.data;

      const validVols = rawVols.filter((vol) => {
        const volDate = new Date(vol.date);
        return !vol.isClosed && !vol.cancelled && volDate > now;
      });

      const orgMap = {};
      cityOrgRes.data.forEach((co) => {
        const idStr = co.organizationId?.toString?.();
        if (idStr) orgMap[idStr] = co;
      });

      const userIdStr = user._id?.toString?.();
      const filteredVols = validVols.filter((vol) => {
        const regList = Array.isArray(vol.registeredVolunteers)
          ? vol.registeredVolunteers
          : [];
        const isRegistered = regList.some((reg) => {
          const regId =
            typeof reg.userId === 'object' ? reg.userId._id : reg.userId;
          return regId?.toString?.() === userIdStr;
        });

        return !isRegistered;
      });

      const adapted = filteredVols
        .map((v) => {
          const volOrgId = v.organizationId?.toString?.();
          const matchingOrg = orgMap[volOrgId];
          if (!matchingOrg) return null;

          return adaptVolunteeringForCard(v, {
            cityOrganizationEntry: matchingOrg,
            user, // ✅ נוספה תמיכה ב־user כדי לחשב isLockedByLevel
          });
        })
        .filter((v) => v !== null);

      setVolunteerings(adapted);
      setFiltered(adapted);
    } catch (err) {
      console.error('🚨 Error loading volunteerings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [filters]);

  const applyFilters = () => {
    const {
      tag,
      minExp,
      maxExp,
      minCoins,
      maxCoins,
      location,
      organizationName,
      onlyWithAvailableSpots,
      onlyMatchingLevel,
    } = filters;

    const result = volunteerings.filter((item) => {
      const tagMatch = !tag || item.tags?.includes(tag);
      const expMatch =
        (!minExp || item.exp >= parseInt(minExp)) &&
        (!maxExp || item.exp <= parseInt(maxExp));
      const coinMatch =
        (!minCoins || item.rewardCoins >= parseInt(minCoins)) &&
        (!maxCoins || item.rewardCoins <= parseInt(maxCoins));
      const locationMatch = !location || item.city?.includes(location);
      const orgMatch =
        !organizationName || item.organizationName?.includes(organizationName);
      const hasAvailableSpot =
        !onlyWithAvailableSpots ||
        item.totalSpots === 0 ||
        item.registeredSpots < item.totalSpots;

      // ✅ תוספת: התאמה לפי רמת משתמש
      const levelMatch =
        !onlyMatchingLevel ||
        item.minLevel === 0 ||
        user.level >= item.minLevel;

      return (
        tagMatch &&
        expMatch &&
        coinMatch &&
        locationMatch &&
        orgMatch &&
        hasAvailableSpot &&
        levelMatch
      );
    });

    setFiltered(result);
  };

  const handlePress = (volunteering) => {
    navigation.navigate('VolunteerDetails', {
      volunteering,
      userId: user._id,
      user,
      isRegistered: false,
      past: false,
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterBtn}
        onPress={() => setFilterVisible(true)}
      >
        <Text style={styles.filterText}>🔍 סינון</Text>
      </TouchableOpacity>

      <FlatList
        data={filtered}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <VolunteerCard volunteering={item} onPress={handlePress} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            לא נמצאו התנדבויות פעילות שעומדות בקריטריונים
          </Text>
        }
      />

      <FilterVolunteeringModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={(newFilters) => setFilters(newFilters)}
        initialFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBtn: {
    alignSelf: 'center',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#007AFF',
    borderRadius: 40,
    width: '80%',
  },
  filterText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    writingDirection: 'ltr',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
