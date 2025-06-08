// DonationSummaryModal.js
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import ConfirmModal from './ConfirmModal';

export default function DonationSummaryModal({
  visible,
  onClose,
  donations,
  onReset,
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!Array.isArray(donations)) {
    console.error('donations is not an array:', donations);
    return null;
  }

  const summary = {};
  donations.forEach((d) => {
    const amount = d.donationAmount || 0;
    summary[amount] = (summary[amount] || 0) + 1;
  });

  const total = donations.reduce((sum, d) => sum + (d.donationAmount || 0), 0);
  const orgName = donations.length > 0 ? donations[0].donationTarget : 'עמותה';
  const oldest = donations.reduce(
    (min, d) => (d.createdAt < min ? d.createdAt : min),
    donations[0]?.createdAt
  );

  const formattedDate = (d) =>
    new Date(d).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  const exportCSV = async () => {
    try {
      const csvHeader = 'תאריך,סכום,תורם\n';
      const csvBody = donations
        .map((d) => {
          const donorName = d.user
            ? `${d.user.firstName || ''} ${d.user.lastName || ''}`.trim()
            : 'תורם לא ידוע';
          const date = new Date(d.createdAt).toLocaleDateString('he-IL');
          return `${date},${d.donationAmount},${donorName}`;
        })
        .join('\n');

      const csv = '\uFEFF' + csvHeader + csvBody;

      const today = new Date().toISOString().slice(0, 10);
      const fileUri =
        FileSystem.cacheDirectory + `donations_${orgName}_${today}.csv`;

      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri);
    } catch (err) {
      console.error('שגיאה ביצירת CSV:', err);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>סיכום תרומות לעמותת "{orgName}"</Text>
          <Text style={styles.dateRange}>
            {formattedDate(oldest)} - {formattedDate(Date.now())}
          </Text>

          {!showDetails ? (
            <ScrollView style={{ maxHeight: 250 }}>
              {Object.entries(summary).map(([amount, count]) => (
                <TouchableOpacity key={amount} style={styles.row}>
                  <Text style={styles.text}>
                    {count} × {amount} ₪
                  </Text>
                </TouchableOpacity>
              ))}
              <Text style={styles.total}>סה"כ: {total} ₪</Text>
            </ScrollView>
          ) : (
            <ScrollView style={styles.table}>
              {donations.map((donation) => (
                <View key={donation._id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {formattedDate(donation.createdAt)}
                  </Text>
                  <Text style={styles.tableCell}>
                    {donation.donationAmount} ₪
                  </Text>
                  <Text style={styles.tableCell}>
                    {donation.user
                      ? `${donation.user.firstName || ''} ${donation.user.lastName || ''}`.trim()
                      : 'תורם לא ידוע'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.buttons}>
            <Pressable
              onPress={() => setShowDetails((prev) => !prev)}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>
                {showDetails ? '← חזרה לסיכום' : '📋 הצג פירוט תרומות'}
              </Text>
            </Pressable>
            <Pressable onPress={exportCSV} style={styles.exportButton}>
              <Text style={styles.exportText}>⬇ ייצוא כ־CSV</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowConfirm(true)}
              style={styles.resetButton}
            >
              <Text style={styles.resetText}>✔ איפוס תרומות</Text>
            </Pressable>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✖ סגור</Text>
            </Pressable>
          </View>

          <ConfirmModal
            visible={showConfirm}
            title="אישור איפוס תרומות"
            message={`איפוס התרומות יסמן כי הכסף הועבר בפועל לעמותה "${orgName}". יש לבצע פעולה זו רק לאחר ההעברה בפועל.`}
            onCancel={() => setShowConfirm(false)}
            onConfirm={() => {
              setShowConfirm(false);
              onReset();
            }}
            confirmText="אפס"
            cancelText="ביטול"
            confirmColor="#4CAF50"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  dateRange: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  row: {
    padding: 10,
    backgroundColor: '#eee',
    marginVertical: 4,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    textAlign: 'right',
  },
  total: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  buttons: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  exportButton: {
    backgroundColor: '#9C27B0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportText: {
    color: 'white',
    fontWeight: 'bold',
  },
  table: {
    maxHeight: 250,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
});
