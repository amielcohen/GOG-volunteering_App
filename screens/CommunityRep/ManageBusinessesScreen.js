import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import config from '../../config';
import ErrorModal from '../../components/ErrorModal';
import ConfirmModal from '../../components/ConfirmModal';

export default function ManageBusinessesScreen({ route }) {
  const { user } = route.params;

  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredBusinesses(businesses);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredBusinesses(
        businesses.filter((b) =>
          b.locationDescription.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchText, businesses]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${config.SERVER_URL}/business-partners/by-city/${user.city._id}`
      );
      const data = await res.json();
      setBusinesses(data);
    } catch (err) {
      console.error('שגיאה בשליפת עסקים:', err);
      setErrorMessage('שגיאה בטעינת העסקים. אנא נסה שוב מאוחר יותר.');
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBusiness = async () => {
    if (!newLocation.trim()) {
      setErrorMessage('אנא הזן שם וכתובת עבור בית העסק.');
      setErrorModalVisible(true);
      return;
    }
    try {
      const res = await fetch(`${config.SERVER_URL}/business-partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: user.city._id,
          locationDescription: newLocation.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBusinesses((prev) => [data, ...prev]);
      setNewLocation('');
    } catch (err) {
      console.error('שגיאה בהוספה:', err);
      setErrorMessage(
        err.message || 'שגיאה בהוספת העסק. ייתכן שהעסק כבר קיים.'
      );
      setErrorModalVisible(true);
    }
  };

  const requestDelete = (item) => {
    setPendingDelete(item);
    setConfirmVisible(true);
  };

  const handleDelete = async () => {
    const { _id, locationDescription } = pendingDelete;
    try {
      const res = await fetch(
        `${config.SERVER_URL}/shop/checkPickUp/${user.city._id}`
      );
      const items = await res.json();
      if (!Array.isArray(items)) {
        throw new Error(
          'לא ניתן לבדוק קישור. השרת לא החזיר רשימת פריטים תקינה.'
        );
      }

      const used = items.find(
        (item) => item.pickupLocation === locationDescription
      );

      if (used) {
        setErrorMessage(
          'לא ניתן למחוק. יש מוצר שמקושר לעסק זה. יש למחוק או לערוך את המוצר קודם.'
        );
        setErrorModalVisible(true);
        setConfirmVisible(false);
        return;
      }

      const delRes = await fetch(
        `${config.SERVER_URL}/business-partners/${_id}`,
        {
          method: 'DELETE',
        }
      );
      const data = await delRes.json();
      if (!delRes.ok) throw new Error(data.error);
      setBusinesses((prev) => prev.filter((b) => b._id !== _id));
    } catch (err) {
      console.error('שגיאה במחיקה:', err);
      setErrorMessage(err.message || 'שגיאה במחיקת העסק.');
      setErrorModalVisible(true);
    } finally {
      setConfirmVisible(false);
      setPendingDelete(null);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={styles.container.backgroundColor}
      />

      <Text style={styles.title}>ניהול בתי עסק ב{user.city.name}</Text>

      <TextInput
        value={searchText}
        onChangeText={setSearchText}
        placeholder="חפש בית עסק..."
        placeholderTextColor="#C0C0C0"
        style={styles.searchInput}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={newLocation}
          onChangeText={setNewLocation}
          placeholder="שם בית העסק וכתובת מלאה"
          placeholderTextColor="#C0C0C0"
          style={styles.input}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddBusiness}>
          <Text style={styles.addButtonText}>הוסף</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#90EE90"
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={filteredBusinesses}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={() => (
            <Text style={styles.emptyListText}>
              {searchText
                ? 'לא נמצאו עסקים תואמים לחיפוש.'
                : 'עדיין אין עסקים רשומים. הוסף עסק חדש!'}
            </Text>
          )}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.locationText} numberOfLines={2}>
                {item.locationDescription}
              </Text>
              <TouchableOpacity
                onPress={() => requestDelete(item)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <ErrorModal
        visible={errorModalVisible}
        title="שגיאה"
        message={errorMessage}
        onClose={() => setErrorModalVisible(false)}
      />

      <ConfirmModal
        visible={confirmVisible}
        title="אישור מחיקה"
        message={`האם אתה בטוח שברצונך למחוק את העסק "${pendingDelete?.locationDescription}"? פעולה זו בלתי הפיכה.`}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2A3A',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    color: '#87CEFA',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  searchInput: {
    backgroundColor: '#E0FFFF',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ADD8E6',
    fontSize: 16,
    textAlign: 'right',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 25,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ADD8E6',
    backgroundColor: '#E0FFFF',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 10,
    fontSize: 16,
    textAlign: 'right',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  addButton: {
    backgroundColor: '#66CDAA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2E4053',
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  locationText: {
    color: '#F0F8FF',
    fontSize: 17,
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    fontSize: 22,
    color: '#FF6347',
  },
  emptyListText: {
    color: '#E0FFFF',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    fontStyle: 'italic',
  },
});
