import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import config from '../../config';
import LeaderboardList from '../../components/LeaderboardList';

export default function CommunityLeaderboardScreen({ route, navigation }) {
  const { user } = route.params;

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [sortBy, setSortBy] = useState('minutes');
  const [loading, setLoading] = useState(false);

  const monthNames = [
    'ינואר',
    'פברואר',
    'מרץ',
    'אפריל',
    'מאי',
    'יוני',
    'יולי',
    'אוגוסט',
    'ספטמבר',
    'אוקטובר',
    'נובמבר',
    'דצמבר',
  ];
  const currentMonth = monthNames[new Date().getMonth()];

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const year = new Date().getFullYear();
      const month = new Date().getMonth();
      const sortParam = sortBy === 'count' ? 'count' : 'minutes';

      const endpoint = `/monthly-stats/leaderboard/${user.city._id}/${year}/${month}?sortBy=${sortParam}`;
      const res = await axios.get(`${config.SERVER_URL}${endpoint}`);
      setLeaderboardData(res.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>לוח מובילים לחודש {currentMonth}</Text>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            sortBy === 'minutes' && styles.activeFilterButton,
          ]}
          onPress={() => setSortBy('minutes')}
        >
          <Text
            style={[
              styles.filterText,
              sortBy === 'minutes' && styles.activeFilterText,
            ]}
          >
            לפי דקות
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            sortBy === 'count' && styles.activeFilterButton,
          ]}
          onPress={() => setSortBy('count')}
        >
          <Text
            style={[
              styles.filterText,
              sortBy === 'count' && styles.activeFilterText,
            ]}
          >
            לפי כמות
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          console.log('ערוך פרסים');

          navigation.navigate('CityMonthlyPrizesScreen', {
            user: user,
          });
        }}
      >
        <Text style={styles.editButtonText}>עריכת פרסים</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#7B1FA2"
          style={{ marginTop: 30 }}
        />
      ) : (
        <LeaderboardList
          data={leaderboardData}
          currentUserId={user._id}
          sortBy={sortBy === 'minutes' ? 'minutes' : 'count'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E5F5',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#4A148C',
  },
  filterRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    backgroundColor: '#D1C4E9',
  },
  activeFilterButton: {
    backgroundColor: '#7B1FA2',
  },
  filterText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4A148C',
  },
  activeFilterText: {
    color: 'white',
  },
  editButton: {
    alignSelf: 'center',
    backgroundColor: '#009688',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginBottom: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
