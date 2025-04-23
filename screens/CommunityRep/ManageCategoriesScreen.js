import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ErrorModal from '../../components/ErrorModal';
import ConfirmModal from '../../components/ConfirmModal';
import CustomToast from '../../components/CustomToast';

export default function ManageCategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editedName, setEditedName] = useState('');

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorText, setErrorText] = useState('');

  const [toastMessage, setToastMessage] = useState(null);

  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://10.100.102.16:5000/categories/all');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('שגיאה בטעינה:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const response = await fetch('http://10.100.102.16:5000/categories/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (response.ok) {
        setNewCategory('');
        fetchCategories();
      } else {
        const error = await response.json();
        setErrorText({
          title: 'שגיאה',
          message: error.error || 'הוספת קטגוריה נכשלה',
        });
        setErrorVisible(true);
      }
    } catch (err) {
      setErrorText({
        title: 'שגיאה',
        message: 'התרחשה תקלה בחיבור לשרת',
      });
      setErrorVisible(true);
    }
  };

  const requestDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setConfirmVisible(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      const response = await fetch(
        `http://10.100.102.16:5000/categories/${categoryToDelete._id}`,
        {
          method: 'DELETE',
        }
      );

      if (response.status === 400) {
        const data = await response.json();
        setErrorText({
          title: 'לא ניתן למחוק',
          message:
            data.error ||
            'קטגוריה זו משויכת לפריטים, הסר אותה מהפריטים ונסה שוב.',
        });
        setErrorVisible(true);
      } else if (!response.ok) {
        setErrorText({
          title: 'שגיאה',
          message: 'שגיאה במחיקת הקטגוריה',
        });
        setErrorVisible(true);
      } else {
        setToastMessage('הקטגוריה נמחקה בהצלחה');

        fetchCategories();
      }
    } catch (err) {
      setErrorText({
        title: 'שגיאה',
        message: 'בעיה בחיבור לשרת',
      });
      setErrorVisible(true);
    } finally {
      setConfirmVisible(false);
      setCategoryToDelete(null);
    }
  };

  const updateCategory = async (id) => {
    if (!editedName.trim()) return;
    try {
      const response = await fetch(
        `http://10.100.102.16:5000/categories/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editedName.trim() }),
        }
      );

      if (response.ok) {
        setEditingCategoryId(null);
        setEditedName('');
        fetchCategories();
      } else {
        const error = await response.json();
        setErrorText({
          title: 'שגיאה',
          message: error.error || 'עדכון נכשל',
        });
        setErrorVisible(true);
      }
    } catch (err) {
      setErrorText({
        title: 'שגיאה',
        message: 'בעיה בחיבור לשרת',
      });
      setErrorVisible(true);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.categoryItem}>
      {editingCategoryId === item._id ? (
        <TextInput
          style={styles.editInput}
          value={editedName}
          onChangeText={setEditedName}
          placeholder="שם חדש"
        />
      ) : (
        <Text style={styles.categoryText}>
          {item.name} ({item.count})
        </Text>
      )}

      <View style={styles.actions}>
        {editingCategoryId === item._id ? (
          <Pressable onPress={() => updateCategory(item._id)}>
            <Icon name="check" size={30} color="green" />
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={() => {
                setEditingCategoryId(item._id);
                setEditedName(item.name);
              }}
              style={{ marginLeft: 12 }}
            >
              <Icon name="edit" size={22} color="orange" />
            </Pressable>

            <Pressable onPress={() => requestDeleteCategory(item)}>
              <Icon name="delete" size={22} color="red" />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.container}>
        <Text style={styles.header}>ניהול קטגוריות</Text>

        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            value={newCategory}
            onChangeText={setNewCategory}
            placeholder="הוסף קטגוריה"
          />
          <Pressable style={styles.addButton} onPress={addCategory}>
            <Icon name="add" size={24} color="white" />
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#6200EE"
            style={{ marginTop: 20 }}
          />
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 30 }}
            keyboardShouldPersistTaps="handled"
          >
            {categories.map((item) => (
              <View key={item._id}>{renderItem({ item })}</View>
            ))}
          </ScrollView>
        )}

        <ErrorModal
          visible={errorVisible}
          title={errorText.title}
          message={errorText.message}
          onClose={() => setErrorVisible(false)}
        />

        <ConfirmModal
          visible={confirmVisible}
          title="אישור מחיקה"
          message={`האם אתה בטוח שברצונך למחוק את הקטגוריה "${categoryToDelete?.name}"?`}
          onCancel={() => {
            setConfirmVisible(false);
            setCategoryToDelete(null);
          }}
          onConfirm={confirmDeleteCategory}
          confirmText="מחק"
          cancelText="בטל"
          confirmColor="#d32f2f"
          cancelColor="#757575"
        />

        {toastMessage && (
          <CustomToast
            message={toastMessage}
            onHide={() => setToastMessage(null)}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  addRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginLeft: 10,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 8,
  },
  categoryItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 4,
    fontSize: 16,
  },
});
