import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Pressable,
  FlatList,
} from 'react-native';

import ItemGridTile from '../User/ItemGridTile';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import CustomToast from '../../components/CustomToast';

import config from '../../config';

function ShopMenu({ navigation, route }) {
  const { user } = route.params;

  const [deleteMode, setDeleteMode] = useState(false); //deleteMode
  const [gifts, setGifts] = useState([]); //item list from the DB

  const [showConfirmModal, setShowConfirmModal] = useState(false); //delete model
  const [itemToDelete, setItemToDelete] = useState(null);

  const fallbackImage = require('../../images/noImageFound.webp'); //constant image if missing one

  const [toastMessage, setToastMessage] = useState(null); //custom toast

  const fetchGifts = async () => {
    try {
      const response = await fetch(`${config.SERVER_URL}/shop/all`);
      const data = await response.json();
      setGifts(data);
    } catch (err) {
      console.error('שגיאה בטעינת פריטים:', err.message);
      Alert.alert('שגיאה', 'לא ניתן לטעון את הפריטים מהשרת');
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGifts();

      if (route.params?.message) {
        setToastMessage(route.params.message);

        navigation.setParams({ message: null });
      }
    }, [route.params])
  );

  const additem = () => {
    navigation.navigate('AddShopItemScreen', { user });
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(
        `http://10.100.102.16:5000/shop/${itemToDelete._id}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setToastMessage(`הפריט "${itemToDelete.name}" נמחק בהצלחה ✅`);
        fetchGifts();
      } else {
        setToastMessage('שגיאה במחיקת הפריט 🚫');
      }
    } catch (err) {
      setToastMessage('תקלה בחיבור לשרת 😵');
    }

    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  function RenderGift(itemData) {
    const imageUrl = itemData.item.imageUrl;
    const imageSource =
      !imageUrl || imageUrl.trim() === '' ? fallbackImage : { uri: imageUrl };

    return (
      <ItemGridTile
        title={itemData.item.name}
        price={itemData.item.price}
        img={imageSource}
        deleteMode={deleteMode}
        onDelete={() => handleDelete(itemData.item)}
        onPress={() => Alert.alert('פריט נבחר')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <View style={styles.actionsRow}>
          <Pressable
            style={deleteMode ? styles.disabledAction : styles.actionButton}
            disabled={deleteMode}
            onPress={deleteMode ? null : () => additem()}
          >
            <Icon
              name="add-circle"
              size={24}
              color={deleteMode ? '#aaa' : 'green'}
            />
            <Text style={styles.actionText}>הוסף פריט</Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={() => setDeleteMode((prev) => !prev)}
          >
            <Icon name="delete" size={24} color="red" />
            <Text style={styles.actionText}>
              {deleteMode ? 'סיים מחיקה' : 'מחק פריט'}
            </Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={gifts}
        style={styles.list}
        keyExtractor={(item) => item._id}
        renderItem={RenderGift}
        numColumns={2}
      />
      {showConfirmModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>אישור מחיקה</Text>
            <Text style={styles.modalText}>
              האם אתה בטוח שברצונך למחוק את הפריט "{itemToDelete?.name}"?
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => {
                  setShowConfirmModal(false);
                  setItemToDelete(null);
                }}
              >
                <Text style={styles.modalButtonText}>ביטול</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.modalDelete]}
                onPress={confirmDelete}
              >
                <Text style={styles.modalButtonText}>מחק</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      {toastMessage && (
        <CustomToast
          message={toastMessage}
          onHide={() => setToastMessage(null)}
        />
      )}
    </View>
  );
}

export default ShopMenu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#292222',
  },
  infoContainer: {
    padding: 10,
    alignItems: 'flex-end',
  },
  info: {
    textAlign: 'right',
    writingDirection: 'rtl',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  list: {
    flex: 1,
    marginBottom: 10, // מרווח מהטקסט התחתון
  },

  bottomText: {
    textAlign: 'right',
    writingDirection: 'rtl',
    fontSize: 14,
    color: 'white',
  },
  infoContainer: {
    padding: 10,
    alignItems: 'flex-end', // יישור כללי לימין
  },

  actionsRow: {
    flexDirection: 'row-reverse', // RTL אמיתי
    justifyContent: 'flex-start', // מתחילים מימין לשמאל
    width: '100%',
    gap: 20,
  },

  actionButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 6,
  },
  disabledAction: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    opacity: 0.5, // כל הכפתור חיוור יותר
  },

  disabledText: {
    color: '#aaa', // אפור בהיר – כדי להראות שהוא לא לחיץ
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalCancel: {
    backgroundColor: '#ccc',
  },
  modalDelete: {
    backgroundColor: '#e53935',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
