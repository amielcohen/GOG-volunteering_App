import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';

const CommunityRepHomeScreen = ({ navigation, route }) => {
  const { user } = route.params;
  const handlePress = (action) => {
    Alert.alert('Button Pressed!', `You pressed the "${action}" button.`);
  };

  const Shopinfo = () => {
    navigation.navigate('ShopMenu', { user });
  };

  const CategoriesManger = () => {
    navigation.navigate('ManageCategoriesScreen');
  };
  const OrganizationManger = () => {
    navigation.navigate('OrganizationManagerScreen', { user });
  };
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.welcomeText}>שלום, אחראי עירוני! </Text>

        <Pressable style={styles.button} onPress={() => Shopinfo()}>
          <Text style={styles.buttonText}>צפה בחנות </Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => CategoriesManger()}>
          <Text style={styles.buttonText}>ניהול קטגוריות</Text>
        </Pressable>

        <Pressable style={styles.button} onPress={() => OrganizationManger()}>
          <Text style={styles.buttonText}>ניהול ארגונים</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => handlePress('עריכת התנדבויות')}
        >
          <Text style={styles.buttonText}>עריכת התנדבויות</Text>
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

export default CommunityRepHomeScreen;
