import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ImageBackground, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// ייבוא המסכים
import AdminHomeScreen from './screens/Admin/AdminHomeScreen';  
import UserHomeScreen from './screens/User/userHomeScreen';    
import CommunityRepHomeScreen from './screens/CommunityRep/CommunityRepHomeScreen'
import LoginScreen from './screens/LoginScreen';
import GiftShop from './screens/User/GiftShop';


const Stack = createStackNavigator();

export default function App() {
  return (
    
        <NavigationContainer>

          <Stack.Navigator initialRouteName="Login" >
          <Stack.Screen name="giftshop" component={GiftShop} options={{
            headerTitleAlign: 'center',
              headerTitle: "חנות המתנות",}}/>

            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerTransparent: true, 
                headerTitleAlign: 'center',
                headerTintColor: 'white',
                headerTitle: "",
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
            <Stack.Screen name="AdminHomeScreen" component={AdminHomeScreen} />
            <Stack.Screen name="UserHomeScreen" component={UserHomeScreen} 
            options={{
              headerTransparent: true, 
              headerTitleAlign: 'center',
              headerTintColor: 'white',
              headerTitle: "",}}/>
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
    paddingBottom: 150
  },
  inputstyle: {
    marginBottom: 20,
    color: "#000000",
    borderBottomWidth: 1,
    width: 200,
  },
  newaccount: {
    flex: 1
  },
  appcontiner: {
    flex: 1,
  },
  imgappcontiner: {
    padding: 50,
    flex: 1,
  },
  loginStyle: {
    marginTop: 20
  },
  imagetranspernt: {
    opacity: 0.2
  }
});

