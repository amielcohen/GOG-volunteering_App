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

function ShopMenu({ navigation, route }) {
  const [deleteMode, setDeleteMode] = useState(false);
  const [gifts, setGifts] = useState([]);
  const fallbackImage = require('../../images/noImageFound.webp');

  const fetchGifts = async () => {
    try {
      const response = await fetch('http://10.100.102.16:5000/shop/all');
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
    }, [])
  );

  const additem = () => {
    navigation.navigate('AddShopItemScreen');
  };

  const handleDelete = (id) => {
    Alert.alert('מחק פריט', `בקרוב תמחק את הפריט עם id ${id}`);
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
        onDelete={() => handleDelete(itemData.item._id)}
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
});
