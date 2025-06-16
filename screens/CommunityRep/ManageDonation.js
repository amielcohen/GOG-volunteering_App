// ManageDonation.js
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
import DonationSummaryModal from '../../components/DonationSummaryModal';

export default function ManageDonation({ route }) {
  const { user } = route.params;

  const [organizations, setOrganizations] = useState([]);
  const [donationCounts, setDonationCounts] = useState({});
  const [newName, setNewName] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState(null);
  const [donationSummaryVisible, setDonationSummaryVisible] = useState(false);
  const [currentDonations, setCurrentDonations] = useState([]);
  const [currentOrgName, setCurrentOrgName] = useState('');

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

      // Fetch donation counts for each organization
      const counts = {};
      for (const org of data) {
        const res = await fetch(
          `${config.SERVER_URL}/redeem-codes/donations-summary?cityId=${user.city._id}&donationTarget=${encodeURIComponent(org.name)}`
        );
        const donations = await res.json();
        counts[org.name] = donations.length;
      }
      setDonationCounts(counts);
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
        body: JSON.stringify({ city: user.city._id, name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOrganizations((prev) => [data, ...prev]);
      setDonationCounts((prev) => ({ ...prev, [data.name]: 0 }));
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

  const openDonationSummary = async (org) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${config.SERVER_URL}/redeem-codes/donations-summary?cityId=${user.city._id}&donationTarget=${encodeURIComponent(org.name)}`
      );
      const data = await res.json();
      setCurrentDonations(data);
      setCurrentOrgName(org.name);
      setDonationSummaryVisible(true);
    } catch (err) {
      console.error('שגיאה בהצגת תרומות:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDonations = async () => {
    try {
      await fetch(`${config.SERVER_URL}/redeem-codes/reset-donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: user.city._id,
          donationTarget: currentOrgName,
        }),
      });
      setDonationSummaryVisible(false);
    } catch (err) {
      console.error('שגיאה באיפוס:', err);
    }
  };

  const filtered = organizations
    .filter((org) => org.name.includes(search.trim()))
    .sort((a, b) => {
      const aCount = donationCounts[a.name] || 0;
      const bCount = donationCounts[b.name] || 0;
      return bCount - aCount;
    });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ניהול עמותות תרומה</Text>
      <Text style={styles.note}>
        עמותות שיש להן תרומות יסומנו בכחול ויופיעו ראשונות
      </Text>

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
          renderItem={({ item }) => {
            const hasDonations = (donationCounts[item.name] || 0) > 0;
            return (
              <TouchableOpacity
                onPress={() => openDonationSummary(item)}
                style={[
                  styles.itemRow,
                  hasDonations && { backgroundColor: '#3A5FCD' },
                ]}
              >
                <Text style={styles.name}>
                  {item.name} {hasDonations ? '⭐' : ''}
                </Text>
                <TouchableOpacity onPress={() => requestDelete(item)}>
                  <Text style={styles.deleteText}>❌</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
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
        message={`האם למחוק את "${selectedToDelete?.name}"?לאחר הפעולה מתנדבים לא יוכלו לתרום שוב לעמותה.`}
        onCancel={() => setConfirmModalVisible(false)}
        onConfirm={handleDelete}
      />

      <DonationSummaryModal
        visible={donationSummaryVisible}
        donations={currentDonations}
        onClose={() => setDonationSummaryVisible(false)}
        onReset={handleResetDonations}
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
    marginBottom: 10,
  },
  note: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 10,
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
