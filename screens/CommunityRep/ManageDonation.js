import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import config from '../../config';
import ErrorModal from '../../components/ErrorModal';
import ConfirmModal from '../../components/ConfirmModal';

export default function ManageDonation({ route }) {
  const { user } = route.params;

  const [organizations, setOrganizations] = useState([]);
  const [newName, setNewName] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${config.SERVER_URL}/donation-organizations/by-city/${user.city._id}`
      );
      const data = await res.json();
      setOrganizations(data);
    } catch (err) {
      console.error('שגיאה בשליפת עמותות:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch(`${config.SERVER_URL}/donation-organizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: user.city._id,
          name: newName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrganizations((prev) => [data, ...prev]);
      setNewName('');
    } catch (err) {
      console.error('שגיאה בהוספה:', err);
      setErrorMessage(err.message || 'שגיאה בהוספת עמותה');
      setErrorModalVisible(true);
    }
  };

  const requestDelete = (org) => {
    setSelectedToDelete(org);
    setConfirmModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${config.SERVER_URL}/donation-organizations/${selectedToDelete._id}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrganizations((prev) =>
        prev.filter((org) => org._id !== selectedToDelete._id)
      );
    } catch (err) {
      console.error('שגיאה במחיקה:', err);
      setErrorMessage(err.message || 'שגיאה במחיקת עמותה');
      setErrorModalVisible(true);
    } finally {
      setConfirmModalVisible(false);
      setSelectedToDelete(null);
    }
  };

  const filtered = organizations.filter((org) =>
    org.name.includes(search.trim())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ניהול עמותות תרומה</Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="חפש עמותה..."
        placeholderTextColor="#ccc"
        style={styles.input}
      />

      <View style={styles.row}>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="שם עמותה חדשה"
          placeholderTextColor="#ccc"
          style={[styles.input, { flex: 1 }]}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>הוסף</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#87CEEB" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.name}>{item.name}</Text>
              <TouchableOpacity onPress={() => requestDelete(item)}>
                <Text style={styles.deleteText}>❌</Text>
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
        visible={confirmModalVisible}
        title="אישור מחיקה"
        message={`האם למחוק את "${selectedToDelete?.name}"? הפעולה תהפוך את העמותה ללא פעילה.`}
        onCancel={() => setConfirmModalVisible(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#87CEEB',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#4682B4',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  itemRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2C2C5A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    color: 'white',
    fontSize: 16,
  },
  deleteText: {
    fontSize: 20,
    color: '#FF6B6B',
    paddingHorizontal: 10,
  },
});
