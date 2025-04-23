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

export default function OrganizationManagerScreen({ route }) {
  const [globalOrganizations, setGlobalOrganizations] = useState([]);
  const [linkedOrganizations, setLinkedOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = route.params;

  const city = user.city;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [globalRes, linkedRes] = await Promise.all([
        axios.get('http://10.100.102.16:5000/organizations'),
        axios.get(`http://10.100.102.16:5000/city-organizations?city=${city}`),
      ]);
      setGlobalOrganizations(globalRes.data);
      setLinkedOrganizations(linkedRes.data);
    } catch (error) {
      console.log('FETCH ERROR:', error.response?.data || error.message);

      Alert.alert('שגיאה', 'נכשלה טעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (organizationId) => {
    try {
      await axios.post('http://10.100.102.16:5000/city-organizations/link', {
        organizationId,
        city,
        addedBy: user._id,
      });
      fetchData();
    } catch (error) {
      Alert.alert('שגיאה', 'לא ניתן לקשר את העמותה');
    }
  };

  const handleRemove = async (cityOrgId) => {
    Alert.alert('אישור מחיקה', 'האם אתה בטוח שברצונך להסיר את העמותה?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'אשר',
        onPress: async () => {
          try {
            await axios.delete(
              `http://10.100.102.16:5000/city-organizations/${cityOrgId}`
            );
            fetchData();
          } catch (err) {
            Alert.alert('שגיאה', 'לא ניתן למחוק את העמותה');
          }
        },
      },
    ]);
  };

  const renderOrg = ({ item }) => {
    const isLinked = linkedOrganizations.some(
      (org) => org.organizationId === item._id
    );
    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text>{item.description}</Text>
        {!isLinked ? (
          <TouchableOpacity
            onPress={() => handleLink(item._id)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>קשר לעיר</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.linked}>מקושר לעיר שלך</Text>
        )}
      </View>
    );
  };

  const renderLinked = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <TouchableOpacity
        onPress={() => handleRemove(item._id)}
        style={[styles.button, { backgroundColor: 'red' }]}
      >
        <Text style={styles.buttonText}>הסר</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, justifyContent: 'center' }}
      />
    );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>עמותות מקושרות לעיר שלך</Text>
      <FlatList
        data={linkedOrganizations}
        keyExtractor={(item) => item._id}
        renderItem={renderLinked}
      />

      <Text style={styles.header}>עמותות גלובליות זמינות</Text>
      <TextInput
        placeholder="חפש עמותה..."
        style={styles.search}
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <FlatList
        data={globalOrganizations.filter((org) =>
          org.name.includes(searchTerm)
        )}
        keyExtractor={(item) => item._id}
        renderItem={renderOrg}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  card: {
    backgroundColor: '#eee',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
  },
  name: { fontSize: 16, fontWeight: 'bold' },
  button: {
    backgroundColor: '#2196F3',
    padding: 8,
    marginTop: 10,
    borderRadius: 6,
  },
  buttonText: { color: 'white', textAlign: 'center' },
  linked: { color: 'green', marginTop: 10 },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
});
