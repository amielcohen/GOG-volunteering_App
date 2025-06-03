import React, { useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';

import ItemGridTile from '../User/ItemGridTile';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import CustomToast from '../../components/CustomToast';
import ItemDetailsModal from '../../components/ItemDetailsModal';
import config from '../../config';
import ConfirmModal from '../../components/ConfirmModal';

const fallbackImage = require('../../images/noImageFound.webp');

function ShopMenu({ navigation, route }) {
  const { user } = route.params;

  const [deleteMode, setDeleteMode] = useState(false);
  const [gifts, setGifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGifts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${config.SERVER_URL}/shop/by-city/${user.city._id}/raw-items`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('שגיאת שרת:', errorText);
        throw new Error('שגיאה בטעינת פריטים');
      }

      const data = await response.json();
      setGifts(data);
    } catch (err) {
      console.error('שגיאה בטעינת פריטים:', err.message);
      Alert.alert('שגיאה', 'לא ניתן לטעון את הפריטים מהשרת');
    } finally {
      setIsLoading(false);
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
        `${config.SERVER_URL}/shop/${itemToDelete._id}`,
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

  const filteredGifts = gifts.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function RenderGift(itemData) {
    const imageUrl = itemData.item.imageUrl;
    const imageSource =
      !imageUrl || imageUrl.trim() === '' ? fallbackImage : { uri: imageUrl };

    return (
      <ItemGridTile
        title={itemData.item.name}
        price={itemData.item.price}
        level={itemData.item.level}
        cityManger={true}
        stock={itemData.item.quantity}
        img={imageSource}
        deleteMode={deleteMode}
        onDelete={() => handleDelete(itemData.item)}
        onPress={() => setSelectedItem(itemData.item)}
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

          <Pressable
            style={styles.actionButton}
            onPress={() => setSearchVisible((prev) => !prev)}
          >
            <Icon name="search" size={24} color="#2196F3" />
            <Text style={styles.actionText}>חיפוש</Text>
          </Pressable>
        </View>

        {searchVisible && (
          <View style={styles.searchContainer}>
            <Icon
              name="search"
              size={20}
              color="#2196F3"
              style={{ marginHorizontal: 6 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="חפש לפי שם פריט..."
              placeholderTextColor="#ccc"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="white"
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={filteredGifts}
          style={styles.list}
          keyExtractor={(item) => item._id}
          renderItem={RenderGift}
          numColumns={2}
        />
      )}

      <ItemDetailsModal
        selectedItem={selectedItem}
        onClose={() => setSelectedItem(null)}
        actionButtons={[
          {
            text: 'ערוך',
            onPress: () =>
              navigation.navigate('EditShopItemScreen', {
                user,
                item: selectedItem,
              }),
            style: { backgroundColor: '#007BFF' },
          },
        ]}
      />

      {toastMessage && (
        <CustomToast
          message={toastMessage}
          onHide={() => setToastMessage(null)}
        />
      )}
      <ConfirmModal
        visible={showConfirmModal}
        title="אישור מחיקה"
        message={`האם למחוק את "${itemToDelete?.name}" מהחנות?`}
        confirmText="מחק"
        cancelText="ביטול"
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmModal(false)}
      />
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
  actionsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
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
    opacity: 0.5,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#3a3a3a',
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 6,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  list: {
    flex: 1,
    marginBottom: 10,
  },
});
