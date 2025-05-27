// OrgRepScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import theColor from '../../constants/theColor';
import UpdatingModal from '../../components/ErrorModal';
import ConfirmModal from '../../components/ConfirmModal';
import config from '../../config';

const OrgRepScreen = ({ route }) => {
  const { organization, mainorganization, user } = route.params;
  const navigation = useNavigation();

  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingText, setUpdatingText] = useState('');
  const [updatingModelVisual, setUpdatingModelVisual] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [repToDelete, setRepToDelete] = useState(null);

  useEffect(() => {
    const fetchReps = async () => {
      try {
        const response = await fetch(
          `${config.SERVER_URL}/auth/organization-reps?cityId=${user.city._id}&organizationId=${mainorganization._id}`
        );
        const data = await response.json();
        setReps(data);
      } catch (err) {
        console.error('שגיאה בטעינת אחראים:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReps();
  }, []);

  const handleDelete = (rep) => {
    setRepToDelete(rep);
    setConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!repToDelete) return;
    try {
      const response = await fetch(
        `${config.SERVER_URL}/auth/${repToDelete._id}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('מחיקה נכשלה');

      setReps((prev) => prev.filter((r) => r._id !== repToDelete._id));
      setUpdatingText('האחראי נמחק בהצלחה');
      setUpdatingModelVisual(true);
    } catch (err) {
      console.error('שגיאה במחיקה:', err);
      alert('אירעה שגיאה בעת מחיקת האחראי');
    } finally {
      setConfirmVisible(false);
      setRepToDelete(null);
    }
  };

  const renderItem = ({ item }) => {
    const name =
      item.firstName && item.lastName
        ? `${item.firstName} ${item.lastName}`
        : 'משתמש טרם הופעל לראשונה';

    return (
      <View style={styles.repItem}>
        <Text style={styles.repText}>{name}</Text>
        <TouchableOpacity onPress={() => handleDelete(item)}>
          <Ionicons name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>טוען רשימת אחראים...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>רשימת אחראי עמותה</Text>

      <Text style={styles.infoText}>
        מוצגים רק אחראי עמותות של העיר שלך ({user.city.name}) עבור העמותה הזו.
      </Text>

      <Text style={styles.warningText}>
        שים לב: עמותה שאין לה אחראי עמותה בעיר תיחשב לעמותה לא פעילה בעיר זו.
      </Text>

      <FlatList
        data={reps}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>אין אחראים רשומים</Text>
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('CreateOrganizationRepScreen', {
            cityName: user.city.name,
            organizationId: mainorganization._id,
            user,
            organizationName: organization.name,
          })
        }
      >
        <Ionicons name="person-add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>הוסף אחראי</Text>
      </TouchableOpacity>

      <UpdatingModal
        visible={updatingModelVisual}
        message={updatingText}
        onClose={() => setUpdatingModelVisual(false)}
      />

      <ConfirmModal
        visible={confirmVisible}
        title="אישור מחיקה"
        message={`האם אתה בטוח שברצונך למחוק את ${repToDelete?.firstName || ''} ${repToDelete?.lastName || ''}?
מחיקה זו בלתי הפיכה!`}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmVisible(false)}
        confirmColor="#e53935"
      />
    </View>
  );
};

export default OrgRepScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f7fa',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#444',
    textAlign: 'right',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'right',
    marginBottom: 15,
  },
  listContainer: {
    gap: 15,
  },
  repItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  repText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'right',
    flex: 1,
  },
  addButton: {
    backgroundColor: theColor.Green || '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 30,
    gap: 10,
    marginBottom: 40,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 16,
  },
});
