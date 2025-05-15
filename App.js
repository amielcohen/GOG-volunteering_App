import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ImageBackground,
  Pressable,
} from 'react-native';
import { I18nManager } from 'react-native';
import { useEffect } from 'react';

import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// ייבוא המסכים
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import SplashScreen from './screens/SplashScreen';

//User
import UserHomeScreen from './screens/User/userHomeScreen';
import GiftShop from './screens/User/GiftShop';
import EditProfile from './screens/User/EditProfile';
import SearchVolunteering from './screens/User/SearchVolunteering';
import VolunteerDetails from './screens/User/VolunteerDetails';
import MyVolunteerings from './screens/User/MyVolunteerings';

//Admin
import AdminHomeScreen from './screens/Admin/AdminHomeScreen';
import AdminOrganizationScreen from './screens/Admin/AdminOrganizationScreen';
import AddOrganizationScreen from './screens/Admin/AddOrganizationScreen';
import AddCityScreen from './screens/Admin/AddCityScreen';

//CommunityRep
import CommunityRepHomeScreen from './screens/CommunityRep/CommunityRepHomeScreen';
import ShopMenu from './screens/CommunityRep/ShopMenu';
import AddShopItemScreen from './screens/CommunityRep/AddShopItemScreen';
import ManageCategoriesScreen from './screens/CommunityRep/ManageCategoriesScreen';
import OrganizationManagerScreen from './screens/CommunityRep/OrganizationMangerScreen';
import ChooseGlobalOrganizationScreen from './screens/CommunityRep/ChooseGlobalOrganizationScreen';
import LinkGlobalOrganizationScreen from './screens/CommunityRep/LinkGlobalOrganizationScreen';
import CreateOrganizationRepScreen from './screens/CommunityRep/CreateOrganizationRepScreen';

//OrganizationRep
import OrganizationRepHomeScreen from './screens/OrganizationRep/OrganizationRepHomeScreen';
import CreateVolunteeringScreen from './screens/OrganizationRep/CreateVolunteeringScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen">
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
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
        <Stack.Screen
          name="AdminHomeScreen"
          component={AdminHomeScreen}
          options={({ navigation }) => ({
            headerTitle: 'מסך הבית',
            headerStyle: {
              backgroundColor: '#492DB3',
            },
            headerTitleStyle: {
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 20,
            },
            headerTitleAlign: 'center',
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
          name="OrganizationRepHomeScreen"
          component={OrganizationRepHomeScreen}
          options={({ navigation }) => ({
            headerTitle: 'מסך הבית',
            headerStyle: {
              backgroundColor: '#333aff',
            },
            headerTitleStyle: {
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 20,
            },
            headerTitleAlign: 'center',
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
          name="CommunityRepHomeScreen"
          component={CommunityRepHomeScreen}
          options={({ navigation }) => ({
            headerTitle: 'מסך הבית',
            headerStyle: {
              backgroundColor: '#F5767A',
            },
            headerTitleStyle: {
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 20,
            },
            headerTitleAlign: 'center',
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
          name="ShopMenu"
          component={ShopMenu}
          options={defaultHeader('תפריט החנות')}
        />
        <Stack.Screen
          name="MyVolunteerings"
          component={MyVolunteerings}
          options={defaultHeader('ההתנדבויות שלי')}
        />
        <Stack.Screen
          name="VolunteerDetails"
          component={VolunteerDetails}
          options={defaultHeader('פרטי התנדבות')}
        />
        <Stack.Screen
          name="SearchVolunteering"
          component={SearchVolunteering}
          options={defaultHeader('חפש התנדבויות')}
        />
        <Stack.Screen
          name="LinkGlobalOrganization"
          component={LinkGlobalOrganizationScreen}
          options={defaultHeader('קישור עמותה לעיר')}
        />
        <Stack.Screen
          name="CreateVolunteering"
          component={CreateVolunteeringScreen}
          options={defaultHeader('יצירת התנדבות חדשה')}
        />
        <Stack.Screen
          name="ChooseGlobalOrganization"
          component={ChooseGlobalOrganizationScreen}
          options={defaultHeader('קישור עמותה ארצית לעיר')}
        />
        <Stack.Screen
          name="AddShopItemScreen"
          component={AddShopItemScreen}
          options={defaultHeader('הוסף פריט')}
        />
        <Stack.Screen
          name="CreateOrganizationRepScreen"
          component={CreateOrganizationRepScreen}
          options={defaultHeader('יצירת אחראי עמותה')}
        />
        <Stack.Screen
          name="AdminOrganizationScreen"
          component={AdminOrganizationScreen}
          options={defaultHeader('מנהל עמותות')}
        />
        <Stack.Screen
          name="AddCityScreen"
          component={AddCityScreen}
          options={defaultHeader('הוסף עיר')}
        />
        <Stack.Screen
          name="AddOrganizationScreen"
          component={AddOrganizationScreen}
          options={defaultHeader('הוסף עמותה')}
        />
        <Stack.Screen
          name="ManageCategoriesScreen"
          component={ManageCategoriesScreen}
          options={defaultHeader('מנהל קטגוריות')}
        />
        <Stack.Screen
          name="OrganizationManagerScreen"
          component={OrganizationManagerScreen}
          options={defaultHeader('מנהל עמותות')}
        />
        <Stack.Screen
          name="UserHomeScreen"
          component={UserHomeScreen}
          options={({ navigation }) => ({
            headerTitle: 'מסך הבית',
            headerStyle: {
              backgroundColor: '#6200EE',
            },
            headerTitleStyle: {
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 20,
            },
            headerTitleAlign: 'center',
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
          options={{
            headerTitle: 'עריכת פרופיל',
            headerStyle: {
              backgroundColor: '#6200EE',
            },
            headerTitleStyle: {
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 20,
            },
            headerTitleAlign: 'center',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function defaultHeader(title) {
  return {
    headerTitle: title,
    headerTitleAlign: 'center',
    headerStyle: {
      backgroundColor: '#FFFFFF',
    },
    headerTitleStyle: {
      color: '#000000',
      fontWeight: 'bold',
      fontSize: 20,
    },
  };
}
