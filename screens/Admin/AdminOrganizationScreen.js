import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

export default function AdminOrganizationScreen() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('עמותה');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get('http://10.100.102.16:5000/organizations');
      setOrganizations(res.data);
    } catch (error) {
      Alert.alert('שגיאה', 'שגיאה בטעינת עמותות');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post('http://10.100.102.16:5000/organizations', {
        name,
        description,
        type,
      });
      setName('');
      setDescription('');
      fetchOrganizations();
    } catch (error) {
      Alert.alert('שגיאה', 'שגיאה בהוספת עמותה');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('אישור מחיקה', 'האם למחוק את העמותה גם מהערים הקיימות?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`http://10.100.102.16:5000/organizations/${id}`);
            fetchOrganizations();
          } catch (error) {
            Alert.alert('שגיאה', 'שגיאה במחיקת עמותה');
          }
        },
      },
    ]);
  };

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: 'center' }}
      />
    );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>ניהול עמותות גלובליות</Text>

      <TextInput
        placeholder="שם העמותה"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="תיאור"
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />
      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>הוסף עמותה</Text>
      </TouchableOpacity>

      <FlatList
        data={organizations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.description}</Text>
            <TouchableOpacity
              onPress={() => handleDelete(item._id)}
              style={[styles.button, { backgroundColor: 'red' }]}
            >
              <Text style={styles.buttonText}>מחק</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  card: {
    backgroundColor: '#eee',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
  },
  name: { fontSize: 16, fontWeight: 'bold' },
});
