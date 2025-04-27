import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import OrganizationCard from '../../components/OrganizationCard';

import ErrorModal from '../../components/ErrorModal';
import ConfirmModal from '../../components/ConfirmModal';
import CustomToast from '../../components/CustomToast';

export default function AdminOrganizationScreen({ navigation }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false); //delete model
  const [orgToDelete, setOrgToDelete] = useState(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get('http://10.100.102.16:5000/organizations');
      setOrganizations(res.data);
    } catch (error) {
      Alert.alert('שגיאה', 'שגיאה בטעינת עמותות');
    } finally {
      setLoading(false);
    }
  };

  const requestDeleteOrg = (org) => {
    setOrgToDelete(org); // שומר את כל האובייקט
    setConfirmVisible(true);
  };

  const confirmDeleteOrg = async () => {
    if (!orgToDelete) return;

    try {
      await axios.delete(
        `http://10.100.102.16:5000/organizations/${orgToDelete._id}`
      );
      setToastMessage('העמותה נמחקה בהצלחה!');
      fetchOrganizations(); // מרענן את הרשימה
    } catch (error) {
      console.error('שגיאה במחיקת עמותה:', error);
      setErrorText({ title: 'שגיאה', message: 'שגיאה במחיקת עמותה' });
      setErrorVisible(true);
    } finally {
      setConfirmVisible(false);
      setOrgToDelete(null);
    }
  };

  const renderItem = ({ item }) => (
    <OrganizationCard
      organization={item}
      onPrimaryAction={() => requestDeleteOrg(item)} // לא רק id, אלא כל האובייקט
      onViewDetails={() => {}} // כרגע ריק אם אתה לא רוצה להציג פרטים
      primaryButtonLabel="מחק"
      viewDetailsLabel="פרטים"
    />
  );

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: 'center' }}
      />
    );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ניהול עמותות גלובליות</Text>

      <TextInput
        placeholder="חפש עמותה..."
        style={styles.search}
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: '#4CAF50', marginBottom: 20 },
        ]}
        onPress={() => navigation.navigate('AddOrganizationScreen')}
      >
        <Text style={styles.buttonText}>הוסף עמותה חדשה</Text>
      </TouchableOpacity>

      <FlatList
        data={organizations.filter((org) =>
          org.name.toLowerCase().includes(searchTerm.toLowerCase())
        )}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
      <ErrorModal
        visible={errorVisible}
        title={errorText.title}
        message={errorText.message}
        onClose={() => setErrorVisible(false)}
      />

      <ConfirmModal
        visible={confirmVisible}
        title="אישור מחיקה"
        message={`האם אתה בטוח שברצונך למחוק את העמותה "${orgToDelete?.name}"?`}
        onCancel={() => {
          setConfirmVisible(false);
          setOrgToDelete(null);
        }}
        onConfirm={confirmDeleteOrg}
        confirmText="מחק"
        cancelText="בטל"
        confirmColor="#d32f2f"
        cancelColor="#757575"
      />

      {toastMessage && (
        <CustomToast
          message={toastMessage}
          onHide={() => setToastMessage(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
