import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, UtensilsCrossed, ClipboardList } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import DashboardScreen from '../screens/restaurant/DashboardScreen';
import MenuManagementScreen from '../screens/restaurant/MenuManagementScreen';
import OrderManagementScreen from '../screens/restaurant/OrderManagementScreen';

const Tab = createBottomTabNavigator();

export default function RestaurantNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.accent.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { borderTopWidth: 0.5, borderTopColor: '#E5E5E5' },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') return <LayoutDashboard color={color} size={size} />;
          if (route.name === 'Menu') return <UtensilsCrossed color={color} size={size} />;
          return <ClipboardList color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Menu" component={MenuManagementScreen} />
      <Tab.Screen name="Orders" component={OrderManagementScreen} />
    </Tab.Navigator>
  );
}
