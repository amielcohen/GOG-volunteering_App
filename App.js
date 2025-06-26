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
import { Platform } from 'react-native';
import { useEffect } from 'react';

import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// ייבוא המסכים
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import SplashScreen from './screens/SplashScreen';
import * as Updates from 'expo-updates';

//User
import UserHomeScreen from './screens/User/userHomeScreen';
import GiftShop from './screens/User/GiftShop';
import EditProfile from './screens/User/EditProfile';
import SearchVolunteering from './screens/User/SearchVolunteering';
import VolunteerDetails from './screens/User/VolunteerDetails';
import MyVolunteerings from './screens/User/MyVolunteerings';
import UserCodes from './screens/User/UserCodes';
import PurchaseScreen from './screens/User/PurchaseScreen';
import UserMessagesScreen from './screens/User/UserMessagesScreen';
import UserLeaderboardScreen from './screens/User/UserLeaderboardScreen';

//Admin
import AdminHomeScreen from './screens/Admin/AdminHomeScreen';
import AdminOrganizationScreen from './screens/Admin/AdminOrganizationScreen';
import AddOrganizationScreen from './screens/Admin/AddOrganizationScreen';
import AddCityScreen from './screens/Admin/AddCityScreen';
import ManageCitiesScreen from './screens/Admin/ManageCitiesScreen';
import AdminStatsScreen from './screens/Admin/AdminStatsScreen';
import GlobalOrganizationDetailsScreen from './screens/Admin/GlobalOrganizationDetailsScreen';

//CommunityRep
import CommunityRepHomeScreen from './screens/CommunityRep/CommunityRepHomeScreen';
import ShopMenu from './screens/CommunityRep/ShopMenu';
import AddShopItemScreen from './screens/CommunityRep/AddShopItemScreen';
import ManageCategoriesScreen from './screens/CommunityRep/ManageCategoriesScreen';
import OrganizationManagerScreen from './screens/CommunityRep/OrganizationMangerScreen';
import ChooseGlobalOrganizationScreen from './screens/CommunityRep/ChooseGlobalOrganizationScreen';
import LinkGlobalOrganizationScreen from './screens/CommunityRep/LinkGlobalOrganizationScreen';
import CreateOrganizationRepScreen from './screens/CommunityRep/CreateOrganizationRepScreen';
import CreateCityOrganizationScreen from './screens/CommunityRep/CreateCityOrganization';
import LinkedOrganizationDetails from './screens/CommunityRep/LinkedOrganizationDetails';
import OrgRepScreen from './screens/CommunityRep/OrgRepScreen';
import EditShopItemScreen from './screens/CommunityRep/EditShopItemScreen';
import ManageShopInfo from './screens/CommunityRep/ManageShopInfo';
import ManageBusinessesScreen from './screens/CommunityRep/ManageBusinessesScreen';
import ManageDonation from './screens/CommunityRep/ManageDonation';
import EditCityProfileScreen from './screens/CommunityRep/EditCityProfileScreen';
import SendCityMessage from './screens/CommunityRep/SendCityMessage';
import CommunityLeaderboardScreen from './screens/CommunityRep/CommunityLeaderboardScreen';
import CityMonthlyPrizesScreen from './screens/CommunityRep/CityMonthlyPrizesScreen';
import OrganizationStatsScreen from './screens/CommunityRep/OrganizationStatsScreen';
import CityStatsScreen from './screens/CommunityRep/CityStatsScreen';

//OrganizationRep
import OrganizationRepHomeScreen from './screens/OrganizationRep/OrganizationRepHomeScreen';
import CreateVolunteeringScreen from './screens/OrganizationRep/CreateVolunteeringScreen';
import FutureVolunteerings from './screens/OrganizationRep/FutureVolunteerings';
import OpenVolunteerings from './screens/OrganizationRep/OpenVolunteerings';
import VolunteeringsHistory from './screens/OrganizationRep/VolunteeringsHistory';
import EditOrganizationRepProfileScreen from './screens/OrganizationRep/EditOrganizationRepProfileScreen';

//Business
import BusinessPartnerHomeScreen from './screens/Business/BusinessPartnerHomeScreen';
import RedeemHistory from './screens/Business/RedeemHistory';
import EditBusinessScreen from './screens/Business/EditBusinessScreen';

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
            headerShown: true,
            title: 'חנות המתנות',
            headerStyle: {
              backgroundColor: '#222',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#FFE5EC',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: 'bold',
              color: '#FFE5EC',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right',
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
              paddingTop: 20,
            },
            headerTitleAlign: 'center',
          }}
        />

        <Stack.Screen
          name="UserMessagesScreen"
          component={UserMessagesScreen}
          options={{
            headerShown: true,
            title: '',
            headerStyle: {
              backgroundColor: '#1A2B42',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#87CEEB',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: 'bold',
              color: '#1A2B42',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right',
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="RedeemHistory"
          component={RedeemHistory}
          options={{
            headerShown: true,
            title: '',
            headerStyle: {
              backgroundColor: '#1A2B42',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#87CEEB',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: 'bold',
              color: '#1A2B42',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right',
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
            },
            headerTitleAlign: 'center',
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

        <Stack.Screen //#BBDEFB
          name="SendCityMessage"
          component={SendCityMessage}
          options={{
            headerTitle: '',
            headerTitleAlign: 'center',
          }}
        />

        <Stack.Screen
          name="CommunityLeaderboardScreen"
          component={CommunityLeaderboardScreen}
          options={{
            headerShown: true,
            title: 'Leader Board',
            headerStyle: {
              backgroundColor: '#4A148C',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#FFE5EC',
            headerTitleStyle: {
              fontSize: 30,
              fontWeight: 'bold',
              color: '#FFE5EC',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right',
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
              paddingTop: 8,
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="CityMonthlyPrizesScreen"
          component={CityMonthlyPrizesScreen}
          options={{
            headerShown: true,
            title: 'Leader Board',
            headerStyle: {
              backgroundColor: '#4A148C',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#FFE5EC',
            headerTitleStyle: {
              fontSize: 30,
              fontWeight: 'bold',
              color: '#FFE5EC',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right',
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
              paddingTop: 8,
            },
            headerTitleAlign: 'center',
          }}
        />

        <Stack.Screen
          name="OrganizationStatsScreen"
          component={OrganizationStatsScreen}
          options={{
            headerShown: true,
            title: 'סטטיסטיקה',
            headerStyle: {
              backgroundColor: '#4A90E2',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#FFF',
            headerTitleStyle: {
              fontSize: 30,
              fontWeight: 'bold',
              color: '#FFF',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right',
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
              paddingTop: 8,
            },
            headerTitleAlign: 'center',
          }}
        />

        <Stack.Screen
          name="CityStatsScreen"
          component={CityStatsScreen}
          options={{
            headerShown: true,
            title: 'סטטיסטיקה',
            headerStyle: {
              backgroundColor: '#4A90E2',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#FFF',
            headerTitleStyle: {
              fontSize: 30,
              fontWeight: 'bold',
              color: '#FFF',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right',
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
              paddingTop: 8,
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="GlobalOrganizationDetailsScreen"
          component={GlobalOrganizationDetailsScreen}
          options={{
            headerShown: true,
            title: 'פרטים ועריכה',
            headerStyle: {
              backgroundColor: '#4A90E2',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#FFF',
            headerTitleStyle: {
              fontSize: 30,
              fontWeight: 'bold',
              color: '#FFF',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right',
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
              paddingTop: 8,
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="AdminStatsScreen"
          component={AdminStatsScreen}
          options={{
            headerShown: true,
            title: 'סטטיסטיקה',
            headerStyle: {
              backgroundColor: '#4A90E2',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#FFF',
            headerTitleStyle: {
              fontSize: 30,
              fontWeight: 'bold',
              color: '#FFF',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right',
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
              paddingTop: 8,
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="EditOrganizationRepProfileScreen"
          component={EditOrganizationRepProfileScreen}
          options={{
            headerShown: true,
            title: 'עורך עמותה',
            headerStyle: {
              backgroundColor: '#4A90E2',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#FFF',
            headerTitleStyle: {
              fontSize: 30,
              fontWeight: 'bold',
              color: '#FFF',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right',
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
              paddingTop: 8,
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="UserLeaderboardScreen"
          component={UserLeaderboardScreen}
          options={{
            headerShown: true,
            title: 'Leader Board',
            headerStyle: {
              backgroundColor: '#880E4F',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#FFE5EC',
            headerTitleStyle: {
              fontSize: 30,
              fontWeight: 'bold',
              color: '#FFE5EC',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right',
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
              paddingTop: 8,
            },
            headerTitleAlign: 'center',
          }}
        />

        <Stack.Screen
          name="EditCityProfileScreen"
          component={EditCityProfileScreen}
          options={{
            headerTitle: 'עריכת פרטים',
            headerTitleAlign: 'center',
          }}
        />

        <Stack.Screen
          name="ManageCitiesScreen"
          component={ManageCitiesScreen}
          options={{
            headerTitle: '',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="EditBusinessScreen"
          component={EditBusinessScreen}
          options={{
            headerShown: true,
            title: '',
            headerStyle: {
              backgroundColor: '#1A2B42',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#87CEEB',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: 'bold',
              color: '#1A2B42',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right',
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
            },
            headerTitleAlign: 'center',
          }}
        />

        <Stack.Screen
          name="BusinessPartnerHomeScreen"
          component={BusinessPartnerHomeScreen}
          options={({ navigation }) => ({
            headerTitle: 'מסך הבית',
            headerStyle: {
              backgroundColor: '#1A2B42',
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
              backgroundColor: '#317834',
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
          name="ManageBusinessesScreen"
          component={ManageBusinessesScreen}
          options={{
            headerShown: true,
            title: '',
            headerStyle: {
              backgroundColor: '#1A2A3A',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#87CEEB',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: 'bold',
              color: '#87CEEB',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right',
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="PurchaseScreen"
          component={PurchaseScreen}
          options={defaultHeader('רכוש מוצר')}
        />
        <Stack.Screen
          name="EditShopItemScreen"
          component={EditShopItemScreen}
          options={defaultHeader('עריכת מוצר')}
        />
        <Stack.Screen
          name="CreateCityOrganization"
          component={CreateCityOrganizationScreen}
          options={defaultHeader('יציירת עמותות')}
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
          name="UserCodes"
          component={UserCodes}
          options={{
            // נגדיר את האפשרויות ישירות כאן
            headerShown: true, // ודא שהכותרת מוצגת (כולל כפתור חזור)
            title: '', // הכותרת שתופיע
            headerStyle: {
              backgroundColor: '#1C1C3A', // צבע רקע כחול כהה
              shadowColor: 'transparent', // מבטל צל תחתון
              elevation: 0, // מבטל צל תחתון באנדרואיד
              borderBottomWidth: 0, // מבטל קו תחתון
            },
            headerTintColor: '#87CEEB', // צבע כפתור החזור (החץ)
            headerTitleStyle: {
              fontSize: 20, // גודל גופן לכותרת
              fontWeight: 'bold', // עובי גופן לכותרת
              color: '#87CEEB', // צבע טקסט הכותרת
              textAlign: Platform.OS === 'ios' ? 'center' : 'right', // יישור (iOS מרכז, אנדרואיד ימין ל-RTL)
              flex: 1, // מאפשר יישור נכון
              paddingRight: Platform.OS === 'android' ? 20 : 0, // ריפוד ימין באנדרואיד ב-RTL
            },
            headerTitleAlign: 'center', // יישור כותרת ב-iOS
          }}
        />
        <Stack.Screen
          name="ManageDonation"
          component={ManageDonation}
          options={{
            headerShown: true,
            title: '',
            headerStyle: {
              backgroundColor: '#0A0A1A',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#87CEEB',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: 'bold',
              color: '#87CEEB',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right',
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
            },
            headerTitleAlign: 'center',
          }}
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
          name="ManageShopInfo"
          component={ManageShopInfo}
          options={{
            headerShown: true,
            title: 'ניהול פרטי חנות',
            headerStyle: {
              backgroundColor: '#87CEEB',
              shadowColor: 'transparent',
              elevation: 0,
              borderBottomWidth: 0,
            },
            headerTintColor: '#1C1C3A',
            headerTitleStyle: {
              fontSize: 25,
              fontWeight: 'bold',
              color: '#000',
              textAlign: Platform.OS === 'ios' ? 'center' : 'right', // יישור (iOS מרכז, אנדרואיד ימין ל-RTL)
              flex: 1,
              paddingRight: Platform.OS === 'android' ? 20 : 0,
              paddingTop: Platform.OS === 'android' ? 20 : 0,
            },
            headerTitleAlign: 'center', // יישור כותרת ב-iOS
          }}
        />
        <Stack.Screen
          name="OrgRepScreen"
          component={OrgRepScreen}
          options={defaultHeader('ניהול אחראי עמותה')}
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
          name="LinkedOrganizationDetails"
          component={LinkedOrganizationDetails}
          options={defaultHeader('פרטי הארגון')}
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
          name="FutureVolunteerings"
          component={FutureVolunteerings}
          options={defaultHeader('התנדבויות עתידיות')}
        />
        <Stack.Screen
          name="OpenVolunteerings"
          component={OpenVolunteerings}
          options={defaultHeader('התנדבויות פתוחות')}
        />
        <Stack.Screen
          name="VolunteeringsHistory"
          component={VolunteeringsHistory}
          options={defaultHeader('היסטוריית התנדבות')}
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
