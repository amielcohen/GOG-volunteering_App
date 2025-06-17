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
  Alert,
} from 'react-native';
import config from '../../config';
import ConfirmModal from '../../components/ConfirmModal';

export default function FutureVolunteeringsScreen({ route }) {
  const { user } = route.params;
  const [volunteerings, setVolunteerings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVolunteeringId, setSelectedVolunteeringId] = useState(null);
  const [confirmCancelSingleVisible, setConfirmCancelSingleVisible] =
    useState(false);

  const [recurringVols, setRecurringVols] = useState([]);
  const [recurringVisible, setRecurringVisible] = useState(false);
  const [loadingRecurring, setLoadingRecurring] = useState(false);
  const [selectedRecurringVolId, setSelectedRecurringVolId] = useState(null);
  const [confirmCancelRecurringVisible, setConfirmCancelRecurringVisible] =
    useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const daysOfWeekHebrew = [
    'ראשון',
    'שני',
    'שלישי',
    'רביעי',
    'חמישי',
    'שישי',
    'שבת',
  ];

  useEffect(() => {
    fetch(
      `${config.SERVER_URL}/volunteerings/future/open/byCityOfRep/${user._id}`
    )
      .then((res) => res.json())
      .then((data) => {
        setVolunteerings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('שגיאה בשליפת התנדבויות עתידיות:', err);
        setLoading(false);
      });
  }, []);

  const handleCancelSingleVolunteering = async () => {
    try {
      const res = await fetch(
        `${config.SERVER_URL}/volunteerings/${selectedVolunteeringId}/cancel`,
        {
          method: 'PUT',
        }
      );
      if (res.ok) {
        setVolunteerings((prev) =>
          prev.filter((v) => v._id !== selectedVolunteeringId)
        );
      } else {
        Alert.alert('שגיאה', 'ביטול ההתנדבות נכשל.');
      }
    } catch (err) {
      console.error('שגיאה בביטול התנדבות:', err);
      Alert.alert('שגיאה', 'אירעה שגיאה בביטול ההתנדבות.');
    } finally {
      setConfirmCancelSingleVisible(false);
      setSelectedVolunteeringId(null);
    }
  };

  const handleRemoveRecurringConfirmation = (id) => {
    setSelectedRecurringVolId(id);
    setConfirmCancelRecurringVisible(true);
  };

  const handleRemoveRecurring = async () => {
    try {
      const res = await fetch(
        `${config.SERVER_URL}/volunteerings/${selectedRecurringVolId}/removeRecurring`,
        {
          method: 'PUT',
        }
      );
      if (res.ok) {
        setRecurringVols((prev) =>
          prev.filter((v) => v._id !== selectedRecurringVolId)
        );
      } else {
        Alert.alert('שגיאה', 'לא ניתן להסיר את הקביעות.');
      }
    } catch (err) {
      console.error('שגיאה בהסרת קביעות:', err);
      Alert.alert('שגיאה', 'אירעה שגיאה בהסרת הקביעות.');
    } finally {
      setConfirmCancelRecurringVisible(false);
      setSelectedRecurringVolId(null);
    }
  };

  const loadRecurringVols = async () => {
    setLoadingRecurring(true);
    try {
      const res = await fetch(
        `${config.SERVER_URL}/volunteerings/recurring/byRep/${user._id}`
      );
      const data = await res.json();
      setRecurringVols(data);
      setRecurringVisible(true);
    } catch (err) {
      console.error('שגיאה בשליפת התנדבויות קבועות:', err);
      Alert.alert('שגיאה', 'אירעה שגיאה בטעינת התנדבויות קבועות.');
    } finally {
      setLoadingRecurring(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.titleBox}>
        <Text style={styles.title}>{item.title}</Text>
      </View>
      <View style={styles.detailsBox}>
        <Text style={styles.detail}>
          {new Date(item.date).toLocaleDateString('he-IL')}{' '}
          <Text style={styles.icon}>📅</Text>
        </Text>
        <Text style={styles.detail}>
          {new Date(item.date).toLocaleTimeString('he-IL', {
            hour: '2-digit',
            minute: '2-digit',
          })}{' '}
          <Text style={styles.icon}>⏰</Text>
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.icon}>📍</Text>
          {item.address}
        </Text>
        <Text style={styles.detail}>
          מתנדבים מאושרים: {item.registeredVolunteers?.length || 0} /{' '}
          {item.maxParticipants || 'ללא הגבלה'}{' '}
          <Text style={styles.icon}>👥</Text>
        </Text>
      </View>
      <View style={styles.buttonRow}>
        <Pressable
          style={styles.viewButton}
          onPress={() => setSelectedItem(item)}
        >
          <Text style={styles.cancelButtonText}>צפייה במתנדבים</Text>
        </Pressable>

        <Pressable
          style={styles.cancelButton}
          onPress={() => {
            setSelectedVolunteeringId(item._id);
            setConfirmCancelSingleVisible(true);
          }}
        >
          <Text style={styles.cancelButtonText}>ביטול התנדבות</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.manageRecurringButton}
        onPress={loadRecurringVols}
      >
        <Text style={styles.manageRecurringText}>ניהול התנדבויות קבועות</Text>
      </Pressable>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={styles.loadingText}>טוען התנדבויות עתידיות...</Text>
        </View>
      ) : volunteerings.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>
            לא נמצאו התנדבויות פתוחות עתידיות.
          </Text>
        </View>
      ) : (
        <FlatList
          data={volunteerings}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <ConfirmModal
        visible={confirmCancelSingleVisible}
        title="אישור ביטול התנדבות"
        message="האם אתה בטוח שברצונך לבטל את ההתנדבות הזו? פעולה זו בלתי הפיכה."
        onCancel={() => setConfirmCancelSingleVisible(false)}
        onConfirm={handleCancelSingleVolunteering}
        confirmText="כן, בטל"
        cancelText="חזור"
      />

      <Modal
        visible={recurringVisible}
        animationType="slide"
        onRequestClose={() => setRecurringVisible(false)}
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { alignItems: 'stretch' }]}>
          <Text style={styles.modalTitle}>התנדבויות קבועות</Text>
          {loadingRecurring ? (
            <View style={styles.centeredModalContent}>
              <ActivityIndicator size="large" color="#4a90e2" />
            </View>
          ) : recurringVols.length === 0 ? (
            <View style={styles.centeredModalContent}>
              <Text style={styles.emptyText}>לא נמצאו התנדבויות קבועות.</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={[
                styles.scrollViewContent,
                { alignItems: 'stretch' },
              ]}
            >
              {recurringVols.map((v) => (
                <View
                  key={v._id}
                  style={[styles.recurringCard, { alignSelf: 'stretch' }]}
                >
                  <Text style={styles.recurringCardTitle}>{v.title}</Text>
                  <View style={styles.recurringCardDetails}>
                    <Text style={styles.recurringCardDetail}>
                      <Text style={styles.icon}>📍</Text>
                      {v.address}
                    </Text>
                    <Text style={styles.recurringCardDetail}>
                      <Text style={styles.icon}>🗓️ </Text>
                      יום קבוע: {daysOfWeekHebrew[v.recurringDay]}{' '}
                    </Text>
                    <Text style={styles.recurringCardDetail}>
                      {new Date(v.date).toLocaleTimeString('he-IL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      <Text style={styles.icon}>⏰</Text>
                    </Text>
                  </View>
                  <Pressable
                    style={styles.cancelButton}
                    onPress={() => handleRemoveRecurringConfirmation(v._id)}
                  >
                    <Text style={styles.cancelButtonText}>בטל קביעות</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
          <Pressable
            style={styles.closeModalButton}
            onPress={() => setRecurringVisible(false)}
          >
            <Text style={styles.closeModalButtonText}>סגור</Text>
          </Pressable>
        </View>
      </Modal>
      <Modal
        visible={!!selectedItem}
        animationType="slide"
        onRequestClose={() => setSelectedItem(null)}
        presentationStyle="pageSheet"
      >
        <ScrollView contentContainerStyle={styles.detailsModalContainer}>
          <Text style={styles.detailsModalTitle}>{selectedItem?.title}</Text>

          <View style={styles.detailsModalSection}>
            <Text style={styles.detailsModalSubtitle}>
              מספר מתנדבים: {selectedItem?.registeredVolunteers?.length || 0} /{' '}
              {selectedItem?.maxParticipants || 'ללא הגבלה'}
            </Text>
          </View>

          <View style={styles.detailsModalSection}>
            <Text style={styles.detailsModalSubtitle}>שמות מתנדבים:</Text>
            {selectedItem?.registeredVolunteers?.length === 0 ? (
              <Text style={styles.detailsModalEmpty}>
                אין מתנדבים רשומים להתנדבות זו עדיין.
              </Text>
            ) : (
              selectedItem?.registeredVolunteers?.map((v, i) => (
                <View key={i} style={styles.detailsModalListItemContainer}>
                  <Text style={styles.detailsModalListItem}>
                    {i + 1}. {v.userId.firstName} {v.userId.lastName}
                  </Text>
                  {i < selectedItem.registeredVolunteers.length - 1 && (
                    <View style={styles.detailsModalListDivider} />
                  )}
                </View>
              ))
            )}
          </View>

          <Pressable
            style={styles.detailsModalCloseButton}
            onPress={() => setSelectedItem(null)}
          >
            <Text style={styles.detailsModalCloseButtonText}>סגור</Text>
          </Pressable>
        </ScrollView>
      </Modal>
      <ConfirmModal
        visible={confirmCancelRecurringVisible}
        title="אישור ביטול קביעות"
        message={
          <>
            האם אתה בטוח שברצונך לבטל קביעות של התנדבות זו?{'\n'}
            ביטול הקביעות לא ימחק התנדבויות קיימות
          </>
        }
        onCancel={() => setConfirmCancelRecurringVisible(false)}
        onConfirm={handleRemoveRecurring}
        confirmText="כן, בטל קביעות"
        cancelText="חזור"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    paddingHorizontal: 18,
    paddingTop: 25,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E8EDF2',
    shadowColor: '#AAB8C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  titleBox: {
    borderBottomWidth: 1,
    borderColor: '#DDE6ED',
    paddingBottom: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'right',
  },
  detailsBox: {
    alignItems: 'flex-end',
    width: '100%',
  },
  detail: {
    fontSize: 16,
    color: '#34495E',
    textAlign: 'right',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
    fontSize: 18,
    color: '#7F8C8D',
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 17,
    color: '#667788',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 17,
    color: '#8899AA',
    textAlign: 'center',
    lineHeight: 24,
  },
  manageRecurringButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginBottom: 30,
    alignSelf: 'center',
    shadowColor: '#346DAE',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  manageRecurringText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F8FA',
    padding: 25,
    paddingTop: 60,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
    textAlign: 'center',
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingBottom: 30,
    width: '100%',
  },
  centeredModalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: '#7F8C8D',
    paddingVertical: 12,
    paddingHorizontal: 45,
    borderRadius: 10,
    shadowColor: '#607080',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
    alignSelf: 'center',
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  recurringCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E8EDF2',
    shadowColor: '#AAB8C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '95%',
  },
  recurringCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'right',
    borderBottomWidth: 1,
    borderColor: '#DDE6ED',
    paddingBottom: 10,
    marginBottom: 15,
    width: '100%',
  },
  recurringCardDetails: {
    alignItems: 'flex-end',
    width: '100%',
  },
  recurringCardDetail: {
    fontSize: 16,
    color: '#34495E',
    textAlign: 'right',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 15,
    paddingLeft: 10,
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    shadowColor: '#C0392B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewButton: {
    marginTop: 20,
    backgroundColor: '#451274',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    shadowColor: '#C0392B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalText: {
    fontSize: 16,
    color: '#34495E',
    textAlign: 'right',
    marginBottom: 10,
  },
  modalSubItem: {
    fontSize: 15,
    color: '#2C3E50',
    textAlign: 'right',
    marginBottom: 5,
  },
  detailsModalContainer: {
    flexGrow: 1,
    backgroundColor: '#F5F8FA',
    padding: 25,
    paddingTop: 60,
    alignItems: 'center',
  },
  detailsModalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
    textAlign: 'center',
    width: '100%',
  },
  detailsModalSection: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#AAB8C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'flex-end',
  },
  detailsModalSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 15,
    textAlign: 'right',
    width: '100%',
  },
  detailsModalListItemContainer: {
    width: '100%',
    alignItems: 'flex-end',
    paddingVertical: 8,
  },
  detailsModalListItem: {
    fontSize: 18,
    color: '#4A5C6E',
    textAlign: 'right',
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  detailsModalListDivider: {
    height: 1,
    backgroundColor: '#E8EDF2',
    width: '90%',
    alignSelf: 'center',
    marginTop: 5,
  },
  detailsModalEmpty: {
    fontSize: 18,
    color: '#8899AA',
    textAlign: 'center',
    marginTop: 10,
    width: '100%',
  },
  detailsModalCloseButton: {
    marginTop: 40,
    backgroundColor: '#607080',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: '#4A5C6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    alignSelf: 'center',
  },
  detailsModalCloseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
