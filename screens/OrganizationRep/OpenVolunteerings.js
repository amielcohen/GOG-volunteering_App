// screens/OpenVolunteerings.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import config from '../../config';
import ConfirmModal from '../../components/ConfirmModal';

export default function OpenVolunteerings({ route }) {
  const { user } = route.params;
  const [volunteerings, setVolunteerings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVolunteering, setSelectedVolunteering] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    fetch(`${config.SERVER_URL}/volunteerings/attendance/${user._id}`)
      .then((res) => res.json())
      .then((data) => {
        setVolunteerings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('שגיאה בשליפת התנדבויות פתוחות:', err);
        setLoading(false);
      });
  }, []);

  const openAttendanceModal = (volunteering) => {
    const initialAttendance = {};
    volunteering.registeredVolunteers.forEach((v) => {
      if (v.status === 'approved') {
        initialAttendance[v.userId._id] = v.attended;
      }
    });
    setAttendanceMap(initialAttendance);
    setSelectedVolunteering(volunteering);
    setModalVisible(true);
  };

  const toggleAttendance = (userId) => {
    setAttendanceMap((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const saveAttendance = async () => {
    try {
      const res = await fetch(
        `${config.SERVER_URL}/volunteerings/${selectedVolunteering._id}/attendance`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attended: attendanceMap }),
        }
      );
      if (!res.ok) throw new Error('עדכון נכשל');
      setModalVisible(false);

      const refreshed = await fetch(
        `${config.SERVER_URL}/volunteerings/attendance/${user._id}`
      );
      const refreshedData = await refreshed.json();
      setVolunteerings(refreshedData);
    } catch (err) {
      console.error('שגיאה בעדכון נוכחות:', err);
    }
  };

  const closeVolunteering = async () => {
    try {
      const res = await fetch(
        `${config.SERVER_URL}/volunteerings/${selectedVolunteering._id}/close`,
        { method: 'PUT' }
      );
      if (!res.ok) throw new Error('סגירה נכשלה');
      setVolunteerings((prev) =>
        prev.filter((v) => v._id !== selectedVolunteering._id)
      );
      setSelectedVolunteering(null);
    } catch (err) {
      console.error('שגיאה בסגירת התנדבות:', err);
    } finally {
      setConfirmVisible(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Pressable onPress={() => openAttendanceModal(item)}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.detail}>
          {new Date(item.date).toLocaleString('he-IL')} 📅
        </Text>
        <Text style={styles.detail}>📍 {item.address}</Text>
      </Pressable>

      <View style={styles.actionsRow}>
        <Pressable
          style={styles.actionButton}
          onPress={() => openAttendanceModal(item)}
        >
          <Text style={styles.buttonText}>סמן נוכחות</Text>
        </Pressable>
        <Pressable
          style={styles.closeButton}
          onPress={() => {
            setSelectedVolunteering(item);
            setConfirmVisible(true);
          }}
        >
          <Text style={styles.buttonText}>סגור התנדבות</Text>
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>טוען התנדבויות פתוחות...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={volunteerings}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            נוכחות – {selectedVolunteering?.title}
          </Text>
          <ScrollView>
            {selectedVolunteering?.registeredVolunteers
              .filter((v) => v.status === 'approved')
              .map((v) => (
                <View key={v.userId._id} style={styles.volunteerRow}>
                  <Text style={styles.volunteerText}>
                    {v.userId.firstName} {v.userId.lastName}
                  </Text>
                  <Switch
                    value={Boolean(attendanceMap[v.userId._id])}
                    onValueChange={() => toggleAttendance(v.userId._id)}
                  />
                </View>
              ))}
          </ScrollView>

          <Pressable style={styles.saveButton} onPress={saveAttendance}>
            <Text style={styles.buttonText}>שמור נוכחות</Text>
          </Pressable>
          <Pressable
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>סגור</Text>
          </Pressable>
        </View>
      </Modal>

      <ConfirmModal
        visible={confirmVisible}
        title="אישור סגירה"
        message="סגירת ההתנדבות תנעל את האפשרות לערוך נוכחות. האם אתה בטוח?"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={closeVolunteering}
        confirmText="כן, סגור"
        cancelText="בטל"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure container takes full height
    padding: 16, // More generous padding for the whole screen
    backgroundColor: '#f8f8f8', // Light background for the screen
  },
  card: {
    backgroundColor: '#ffffff', // Clean white background for cards
    borderRadius: 12, // Slightly more rounded corners
    padding: 20, // Increased padding inside the card
    marginBottom: 16, // More space between cards
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 0, // Remove explicit border for a cleaner look
  },
  title: {
    fontSize: 20, // Slightly larger title
    fontWeight: '700', // Bolder title
    textAlign: 'right', // Align title to the right
    marginBottom: 8, // Space below title
    color: '#333', // Darker text for better contrast
  },
  detail: {
    fontSize: 15, // Slightly larger detail text
    textAlign: 'right', // Align details to the right
    marginTop: 4,
    color: '#555', // Softer color for detail text
  },
  actionsRow: {
    flexDirection: 'row-reverse', // Arrange buttons from right to left
    justifyContent: 'space-between', // Distribute space evenly between buttons
    marginTop: 20, // More space above buttons
    paddingTop: 15, // Padding above buttons to separate from details
    borderTopWidth: 1, // Add a subtle separator line
    borderColor: '#eee', // Light grey separator
  },
  actionButton: {
    backgroundColor: '#007bff', // Primary blue for action
    paddingVertical: 12, // Taller buttons
    paddingHorizontal: 18, // Wider buttons
    borderRadius: 8, // Rounded button corners
    flex: 1, // Allow button to take available space
    marginHorizontal: 4, // Small gap between buttons
  },
  closeButton: {
    backgroundColor: '#dc3545', // Red for destructive action (close)
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    color: '#ffffff', // White text for buttons
    textAlign: 'center',
    fontWeight: '600', // Medium bold text
    fontSize: 16, // Larger button text
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8', // Consistent background
  },
  modalContent: {
    flex: 1,
    padding: 25, // More generous padding for modal
    backgroundColor: '#f8f8f8', // Light background for modal
  },
  modalTitle: {
    fontSize: 24, // Larger modal title
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25, // More space below title
    color: '#333',
  },
  volunteerRow: {
    flexDirection: 'row-reverse', // Arrange volunteer details from right to left
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // More space between rows
    paddingVertical: 10, // Padding for each row
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0', // Lighter border for rows
    backgroundColor: '#fff', // White background for rows
    borderRadius: 8, // Slightly rounded rows
    shadowColor: '#000', // Subtle shadow for rows
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  volunteerText: {
    fontSize: 17, // Slightly larger volunteer name
    color: '#444',
  },
  modalButtons: {
    marginTop: 30, // More space above modal buttons
    flexDirection: 'column', // Stack buttons vertically
    alignItems: 'stretch', // Make buttons fill width
  },
  saveButton: {
    backgroundColor: '#28a745', // Green for save action
    paddingVertical: 14,
    borderRadius: 10, // More rounded save button
    marginTop: 20, // More space from bottom of list
  },
  cancelButton: {
    backgroundColor: '#6c757d', // Grey for cancel action
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10, // Space between save and cancel
  },
});
