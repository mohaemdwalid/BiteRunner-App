import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Bike, Wallet } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import DriverHomeScreen from '../screens/driver/DriverHomeScreen';
import EarningsScreen from '../screens/driver/EarningsScreen';

const Tab = createBottomTabNavigator();

export default function DriverNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.accent.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { borderTopWidth: 0.5, borderTopColor: '#E5E5E5' },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Deliveries') return <Bike color={color} size={size} />;
          return <Wallet color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Deliveries" component={DriverHomeScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
    </Tab.Navigator>
  );
}
