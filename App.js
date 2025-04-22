import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ImageBackground,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// ייבוא המסכים
import AdminHomeScreen from './screens/Admin/AdminHomeScreen';
import UserHomeScreen from './screens/User/userHomeScreen';
import LoginScreen from './screens/LoginScreen';
import GiftShop from './screens/User/GiftShop';
import RegisterScreen from './screens/RegisterScreen';
import EditProfile from './screens/User/EditProfile';

//CommunityRep
import CommunityRepHomeScreen from './screens/CommunityRep/CommunityRepHomeScreen';
import ShopMenu from './screens/CommunityRep/ShopMenu';
import AddShopItemScreen from './screens/CommunityRep/AddShopItemScreen';
import ManageCategoriesScreen from './screens/CommunityRep/ManageCategoriesScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="giftshop"
          component={GiftShop}
          options={{
            headerTitleAlign: 'center',
            headerTitle: 'חנות המתנות',
          }}
        />

        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerTransparent: true,
            headerTitleAlign: 'center',
            headerTintColor: 'white',
            headerTitle: '',
            headerTitleStyle: {
              fontSize: 28,
              fontWeight: 'bold',
              color: 'white',
            },
            headerStyle: {
              height: 180,
            },
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            headerTitle: 'הרשמה',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen name="AdminHomeScreen" component={AdminHomeScreen} />
        <Stack.Screen
          name="CommunityRepHomeScreen"
          component={CommunityRepHomeScreen}
        />
        <Stack.Screen
          name="ShopMenu"
          component={ShopMenu}
          options={{
            headerTitle: ' תפריט החנות',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTitleStyle: {
              color: '#000000',
              fontWeight: 'bold',
              fontSize: 20,
            },
          }}
        />
        <Stack.Screen
          name="AddShopItemScreen"
          component={AddShopItemScreen}
          options={{
            headerTitle: 'הוסף פריט',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTitleStyle: {
              color: '#000000',
              fontWeight: 'bold',
              fontSize: 20,
            },
          }}
        />
        <Stack.Screen
          name="ManageCategoriesScreen"
          component={ManageCategoriesScreen}
          options={{
            headerTitle: 'מנהל קטגוריות',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTitleStyle: {
              color: '#000000',
              fontWeight: 'bold',
              fontSize: 20,
            },
          }}
        />

        <Stack.Screen
          name="UserHomeScreen"
          component={UserHomeScreen}
          options={({ navigation }) => ({
            headerTitle: 'מסך הבית',
            headerStyle: {
              backgroundColor: '#6200EE', // צבע רקע הכותרת
            },
            headerTitleStyle: {
              color: '#fff', // צבע טקסט
              fontWeight: 'bold', // עובי טקסט
              fontSize: 20, // גודל טקסט
            },
            headerTitleAlign: 'center',
            // כפתור Logout במקום חץ אחורה
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                }}
                style={{ marginLeft: 15 }}
              >
                <Text style={{ color: '#fff', fontSize: 16 }}>Logout</Text>
              </Pressable>
            ),
          })}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfile}
          options={({ navigation }) => ({
            headerTitle: 'עריכת פרופיל',
            headerStyle: {
              backgroundColor: '#6200EE', // צבע רקע הכותרת
            },
            headerTitleStyle: {
              color: '#fff', // צבע טקסט
              fontWeight: 'bold', // עובי טקסט
              fontSize: 20, // גודל טקסט
            },
            headerTitleAlign: 'center',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datacontainer: {
    flex: 8,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 150,
  },
  inputstyle: {
    marginBottom: 20,
    color: '#000000',
    borderBottomWidth: 1,
    width: 200,
  },
  newaccount: {
    flex: 1,
  },
  appcontiner: {
    flex: 1,
  },
  imgappcontiner: {
    padding: 50,
    flex: 1,
  },
  loginStyle: {
    marginTop: 20,
  },
  imagetranspernt: {
    opacity: 0.2,
  },
});
