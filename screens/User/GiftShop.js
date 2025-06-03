import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  I18nManager,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import config from '../../config';
import ItemGridTile from './ItemGridTile';
import CustomCoinIcon from '../../components/CustomCoinIcon';

const MAX_LEVEL = 20;

if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
  I18nManager.allowRTL(true);
}

export default function GiftShop({ route, navigation }) {
  const { user } = route.params;

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('level');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);

  const cityId = user.city._id || user.city;

  const fetchShop = async () => {
    try {
      const res = await axios.get(
        `${config.SERVER_URL}/shop/by-city/${cityId}`
      );
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error('שגיאה בשליפת קטגוריות:', err.message);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${config.SERVER_URL}/shop/by-city/${cityId}/items`,
        {
          params: {
            sort: sortBy,
            order: sortOrder,
            category: selectedCategory || undefined,
          },
        }
      );
      setItems(res.data);
    } catch (err) {
      console.error('שגיאה בשליפת פריטים:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
    fetchItems();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, sortBy, sortOrder]);

  const renderGift = ({ item }) => {
    const isLocked = item.level > user.level;

    return (
      <ItemGridTile
        title={item.name}
        price={item.price}
        img={{ uri: item.imageUrl }}
        locked={isLocked}
        level={item.level}
        onPress={
          isLocked
            ? null
            : () => navigation.navigate('PurchaseScreen', { user, item })
        }
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>טוען חנות...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>חנות המתנות</Text>
          <View style={styles.gogsContainer}>
            <Text style={styles.gogsText}>ברשותך</Text>
            <Text style={styles.gogsAmount}>{user.GoGs || 0}</Text>
            <Text style={styles.gogsText}>
              גוגואים <Text style={{ fontSize: 18 }}></Text>
            </Text>
            <CustomCoinIcon size={20} />
          </View>
        </View>

        {/* Filter and Sort Section */}
        <View style={styles.filterSortSection}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              dropdownIconColor="#FFE066"
              style={styles.picker}
            >
              <Picker.Item
                label="כל הקטגוריות"
                value=""
                style={styles.pickerItem}
              />
              {categories.map((cat) => (
                <Picker.Item
                  key={cat}
                  label={cat}
                  value={cat}
                  style={styles.pickerItem}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.sortButtonsContainer}>
            <Pressable
              style={styles.sortButton}
              onPress={() => {
                setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
              }}
            >
              <Text style={styles.sortText}>
                {sortOrder === 'asc' ? '⬆️ עולה' : '⬇️ יורד'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.sortButton}
              onPress={() => {
                setSortBy((prev) => (prev === 'price' ? 'level' : 'price'));
              }}
            >
              <Text style={styles.sortText}>
                מיון לפי: {sortBy === 'price' ? 'מחיר' : 'רמה'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Item List */}
        <FlatList
          data={items}
          style={styles.list}
          contentContainerStyle={styles.listContentContainer}
          keyExtractor={(item) => item._id}
          renderItem={renderGift}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />

        {/* Footer */}
        {user.level < MAX_LEVEL && (
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              עלה ברמה כדי לפתוח מתנות ופרסים נוספים!{' '}
              <Text style={{ fontSize: 18 }}>✨</Text>
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  container: {
    flex: 1,
    backgroundColor: '#282828',
    paddingHorizontal: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#FFE066',
  },
  header: {
    backgroundColor: '#333333',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
    alignItems: 'flex-end',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'right',
  },
  gogsContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  gogsText: {
    fontSize: 16,
    color: '#E0E0E0',
    marginHorizontal: 2,
  },
  gogsAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFEA00',
    marginHorizontal: 5,
  },
  filterSortSection: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  pickerWrapper: {
    backgroundColor: '#2F2F2F',
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    overflow: 'hidden',
    height: 45,
    justifyContent: 'center',
  },
  picker: {
    color: '#FFE066',
    fontSize: 14,
    height: '100%',
    width: '100%',
  },
  pickerItem: {
    fontSize: 15,
    backgroundColor: '#3E3E3E',
    color: '#FFE066',
  },
  sortButtonsContainer: {
    flexDirection: 'row-reverse',
  },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#4A4A4A',
    borderRadius: 10,
    marginHorizontal: 4,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  sortText: {
    color: '#E0E0E0',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  list: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 20,
    paddingHorizontal: 5,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  footerContainer: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  footerText: {
    fontSize: 15,
    color: '#9EC0EB',
    textAlign: 'center',
    fontWeight: '500',
  },
});
