import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SellerDashboard from '../screens/SellerDashboard';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function SellerStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Dashboard"
        component={SellerDashboard}
        options={{ headerShown: false }} // 🔥 Hide header
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
