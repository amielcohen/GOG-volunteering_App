import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView, // Import ScrollView for the modal content
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
  const [rewards, setRewards] = useState([]);

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
  const year = new Date().getFullYear();
  const month = new Date().getMonth();

  useEffect(() => {
    fetchLeaderboard();
  }, [sortBy, scope]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
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

  const fetchRewards = async () => {
    try {
      const res = await axios.get(
        `${config.SERVER_URL}/monthly-prizes/${user.city._id}/${year}/${month}/${sortBy}`
      );
      setRewards(res.data);
    } catch (err) {
      console.error('Error loading rewards:', err);
      setRewards([]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>לוח מובילים לחודש {currentMonth}</Text>

      <View style={styles.filterContainer}>
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

      {scope === 'city' && (
        <TouchableOpacity
          style={[
            styles.rewardButton,
            { backgroundColor: theColor.TurquoiseBlue },
          ]}
          onPress={() => {
            fetchRewards();
            setShowRewards(true);
          }}
        >
          <Text style={styles.rewardButtonText}>הצג פרסים עירוניים</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#8A2BE2"
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
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalTitle}>
              פרסים חודשיים לפי {sortBy === 'minutes' ? 'דקות' : 'כמות'}
            </Text>

            <ScrollView style={modalStyles.rewardsScrollView}>
              {Array.isArray(rewards.prizes) && rewards.prizes.length > 0 ? (
                rewards.prizes.map((item) => (
                  <View
                    key={item.place}
                    style={modalStyles.rewardItemContainer}
                  >
                    <Text style={modalStyles.rewardPlaceText}>
                      מקום {item.place}:
                    </Text>
                    <Text style={modalStyles.rewardValueText}>
                      {item.value} גוגואים
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={modalStyles.noRewardsText}>
                  לא קיימים פרסים לחודש זה
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={modalStyles.closeButton}
              onPress={() => setShowRewards(false)}
            >
              <Text style={modalStyles.closeButtonText}>סגור</Text>
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
});

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent overlay
  },
  modalContent: {
    width: '85%', // Slightly wider modal
    backgroundColor: '#FFFFFF', // Clean white background
    borderRadius: 20, // More rounded corners
    padding: 25, // Increased padding
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6, // Deeper shadow for a more lifted look
    },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 15,
  },
  modalTitle: {
    fontSize: 24, // Larger title
    fontWeight: 'bold',
    color: '#4A148C', // Deep purple title
    marginBottom: 20, // More space below title
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  rewardsScrollView: {
    maxHeight: 300, // Limit height for scrollability if many prizes
    marginBottom: 20, // Space before the button
  },
  rewardItemContainer: {
    flexDirection: 'row-reverse', // RTL layout
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, // More vertical padding for items
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7F6', // Lighter, more subtle divider
  },
  rewardPlaceText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#673AB7', // Medium purple for place numbers
    writingDirection: 'rtl',
  },
  rewardValueText: {
    fontSize: 17,
    fontWeight: '700', // Bolder value text
    color: '#009688', // Teal for prize values
    writingDirection: 'rtl',
  },
  noRewardsText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#757575', // Gray for no data message
    textAlign: 'center',
    paddingVertical: 20,
    writingDirection: 'rtl',
  },
  closeButton: {
    backgroundColor: '#673AB7', // Primary purple for close button
    paddingVertical: 14,
    borderRadius: 15, // More rounded button
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  closeButtonText: {
    color: '#FFFFFF', // White text
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
