import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, ClipboardList, User } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import HomeScreen from '../screens/customer/HomeScreen';
import RestaurantDetailScreen from '../screens/customer/RestaurantDetailScreen';
import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import OrderTrackingScreen from '../screens/customer/OrderTrackingScreen';
import OrderHistoryScreen from '../screens/customer/OrderHistoryScreen';
import OrderDetailScreen from '../screens/customer/OrderDetailScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import ReviewScreen from '../screens/customer/ReviewScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function HomeTab() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
      <HomeStack.Screen name="Cart" component={CartScreen} />
      <HomeStack.Screen name="Checkout" component={CheckoutScreen} />
      <HomeStack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <HomeStack.Screen name="Review" component={ReviewScreen} />
    </HomeStack.Navigator>
  );
}

function OrdersTab() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <OrdersStack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <OrdersStack.Screen name="Review" component={ReviewScreen} />
    </OrdersStack.Navigator>
  );
}

function ProfileTab() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.accent.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { borderTopWidth: 0.5, borderTopColor: '#E5E5E5' },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'HomeTab') return <Home color={color} size={size} />;
          if (route.name === 'OrdersTab') return <ClipboardList color={color} size={size} />;
          return <User color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeTab} options={{ title: 'Home' }} />
      <Tab.Screen name="OrdersTab" component={OrdersTab} options={{ title: 'Orders' }} />
      <Tab.Screen name="ProfileTab" component={ProfileTab} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
