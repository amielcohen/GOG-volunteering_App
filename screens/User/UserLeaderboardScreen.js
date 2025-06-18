import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import axios from 'axios';
import config from '../../config';
import LeaderboardList from '../../components/LeaderboardList';
import theColor from '../../constants/theColor';

export default function UserLeaderboardScreen({ route }) {
  const { user } = route.params;
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [sortBy, setSortBy] = useState('minutes'); // 'minutes' or 'count'
  const [scope, setScope] = useState('city'); // 'city' or 'national'
  const [loading, setLoading] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

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
  }, [sortBy, scope]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const year = new Date().getFullYear();
      const month = new Date().getMonth();
      const sortParam = sortBy === 'count' ? 'count' : 'minutes';

      const endpoint =
        scope === 'city'
          ? `/monthly-stats/leaderboard/${user.city._id}/${year}/${month}?sortBy=${sortParam}`
          : `/monthly-stats/leaderboard/all/${year}/${month}?sortBy=${sortParam}`;

      const res = await axios.get(`${config.SERVER_URL}${endpoint}`);
      setLeaderboardData(res.data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const rewards = Array.from({ length: 10 }, (_, i) => ({
    place: i + 1,
    reward: `פרס לדוגמה ${i + 1}`,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>לוח מובילים לחודש {currentMonth}</Text>

      <View style={styles.filterContainer}>
        {/* פילטר לפי דקות / כמות */}
        <View style={styles.filterGroupWrapper}>
          <Text style={styles.filterLabel}>מיין לפי:</Text>
          <View style={styles.filterGroup}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                sortBy === 'minutes' && styles.activeFilterButton,
              ]}
              onPress={() => setSortBy('minutes')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  sortBy === 'minutes' && styles.activeFilterButtonText,
                ]}
              >
                דקות
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
                  styles.filterButtonText,
                  sortBy === 'count' && styles.activeFilterButtonText,
                ]}
              >
                כמות
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* פילטר לפי עירוני / ארצי */}
        <View style={styles.filterGroupWrapper}>
          <Text style={styles.filterLabel}>הצג:</Text>
          <View style={styles.filterGroup}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                scope === 'city' && styles.activeFilterButton,
              ]}
              onPress={() => setScope('city')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  scope === 'city' && styles.activeFilterButtonText,
                ]}
              >
                עירוני
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                scope === 'national' && styles.activeFilterButton,
              ]}
              onPress={() => setScope('national')}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  scope === 'national' && styles.activeFilterButtonText,
                ]}
              >
                ארצי
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.rewardButton,
          { backgroundColor: theColor.TurquoiseBlue },
        ]}
        onPress={() => setShowRewards(true)}
      >
        <Text style={styles.rewardButtonText}> הצג פרסים עירוניים</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#8A2BE2" // סגול עמוק
          style={{ marginTop: 30 }}
        />
      ) : (
        <LeaderboardList
          data={leaderboardData}
          currentUserId={user._id}
          sortBy={sortBy === 'minutes' ? 'minutes' : 'count'}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showRewards}
        onRequestClose={() => setShowRewards(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>פרסים חודשיים</Text>
            {rewards.map((item) => (
              <Text key={item.place} style={styles.rewardItem}>
                מקום {item.place}: {item.reward}
              </Text>
            ))}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowRewards(false)}
            >
              <Text style={styles.closeModalButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE5EC',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    color: '#880E4F',
  },
  filterContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  filterGroupWrapper: {
    alignItems: 'center',
    minWidth: 130,
  },
  filterLabel: {
    fontSize: 14,
    color: '#D81B60',
    marginBottom: 8,
    fontWeight: '600',
  },
  filterGroup: {
    flexDirection: 'row-reverse',
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#C2185B',
    overflow: 'hidden',
    backgroundColor: '#FCE4EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8BBD0',
    minWidth: 70,
  },
  activeFilterButton: {
    backgroundColor: '#D81B60',
  },
  filterButtonText: {
    color: '#880E4F',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  activeFilterButtonText: {
    color: 'white',
  },
  rewardButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  rewardButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  rewardItem: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  closeModalButton: {
    backgroundColor: '#FF5722',
    marginTop: 20,
    padding: 12,
    borderRadius: 15,
  },
  closeModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
