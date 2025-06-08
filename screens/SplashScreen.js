// screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { loadUserFromStorage } from '../services/authService';
import { useNavigation } from '@react-navigation/native';

export default function SplashScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const checkUser = async () => {
      const user = await loadUserFromStorage();

      if (user) {
        const routeName =
          user.role === 'admin'
            ? 'AdminHomeScreen'
            : user.role === 'CommunityRep'
              ? 'CommunityRepHomeScreen'
              : user.role === 'OrganizationRep'
                ? 'OrganizationRepHomeScreen'
                : user.role === 'BusinessPartner'
                  ? 'BusinessPartnerHomeScreen'
                  : 'UserHomeScreen';

        navigation.reset({
          index: 0,
          routes: [{ name: routeName, params: { user } }],
        });
      } else {
        navigation.replace('Login');
      }
    };

    checkUser();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={styles.text}>טוען נתונים...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
});
