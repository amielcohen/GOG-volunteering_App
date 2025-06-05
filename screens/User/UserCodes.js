import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  I18nManager,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import config from '../../config';

if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
  I18nManager.allowRTL(true);
}

const { width } = Dimensions.get('window');

export default function UserCodes({ route }) {
  const { user } = route.params;

  const [codes, setCodes] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedCode, setSelectedCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserCodes();
  }, [statusFilter]);

  const fetchUserCodes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${config.SERVER_URL}/redeem-codes/user/${user._id}?status=${statusFilter}`
      );
      const data = await res.json();
      setCodes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('שגיאה בטעינת הקודים:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCode = (code) => {
    if (!code || typeof code !== 'string') return '—';
    return code.match(/.{1,4}/g).join(' ');
  };

  const calculateExpiryDate = (createdAt) => {
    if (!createdAt) return null;
    const createdDate = new Date(createdAt);
    const expiryDate = new Date(
      createdDate.setDate(createdDate.getDate() + 30)
    );
    return expiryDate;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>ההזמנות שלי</Text>
      </View>

      <View style={styles.filterContainer}>
        {[
          { key: 'pending', text: 'קודים פעילים' },
          { key: 'redeemed', text: 'מתנות שמומשו' },
          { key: 'expired', text: 'קודים שפג תוקפם' },
        ].map((status) => (
          <TouchableOpacity
            key={status.key}
            style={[
              styles.filterButton,
              statusFilter === status.key && styles.activeFilter,
              { width: (width - 40 - 20) / 3 },
            ]}
            onPress={() => {
              setSelectedCode(null);
              setStatusFilter(status.key);
            }}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === status.key && styles.activeFilterText,
              ]}
            >
              {status.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {isLoading ? (
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#87CEEB" />
            <Text style={styles.emptyText}>טוען נתונים...</Text>
          </View>
        ) : codes.length === 0 ? (
          <Text style={styles.emptyText}>
            לא נמצאו קודים להצגה בקטגוריה זו.
          </Text>
        ) : (
          codes.map((entry) => (
            <TouchableOpacity
              key={entry._id}
              style={[
                styles.itemCard,
                entry.status === 'redeemed' && styles.redeemedCard,
                entry.status === 'expired' && styles.expiredCard,
                (entry.item?.deliveryType || entry.deliveryType) ===
                  'donation' && styles.donationCard,
              ]}
              onPress={() => setSelectedCode(entry)}
            >
              <Text style={styles.itemTitle}>
                {entry.item?.name || entry.itemName || 'מוצר לא ידוע'}
              </Text>

              {(entry.item?.deliveryType || entry.deliveryType) !==
                'donation' && (
                <>
                  <Text style={styles.itemCodeLabel}>קוד המימוש שלך:</Text>
                  <Text style={styles.itemCode}>{formatCode(entry.code)}</Text>

                  {entry.status === 'pending' && entry.createdAt && (
                    <Text style={styles.itemExpiryDate}>
                      תוקף עד:{' '}
                      {calculateExpiryDate(entry.createdAt).toLocaleDateString(
                        'he-IL'
                      )}
                    </Text>
                  )}
                  {entry.status === 'redeemed' && entry.redeemedAt && (
                    <Text style={styles.itemRedeemedDate}>
                      מומש בתאריך:{' '}
                      {new Date(entry.redeemedAt).toLocaleDateString('he-IL')}
                    </Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={!!selectedCode}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCode(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {selectedCode?.item?.name ||
                selectedCode?.itemName ||
                'קוד מימוש'}
            </Text>

            {(selectedCode?.item?.deliveryType ||
              selectedCode?.deliveryType) === 'donation' ? (
              <Text style={styles.modalSubtitle}>
                תרומה על סך{' '}
                {selectedCode.item?.donationAmount ||
                  selectedCode.donationAmount}{' '}
                ₪ עברה בשמך לעמותה{' '}
                {selectedCode.item?.donationTarget ||
                  selectedCode.donationTarget}
                .{'\n'}תודה רבה על תרומתך!
              </Text>
            ) : (
              <>
                {(selectedCode?.item?.pickupLocation ||
                  selectedCode?.pickupLocation) && (
                  <Text style={styles.modalPickupLocation}>
                    {selectedCode.item?.pickupLocation ||
                      selectedCode.pickupLocation}
                  </Text>
                )}
                <Text style={styles.modalSubtitle}>
                  הצג קוד זה בבית העסק למימוש:
                </Text>
                <Text style={styles.bigCode}>
                  {formatCode(selectedCode?.code || '')}
                </Text>
                {selectedCode?.status === 'pending' &&
                  selectedCode?.createdAt && (
                    <Text style={styles.modalExpiryDate}>
                      תוקף עד:{' '}
                      {calculateExpiryDate(
                        selectedCode.createdAt
                      ).toLocaleDateString('he-IL')}
                    </Text>
                  )}
              </>
            )}

            <TouchableOpacity
              onPress={() => setSelectedCode(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  headerContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#1C1C3A',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C5A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#87CEEB',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  filterContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#1C1C3A',
    marginBottom: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 7,
  },
  filterButton: {
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#2C2C5A',
    borderColor: '#4A4A8A',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilter: {
    backgroundColor: '#4682B4',
    borderColor: '#4682B4',
    shadowColor: '#4682B4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 9,
  },
  filterText: {
    color: '#B0C4DE',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollViewContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: '#2C2C5A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
    borderLeftWidth: 5,
    borderColor: '#4CAF50',
  },
  redeemedCard: {
    borderColor: '#6A5ACD',
    backgroundColor: '#222244',
  },
  expiredCard: {
    borderColor: '#DC143C',
    backgroundColor: '#222244',
  },
  donationCard: {
    borderColor: '#6A5ACD', // סגול-כחול עמוק לגבול (SlateBlue)
    backgroundColor: '#1E1E3A', // כחול כהה יותר, קרוב לרקע הכללי, אבל עם נימה שונה

    shadowColor: '#6A5ACD',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#87CEEB',
    marginBottom: 8,
    textAlign: 'right',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  itemCodeLabel: {
    fontSize: 15,
    color: '#B0C4DE',
    textAlign: 'right',
    marginBottom: 4,
  },
  itemCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ADD8E6',
    textAlign: 'right',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  itemExpiryDate: {
    fontSize: 13,
    color: '#B0C4DE',
    textAlign: 'right',
    fontStyle: 'italic',
    marginTop: 5,
  },
  itemRedeemedDate: {
    fontSize: 13,
    color: '#A0B0C0',
    textAlign: 'right',
    fontStyle: 'italic',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#B0C4DE',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#1C1C3A',
    padding: 30,
    borderRadius: 15,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#4682B4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 25,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#87CEEB',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  modalPickupLocation: {
    fontSize: 18,
    fontWeight: '600',
    color: '#87CEEB',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#B0C4DE',
    marginBottom: 20,
    textAlign: 'center',
  },
  bigCode: {
    fontSize: 32,
    letterSpacing: 5,
    fontWeight: '900',
    color: '#6A5ACD',
    textAlign: 'center',
    marginBottom: 25,
    padding: 10,
    backgroundColor: '#1A1A3A',
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalExpiryDate: {
    fontSize: 14,
    color: '#B0C4DE',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#4682B4',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#4682B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 18,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
