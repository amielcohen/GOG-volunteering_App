// גרסה מתוקנת ומלאה של ManageBusinessesScreen בהתאם למודל החדש של BusinessPartner

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
  Modal,
  Alert,
} from 'react-native';
import config from '../../config';
import ErrorModal from '../../components/ErrorModal';
import ConfirmModal from '../../components/ConfirmModal';

export default function ManageBusinessesScreen({ route }) {
  const { user } = route.params;

  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
          b.locationDescription?.toLowerCase().includes(lower)
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

  const generateRandomCredentials = async () => {
    const genUser = () => 'biz' + Math.floor(1000 + Math.random() * 9000);
    const genPass = () => Math.random().toString(36).slice(-8);

    let tempUsername;
    let tries = 0;

    while (true) {
      tempUsername = genUser();
      const res = await fetch(
        `${config.SERVER_URL}/auth/checkUsername?username=${tempUsername}`
      );
      const json = await res.json();

      if (!json.exists) break;
      if (++tries > 10)
        return Alert.alert('שגיאה', 'לא הצלחנו להגריל שם משתמש');
    }

    setUsername(tempUsername);
    setPassword(genPass());
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setErrorModalVisible(true);
  };

  const handleCreateBusiness = async () => {
    if (!businessName.trim()) return showError('יש להזין שם עסק');
    if (!address.trim()) return showError('יש להזין כתובת');
    if (!username) return showError('יש להזין שם משתמש');
    if (!password) return showError('יש להזין סיסמה');
    if (password.length < 6)
      return showError('הסיסמה חייבת להכיל לפחות 6 תווים');

    try {
      const res = await fetch(
        `${config.SERVER_URL}/auth/create-business-partner`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: businessName.trim(),
            address: address.trim(),
            city: user.city._id,
            username,
            password,
          }),
        }
      );

      const text = await res.text();
      const data = JSON.parse(text);

      if (!res.ok) throw new Error(data.message || 'שגיאה בהוספת בית העסק');

      setBusinesses((prev) => [data.businessPartner, ...prev]);
      setBusinessName('');
      setAddress('');
      setUsername('');
      setPassword('');
      setCreateModalVisible(false);
    } catch (err) {
      console.error('שגיאה בהוספת עסק:', err);
      showError(err.message || 'שגיאה בלתי צפויה');
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
        showError(
          'לא ניתן למחוק. יש מוצר שמקושר לעסק זה. יש למחוק או לערוך את המוצר קודם.'
        );
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
      showError(err.message || 'שגיאה במחיקת העסק.');
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

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setCreateModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ הוסף בית עסק</Text>
      </TouchableOpacity>

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
                {`${item.businessName} - ${item.address}`}
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

      {/* מודל יצירה */}
      <Modal visible={createModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>הוסף בית עסק חדש</Text>

            <TextInput
              placeholder="שם בית העסק"
              value={businessName}
              onChangeText={setBusinessName}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="כתובת"
              value={address}
              onChangeText={setAddress}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="שם משתמש"
              value={username}
              onChangeText={setUsername}
              style={styles.modalInput}
            />
            <TextInput
              placeholder="סיסמה"
              value={password}
              onChangeText={setPassword}
              style={styles.modalInput}
            />

            <TouchableOpacity
              style={styles.randomButton}
              onPress={generateRandomCredentials}
            >
              <Text style={styles.randomButtonText}>🎲 הגרל שם וסיסמה</Text>
            </TouchableOpacity>

            <View
              style={{
                flexDirection: 'row-reverse',
                justifyContent: 'space-between',
                marginTop: 15,
              }}
            >
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={handleCreateBusiness}
              >
                <Text style={styles.modalConfirmText}>צור</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>ביטול</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  },
  addButton: {
    backgroundColor: '#66CDAA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    textAlign: 'right',
  },
  randomButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  randomButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalConfirm: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
  },
  modalCancel: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
  },
  modalConfirmText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalCancelText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
