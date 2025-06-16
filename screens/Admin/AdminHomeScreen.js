import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  ScrollView,
} from 'react-native';

const AdminHomeScreen = ({ navigation }) => {
  const handlePress = (action) => {
    Alert.alert('Button Pressed!', `You pressed the "${action}" button.`);
  };

  const navigateToOrganizations = () => {
    navigation.navigate('AdminOrganizationScreen');
  };

  const navigateToAddCity = () => {
    navigation.navigate('AddCityScreen');
  };
  const navigateToCityManage = () => {
    navigation.navigate('ManageCitiesScreen');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../images/adminBanner.png')}
          style={styles.bannerImage}
        />
        <Text style={styles.welcomeText}>שלום, מנהל מערכת</Text>
      </View>

      <Pressable
        style={[styles.card, styles.greenCard]}
        onPress={() => handlePress('צפה בסטטיסטיקה')}
      >
        <Text style={styles.cardText}>צפה בסטטיסטיקה</Text>
      </Pressable>

      <Pressable
        style={[styles.card, styles.blueCard]}
        onPress={navigateToOrganizations}
      >
        <Text style={styles.cardText}>ניהול ארגונים ועמותות</Text>
      </Pressable>

      <Pressable
        style={[styles.card, styles.orangeCard]}
        onPress={navigateToCityManage}
      >
        <Text style={styles.cardText}>ניהול ערים וישובים</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#9f97d8',
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  bannerImage: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 4,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
  },

  card: {
    padding: 20,
    borderRadius: 14,
    marginBottom: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  greenCard: {
    backgroundColor: '#e0f8e9',
  },
  blueCard: {
    backgroundColor: '#e0f0ff',
  },
  orangeCard: {
    backgroundColor: '#fff0e0',
  },
  cardText: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default AdminHomeScreen;
