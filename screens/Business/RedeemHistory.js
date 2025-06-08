import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import config from '../../config';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function RedeemHistory({ route }) {
  const { user } = route.params;
  const [history, setHistory] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `${config.SERVER_URL}/redeem-codes/business-history/${user.businessPartner._id}`
      );
      const data = await res.json();

      if (!Array.isArray(data)) {
        setHistory([]);
        setFiltered([]);
        return;
      }

      const sortedData = data.sort(
        (a, b) => new Date(b.redeemedAt) - new Date(a.redeemedAt)
      );
      setHistory(sortedData);
      setFiltered(sortedData);
    } catch (err) {
      setHistory([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    const filteredData = history.filter((entry) => {
      const nameMatch = entry.itemName
        .toLowerCase()
        .includes(search.toLowerCase());
      const dateMatch = date
        ? new Date(entry.redeemedAt).toDateString() === date.toDateString()
        : true;
      return nameMatch && dateMatch;
    });
    setFiltered(filteredData);
  }, [history, search, date]);

  useEffect(() => {
    applyFilters();
  }, [search, date, applyFilters]);

  const onDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.itemName}>{item.itemName}</Text>
        <Text style={styles.itemCode}>קוד: {item.code}</Text>
        <Text style={styles.date}>
          <Text style={{ fontWeight: 'bold' }}>תאריך מימוש:</Text>{' '}
          {new Date(item.redeemedAt).toLocaleString('he-IL')}
        </Text>
        {item.redeemedBy && (
          <Text style={styles.redeemedBy}>
            <Text style={{ fontWeight: 'bold' }}>מומש על ידי:</Text>{' '}
            {item.redeemedBy.firstName || 'משתמש לא ידוע'}
          </Text>
        )}
      </View>
      <Icon name="check-circle" size={30} color="#00E0FF" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A2B42" />

      <View style={styles.header}>
        <Text style={styles.title}> היסטוריית מימושים</Text>
      </View>

      <View style={styles.filtersContainer}>
        <TextInput
          placeholder="🔍 חפש לפי שם פריט"
          placeholderTextColor="#6A7B9B"
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
        >
          <Icon
            name="event"
            size={20}
            color="#1A2B42"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>
            {date ? `${date.toLocaleDateString('he-IL')}` : 'בחר תאריך מימוש'}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {date && (
          <TouchableOpacity
            onPress={() => setDate(null)}
            style={styles.clearDateButton}
          >
            <Text style={styles.clearButtonText}>איפוס תאריך</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00E0FF" style={styles.loader} />
      ) : filtered.length === 0 ? (
        <Text style={styles.emptyListText}>
          אין מימושים מתאימים לתאריך ולחיפוש שבחרת.
        </Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A52',
  },
  header: {
    width: '100%',
    backgroundColor: '#1A2B42',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 15,
  },
  title: {
    color: '#00E0FF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 224, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#2A445C',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: '100%',
    fontSize: 17,
    color: '#E0F2F7',
    marginBottom: 15,
    borderColor: 'rgba(0, 224, 255, 0.3)',
    borderWidth: 1,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    textAlign: 'right',
  },
  dateButton: {
    backgroundColor: '#00E0FF',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 10,
    shadowColor: 'rgba(0, 224, 255, 0.5)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  buttonText: {
    color: '#1A2B42',
    fontSize: 17,
    fontWeight: 'bold',
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  clearDateButton: {
    marginTop: 5,
    padding: 8,
    alignSelf: 'center',
  },
  clearButtonText: {
    color: '#A0D8F0',
    fontSize: 15,
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 224, 255, 0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  loader: {
    marginTop: 50,
  },
  emptyListText: {
    color: '#A0D8F0',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
    lineHeight: 25,
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#2A445C',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0, 224, 255, 0.2)',
  },
  cardContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00E0FF',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 224, 255, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  itemCode: {
    fontSize: 15,
    color: '#E0F2F7',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#A0D8F0',
    marginTop: 5,
  },
  redeemedBy: {
    fontSize: 14,
    color: '#A0D8F0',
    marginTop: 3,
  },
});
