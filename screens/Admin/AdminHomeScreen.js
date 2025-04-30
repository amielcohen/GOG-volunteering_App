import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';

const AdminHomeScreen = ({ navigation, route }) => {
  const handlePress = (action) => {
    Alert.alert('Button Pressed!', `You pressed the "${action}" button.`);
  };
  const OrganizationManger = () => {
    navigation.navigate('AdminOrganizationScreen');
  };
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>שלום, אדמין! זהו העמוד שלך.</Text>

        <Pressable
          style={styles.button}
          onPress={() => handlePress('צפה בסטטיסטיקה')}
        >
          <Text style={styles.buttonText}>צפה בסטטיסטיקה</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => OrganizationManger()}>
          <Text style={styles.buttonText}>מנהל ארגונים ועמותות</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('AddCityScreen')}
        >
          <Text style={styles.buttonText}>הוסף עיר</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 22,
    marginBottom: 30,
    color: '#333',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#6200ee',
    width: '80%',
    paddingVertical: 12,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AdminHomeScreen;
