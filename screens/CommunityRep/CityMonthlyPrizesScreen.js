import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import axios from 'axios';
import config from '../../config';

export default function CityMonthlyPrizesScreen({ route }) {
  const { user } = route.params;
  const [rewardsData, setRewardsData] = useState({
    minutes: null,
    count: null,
  });
  const [editType, setEditType] = useState(null); // 'minutes' or 'count'
  const [editRewards, setEditRewards] = useState(Array(10).fill(''));
  const [modalVisible, setModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    title: '',
    message: '',
    type: '',
  });
  const [activeTab, setActiveTab] = useState('minutes'); // 'minutes' or 'count'

  const year = new Date().getFullYear();
  const month = new Date().getMonth(); // 0-based index
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
  const currentMonthName = monthNames[month];

  useEffect(() => {
    fetchRewards('minutes');
    fetchRewards('count');
  }, []);

  const fetchRewards = async (type) => {
    try {
      const res = await axios.get(
        `${config.SERVER_URL}/monthly-prizes/${user.city._id}/${year}/${month}/${type}`
      );
      setRewardsData((prev) => ({ ...prev, [type]: res.data }));
    } catch (err) {
      setRewardsData((prev) => ({ ...prev, [type]: null }));
    }
  };

  const openEditModal = (type) => {
    const values =
      rewardsData[type]?.prizes?.map((p) => p.value.toString()) ||
      Array(10).fill('');
    setEditRewards(values);
    setEditType(type);
    setModalVisible(true);
  };

  const showStatusModal = (title, message, type) => {
    setStatusMessage({ title, message, type });
    setStatusModalVisible(true);
  };

  const handleSave = async () => {
    const payload = {
      prizes: editRewards.map((val, index) => ({
        place: index + 1,
        type: 'gog', // Assuming 'gog' is the fixed type
        value: Number(val) || 0,
      })),
    };

    try {
      if (rewardsData[editType]?._id) {
        await axios.put(
          `${config.SERVER_URL}/monthly-prizes/${rewardsData[editType]._id}`,
          payload
        );
      } else {
        await axios.post(`${config.SERVER_URL}/monthly-prizes`, {
          city: user.city._id,
          month,
          year,
          type: editType,
          ...payload,
        });
      }

      showStatusModal('הצלחה', 'הפרסים נשמרו בהצלחה!', 'success');
      fetchRewards(editType);
      setModalVisible(false);
    } catch (err) {
      console.error('Error saving prizes:', err.message);
      showStatusModal(
        'שגיאה',
        'אירעה שגיאה בעת שמירת הפרסים. אנא נסה שוב.',
        'error'
      );
    }
  };

  const renderPrizeList = (type) => {
    const data = rewardsData[type];
    const sectionTitleText =
      type === 'minutes' ? 'פרסים לפי דקות' : 'פרסים לפי כמות התנדבויות';

    return (
      <View style={styles.prizeSection}>
        <Text style={styles.sectionTitle}>{sectionTitleText}</Text>
        {data && Array.isArray(data.prizes) && data.prizes.length > 0 ? (
          data.prizes.map((reward, i) => (
            <View key={i} style={styles.prizeItemContainer}>
              <Text style={styles.prizePlaceText}>מקום {reward.place}:</Text>
              <Text style={styles.prizeValueText}>{reward.value} גוגואים</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noData}>לא הוגדרו פרסים לחודש זה</Text>
        )}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(type)}
        >
          <Text style={styles.editButtonText}>ערוך פרסים</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        ניהול פרסי העיר לחודש {currentMonthName}
      </Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'minutes' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('minutes')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'minutes' && styles.activeTabButtonText,
            ]}
          >
            פרסים לפי דקות
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'count' && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab('count')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'count' && styles.activeTabButtonText,
            ]}
          >
            פרסים לפי כמות
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'minutes' && renderPrizeList('minutes')}
        {activeTab === 'count' && renderPrizeList('count')}
      </ScrollView>

      {/* Modal for editing prizes */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              עריכת פרסים ({editType === 'minutes' ? 'דקות' : 'כמות'})
            </Text>
            <ScrollView style={styles.inputScrollContainer}>
              {editRewards.map((val, i) => (
                <View key={i} style={styles.inputRow}>
                  <Text style={styles.inputLabel}>מקום {i + 1}:</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={val}
                    onChangeText={(text) =>
                      setEditRewards((prev) => {
                        const copy = [...prev];
                        copy[i] = text;
                        return copy;
                      })
                    }
                    placeholder="הכנס מספר"
                    textAlign="right" // For RTL input
                  />
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>שמור</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>ביטול</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for status messages (success/error) */}
      <Modal
        visible={statusModalVisible}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.statusModalView,
              statusMessage.type === 'success'
                ? styles.successModal
                : styles.errorModal,
            ]}
          >
            <Text style={styles.statusModalTitle}>{statusMessage.title}</Text>
            <Text style={styles.statusModalMessage}>
              {statusMessage.message}
            </Text>
            <TouchableOpacity
              style={[
                styles.statusModalButton,
                statusMessage.type === 'success'
                  ? styles.successButton
                  : styles.errorButton,
              ]}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.statusModalButtonText}>אישור</Text>
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
    backgroundColor: '#F7F2F8', // רקע בהיר ונעים
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 25,
    color: '#6A1B9A', // סגול עמוק לכותרת
    writingDirection: 'rtl', // תמיכה מפורשת בעברית
  },
  tabContainer: {
    flexDirection: 'row-reverse', // כפתורים מימין לשמאל
    justifyContent: 'center',
    marginBottom: 20,
    marginHorizontal: 16,
    backgroundColor: '#E1BEE7', // רקע בהיר לטאבים
    borderRadius: 30,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: 'transparent', // כפתור לא פעיל שקוף
  },
  activeTabButton: {
    backgroundColor: '#9C27B0', // סגול בוהק לטאב פעיל
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6A1B9A', // טקסט סגול לטאב לא פעיל
    writingDirection: 'rtl',
  },
  activeTabButtonText: {
    color: '#FFFFFF', // טקסט לבן לטאב פעיל
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  prizeSection: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#FFFFFF', // רקע לבן לכרטיסים
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8, // צל בולט יותר
    borderRightWidth: 5, // פס צבעוני בצד ימין
    borderColor: '#AB47BC', // סגול לילך לכרטיסים
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#6A1B9A', // סגול כהה
    textAlign: 'right', // יישור לימין
    writingDirection: 'rtl',
  },
  prizeItemContainer: {
    flexDirection: 'row-reverse', // RTL
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6FA', // קו הפרדה עדין
  },
  prizePlaceText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4A148C', // סגול כהה לטקסט מקום
    writingDirection: 'rtl',
  },
  prizeValueText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#00838F', // כחול-ירוק לערך הפרס
    writingDirection: 'rtl',
  },
  noData: {
    fontSize: 16,
    color: '#9E9E9E', // אפור
    marginBottom: 10,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  editButton: {
    marginTop: 20,
    backgroundColor: '#9C27B0', // סגול בוהק לכפתור עריכה
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30, // כפתור עגול יותר
    alignSelf: 'flex-end', // יישור לימין
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  editButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    writingDirection: 'rtl',
  },

  // --- Modal Styles (Edit Prizes) ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', // רקע שחור שקוף
  },
  modalView: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6A1B9A',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  inputScrollContainer: {
    maxHeight: 300, // גובה מקסימלי לגלילה אם יש הרבה מקומות
    marginBottom: 15,
  },
  inputRow: {
    flexDirection: 'row-reverse', // RTL
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    width: 80,
    fontSize: 17,
    color: '#424242',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#BDBDBD', // אפור בהיר
    borderRadius: 10,
    padding: 12,
    marginRight: 10, // רווח מימין לתווית
    fontSize: 16,
    color: '#333',
    textAlign: 'right', // יישור ימני בתוך השדה
    writingDirection: 'rtl',
  },
  modalActions: {
    flexDirection: 'column', // כפתורים אחד מתחת לשני
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50', // ירוק לשמירה
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  cancelButton: {
    backgroundColor: '#E53935', // אדום לביטול
    padding: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    writingDirection: 'rtl',
  },

  // --- Status Modal Styles (Success/Error) ---
  statusModalView: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  successModal: {
    borderColor: '#4CAF50', // ירוק להצלחה
    borderWidth: 2,
  },
  errorModal: {
    borderColor: '#E53935', // אדום לשגיאה
    borderWidth: 2,
  },
  statusModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    writingDirection: 'rtl',
    color: '#333',
  },
  statusModalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
    writingDirection: 'rtl',
  },
  statusModalButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  successButton: {
    backgroundColor: '#4CAF50', // ירוק
  },
  errorButton: {
    backgroundColor: '#E53935', // אדום
  },
  statusModalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    writingDirection: 'rtl',
  },
});
