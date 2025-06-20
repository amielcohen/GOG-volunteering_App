// ... [ייבוא קיים ללא שינוי]
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions, // חשוב! נוסיף את Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import config from '../../config';
import ConfirmModal from '../../components/ConfirmModal';
import MessageDetailsModal from '../../components/MessageDetailsModal';

// נקבל את רוחב המסך עבור חישוב רוחב הכפתורים
const { width } = Dimensions.get('window');
const BUTTON_WIDTH = (width - 15 * 2 - 10) / 2; // רוחב המסך - (marginHorizontal לכפתורים * 2) - רווח בין כפתורים / 2 כפתורים

export default function UserMessagesScreen({ route }) {
  const { user } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [messageDetailsVisible, setMessageDetailsVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [bulkActionModalVisible, setBulkActionModalVisible] = useState(false);
  const [bulkActionType, setBulkActionType] = useState(null); // 'deleteAll' | 'markAllAsRead'

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${config.SERVER_URL}/user-messages/${user._id}`
      );
      const sortedMessages = res.data.sort((a, b) => {
        if (a.read === b.read)
          return new Date(b.createdAt) - new Date(a.createdAt);
        return a.read ? 1 : -1;
      });
      setMessages(sortedMessages);
    } catch (err) {
      console.error('שגיאה בשליפת הודעות:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${config.SERVER_URL}/user-messages/${id}/read`);
      setMessages((prev) =>
        prev
          .map((msg) => (msg._id === id ? { ...msg, read: true } : msg))
          .sort((a, b) => {
            if (a.read === b.read)
              return new Date(b.createdAt) - new Date(a.createdAt);
            return a.read ? 1 : -1;
          })
      );
    } catch (err) {
      console.error('שגיאה בעדכון ההודעה:', err);
    }
  };

  const confirmDelete = (msg) => {
    setMessageToDelete(msg);
    setConfirmVisible(true);
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;
    try {
      await axios.delete(
        `${config.SERVER_URL}/user-messages/${messageToDelete._id}`
      );
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== messageToDelete._id)
      );
    } catch (err) {
      console.error('שגיאה במחיקת ההודעה:', err);
    } finally {
      setConfirmVisible(false);
      setMessageToDelete(null);
    }
  };

  const openMessageDetails = (message) => {
    setSelectedMessage(message);
    setMessageDetailsVisible(true);
    if (!message.read) markAsRead(message._id);
  };

  const closeMessageDetails = () => {
    setMessageDetailsVisible(false);
    setSelectedMessage(null);
  };

  const getMessageTypeStyles = (type, source = '') => {
    switch (type) {
      case 'info':
        return { icon: 'info', color: '#00E0FF', borderColor: '#00E0FF' };
      case 'warning':
        return { icon: 'error', color: '#FF4500', borderColor: '#FF4500' };
      case 'success':
        return {
          icon: 'check-circle',
          color: '#00FF7F',
          borderColor: '#00FF7F',
        };
      case 'alert':
        const alertIcon = source === 'level_up' ? 'star' : 'warning';
        return { icon: alertIcon, color: '#FFD700', borderColor: '#FFD700' };
      default:
        return { icon: 'message', color: '#B0C4DE', borderColor: '#B0C4DE' };
    }
  };

  const handleBulkAction = async () => {
    if (bulkActionType === 'deleteAll') {
      try {
        await axios.delete(
          `${config.SERVER_URL}/user-messages/all/${user._id}`
        );
        setMessages([]);
      } catch (err) {
        console.error('שגיאה במחיקת כל ההודעות:', err);
      }
    } else if (bulkActionType === 'markAllAsRead') {
      try {
        await axios.patch(
          `${config.SERVER_URL}/user-messages/all/${user._id}/read`
        );
        setMessages((prev) => prev.map((msg) => ({ ...msg, read: true })));
      } catch (err) {
        console.error('שגיאה בסימון כל ההודעות כנקראו:', err);
      }
    }
    setBulkActionModalVisible(false);
    setBulkActionType(null);
  };

  const renderItem = ({ item }) => {
    const { icon, color, borderColor } = getMessageTypeStyles(
      item.type,
      item.source
    );
    return (
      <TouchableOpacity
        style={[
          styles.messageCard,
          { borderColor },
          !item.read && styles.unreadCard,
        ]}
        onPress={() => openMessageDetails(item)}
      >
        <View style={styles.cardIconContainer}>
          <Icon name={icon} size={30} color={color} />
        </View>

        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.messageTitle}>{item.title}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.messageText} numberOfLines={2}>
            {item.message}
          </Text>
          <View style={styles.metaContainer}>
            <Text style={styles.meta}>מקור: {item.source || 'לא ידוע'}</Text>
            <Text style={styles.meta}>
              {new Date(item.createdAt).toLocaleDateString('he-IL')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => confirmDelete(item)}
          style={styles.deleteButton}
        >
          <Icon name="delete" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A2B42" />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>תיבת ההודעות שלך</Text>
      </View>

      {/* כפתורי פעולה */}
      {!loading && messages.length > 0 && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() => {
              setBulkActionType('markAllAsRead');
              setBulkActionModalVisible(true);
            }}
          >
            <Icon
              name="done-all"
              size={20}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.actionText}>סמן הכל כנקראו</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButtonDanger}
            onPress={() => {
              setBulkActionType('deleteAll');
              setBulkActionModalVisible(true);
            }}
          >
            <Icon
              name="delete-sweep"
              size={20}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.actionText}>מחק הכל</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00E0FF" />
          <Text style={styles.loadingText}>טוען הודעות...</Text>
        </View>
      ) : messages.length === 0 ? (
        <Text style={styles.emptyText}>אין הודעות להצגה.</Text>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <ConfirmModal
        visible={confirmVisible}
        title="מחיקת הודעה"
        message={
          <Text>
            האם למחוק את ההודעה{' '}
            <Text
              style={{ fontWeight: 'bold' }}
            >{`"${messageToDelete?.title}"`}</Text>
            ?
          </Text>
        }
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmVisible(false);
          setMessageToDelete(null);
        }}
        confirmText="מחק"
        cancelText="בטל"
        confirmColor="#FF6B6B"
        cancelColor="#6A7B9B"
      />

      <ConfirmModal
        visible={bulkActionModalVisible}
        title={
          bulkActionType === 'deleteAll'
            ? 'מחיקת כל ההודעות'
            : 'סימון כל ההודעות'
        }
        message={
          bulkActionType === 'deleteAll'
            ? 'האם אתה בטוח שברצונך למחוק את כל ההודעות?'
            : 'האם לסמן את כל ההודעות כנקראו?'
        }
        onConfirm={handleBulkAction}
        onCancel={() => {
          setBulkActionModalVisible(false);
          setBulkActionType(null);
        }}
        confirmText={bulkActionType === 'deleteAll' ? 'מחק הכל' : 'סמן הכל'}
        cancelText="בטל"
        confirmColor={bulkActionType === 'deleteAll' ? '#FF6B6B' : '#4CAF50'}
        cancelColor="#6A7B9B"
      />

      <MessageDetailsModal
        visible={messageDetailsVisible}
        message={selectedMessage}
        onClose={closeMessageDetails}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E3A52' },
  headerContainer: {
    backgroundColor: '#1A2B42',
    paddingVertical: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 15,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00E0FF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 224, 255, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between', // שינוי ל-space-between כדי לתת לכפתורים למלא את המרווח
    marginHorizontal: 15, // שומר על מרווחים מהצדדים
    marginBottom: 20,
  },
  actionButtonPrimary: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#388E3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    width: BUTTON_WIDTH, // **התיקון העיקרי: רוחב קבוע מחושב**
    justifyContent: 'center',
  },
  actionButtonDanger: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    // paddingHorizontal: 20, // נוריד את זה
    borderRadius: 25,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    width: BUTTON_WIDTH, // **התיקון העיקרי: רוחב קבוע מחושב**
    justifyContent: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    color: '#00E0FF',
    fontSize: 18,
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#A0D8F0',
    lineHeight: 25,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  messageCard: {
    backgroundColor: '#2A445C',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#B0C4DE',
  },
  unreadCard: {
    backgroundColor: '#3A5B7D',
    borderColor: '#00E0FF',
    shadowColor: '#00E0FF',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  cardIconContainer: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 15,
    alignSelf: 'flex-start',
  },
  messageContent: {
    flex: 1,
    paddingRight: 10,
    alignItems: 'flex-end',
  },
  messageHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 5,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0F2F7',
    textAlign: 'right',
    flexShrink: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF4500',
    marginRight: 8,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },
  messageText: {
    fontSize: 15,
    color: '#B0C4DE',
    textAlign: 'right',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 8,
  },
  meta: {
    fontSize: 12,
    color: '#6A7B9B',
    textAlign: 'right',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 15,
  },
});
