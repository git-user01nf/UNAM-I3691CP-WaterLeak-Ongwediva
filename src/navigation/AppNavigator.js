import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ReportScreen from '../screens/ReportScreen';
import ReportDetailScreen from '../screens/ReportDetailScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';
import VerifyLocationScreen from '../screens/VerifyLocationScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function UserTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Announcements" component={AnnouncementsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [userRole, setUserRole] = React.useState('user');

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={userRole === 'admin' ? AdminPanelScreen : UserTabs} />
        <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
        <Stack.Screen name="VerifyLocation" component={VerifyLocationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}