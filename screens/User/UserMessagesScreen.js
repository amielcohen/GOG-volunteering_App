import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import config from '../../config';
import ConfirmModal from '../../components/ConfirmModal';
import MessageDetailsModal from '../../components/MessageDetailsModal'; // ייבוא המודל החדש

export default function UserMessagesScreen({ route, navigation }) {
  const { user } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [messageDetailsVisible, setMessageDetailsVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `${config.SERVER_URL}/user-messages/${user._id}`
      );
      const sortedMessages = res.data.sort((a, b) => {
        if (a.read === b.read) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return a.read ? 1 : -1;
      });
      setMessages(sortedMessages);
    } catch (err) {
      console.error('שגיאה בשליפת הודעות:', err);
      Alert.alert('שגיאה', 'אירעה שגיאה בעת טעינת ההודעות');
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
            if (a.read === b.read) {
              return new Date(b.createdAt) - new Date(a.createdAt);
            }
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
      Alert.alert('שגיאה', 'לא ניתן היה למחוק את ההודעה');
    } finally {
      setConfirmVisible(false);
      setMessageToDelete(null);
    }
  };

  const openMessageDetails = (message) => {
    setSelectedMessage(message);
    setMessageDetailsVisible(true);
    if (!message.read) {
      markAsRead(message._id);
    }
  };

  const closeMessageDetails = () => {
    setMessageDetailsVisible(false);
    setSelectedMessage(null);
  };

  // מעודכן: שינויים בצבעים ובאייקונים ל-warning ו-alert
  const getMessageTypeStyles = (type, source = '') => {
    switch (type) {
      case 'info':
        return { icon: 'info', color: '#00E0FF', borderColor: '#00E0FF' }; // Light blue/cyan
      case 'warning':
        return { icon: 'error', color: '#FF4500', borderColor: '#FF4500' }; // Orange-red for Warning (as per your request for red with exclamation)
      case 'success':
        return {
          icon: 'check-circle',
          color: '#00FF7F',
          borderColor: '#00FF7F',
        }; // Spring green
      case 'alert':
        // For Alert, based on context like 'level up', I suggest 'star' or 'whatshot'
        // If it's a general 'alert', 'warning' is fine.
        const alertIcon = source === 'level_up' ? 'star' : 'warning'; // Example: conditional icon
        return { icon: alertIcon, color: '#FFD700', borderColor: '#FFD700' }; // Gold/Yellow for Alert (as per your request)
      default:
        return { icon: 'message', color: '#B0C4DE', borderColor: '#B0C4DE' }; // Default light blue-gray
    }
  };

  const renderItem = ({ item }) => {
    const { icon, color, borderColor } = getMessageTypeStyles(
      item.type,
      item.source
    ); // Pass item.source

    return (
      <TouchableOpacity
        style={[
          styles.messageCard,
          { borderColor: borderColor },
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
            <Text style={styles.meta}>
              <Text>מקור:</Text> {item.source || <Text>לא ידוע</Text>}
            </Text>
            <Text style={styles.meta}>
              {new Date(item.createdAt).toLocaleDateString('he-IL')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => confirmDelete(item)}
          style={styles.deleteButton}
        >
          <Icon name="delete-forever" size={24} color="#FF6347" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A2B42" />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>
          <Text>תיבת ההודעות שלך</Text>
        </Text>
      </View>

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
        title={<Text>מחיקת הודעה</Text>}
        message={
          <Text>
            <Text>האם למחוק את ההודעה</Text>{' '}
            <Text style={{ fontWeight: 'bold' }}>
              "{messageToDelete?.title}"
            </Text>
            <Text>?</Text>
          </Text>
        }
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmVisible(false);
          setMessageToDelete(null);
        }}
        confirmText="מחק"
        cancelText="בטל"
        confirmColor="#FF4500"
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
  container: {
    flex: 1,
    backgroundColor: '#1E3A52',
  },
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
    padding: 5,
    marginLeft: 10,
    alignSelf: 'flex-start',
  },
});
