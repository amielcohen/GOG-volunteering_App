import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
} from 'react-native';
import config from '../../config';

export default function VolunteeringsHistoryScreen({ route }) {
  const { user } = route.params;
  const [volunteerings, setVolunteerings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${config.SERVER_URL}/volunteerings/history/byCityOfRep/${user._id}`)
      .then((res) => res.json())
      .then((data) => {
        setVolunteerings(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('שגיאה בשליפת היסטוריית התנדבויות:', err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (text) => {
    setSearch(text);
    const filteredData = volunteerings.filter((v) => {
      const titleMatch = v.title.toLowerCase().includes(text.toLowerCase());
      const dateMatch = new Date(v.date)
        .toLocaleDateString('he-IL')
        .includes(text);
      return titleMatch || dateMatch;
    });
    setFiltered(filteredData);
  };

  const renderItem = ({ item }) => (
    <Pressable onPress={() => setSelectedItem(item)}>
      <View style={styles.card}>
        <View style={styles.titleBox}>
          <Text style={styles.title}>{item.title}</Text>
        </View>
        <View style={styles.detailsBox}>
          <Text style={styles.detail}>
            {new Date(item.date).toLocaleDateString('he-IL')} 📅
          </Text>
          <Text style={styles.detail}>
            {new Date(item.date).toLocaleTimeString('he-IL', {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            ⏰
          </Text>
          <Text style={styles.detail}>📍 {item.address}</Text>
          <Text style={styles.detail}>
            מתנדבים מאושרים: {item.registeredVolunteers?.length || 0} /{' '}
            {item.maxParticipants || 'ללא הגבלה'}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const renderDetailsModal = () => {
    if (!selectedItem) return null;

    return (
      <Modal visible transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedItem.title}</Text>

              <Text style={styles.modalText}>
                תאריך: {new Date(selectedItem.date).toLocaleDateString('he-IL')}
              </Text>
              <Text style={styles.modalText}>
                שעה:{' '}
                {new Date(selectedItem.date).toLocaleTimeString('he-IL', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>

              <Text style={styles.modalText}>
                כתובת: {selectedItem.address}
              </Text>
              <Text style={styles.modalText}>
                משך בדקות: {selectedItem.durationMinutes}
              </Text>
              <Text style={styles.modalText}>
                תגמול: {selectedItem.reward || 0}%
              </Text>
              <Text style={styles.modalText}>
                מספר מתנדבים: {selectedItem.registeredVolunteers?.length || 0}
              </Text>

              <Text style={styles.modalText}>שמות מתנדבים:</Text>
              {selectedItem.registeredVolunteers?.map((v, i) => (
                <Text key={i} style={styles.modalSubItem}>
                  - {v.userId.firstName} {v.userId.lastName} -{' '}
                  {v.attended ? '✅ הגיע' : '❌ לא הגיע'}
                </Text>
              ))}

              <Pressable
                style={styles.closeButton}
                onPress={() => setSelectedItem(null)}
              >
                <Text style={styles.closeButtonText}>סגור</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="חפש לפי שם או תאריך (dd/mm/yyyy)..."
        style={styles.searchInput}
        value={search}
        onChangeText={handleSearch}
      />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000" />
          <Text>טוען היסטוריית התנדבויות...</Text>
        </View>
      ) : filtered.length ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
        />
      ) : (
        <View style={styles.centered}>
          <Text>לא נמצאו התנדבויות סגורות מהעבר.</Text>
        </View>
      )}
      {renderDetailsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    flex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    textAlign: 'right',
  },
  card: {
    backgroundColor: '#fdf7e3',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d4af37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  titleBox: {
    borderBottomWidth: 1,
    borderColor: '#d4af37',
    paddingBottom: 6,
    marginBottom: 10,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4e342e',
    textAlign: 'right',
  },
  detailsBox: {
    alignItems: 'flex-end',
    width: '100%',
  },
  detail: {
    fontSize: 14,
    color: '#3e3e3e',
    textAlign: 'right',
    marginBottom: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 6,
    textAlign: 'right',
  },
  modalSubItem: {
    fontSize: 14,
    textAlign: 'right',
    color: '#555',
  },
  closeButton: {
    backgroundColor: '#d4af37',
    marginTop: 20,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
