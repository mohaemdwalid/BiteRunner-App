import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../state/appStore';
import { authService } from '../services/auth.service';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import CustomerNavigator from './CustomerNavigator';
import RestaurantNavigator from './RestaurantNavigator';
import DriverNavigator from './DriverNavigator';

const Root = createNativeStackNavigator();

export default function AppNavigator() {
  const { userId, role, isOnboarded, isLoading, setOnboarded, setLoading, loadProfile } = useAppStore();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const onboarded = await AsyncStorage.getItem('onboarded');
      if (mounted) setOnboarded(onboarded === 'true');

      const session = await authService.getSession();
      if (session?.user && mounted) {
        await loadProfile(session.user.id);
      }
      if (mounted) setLoading(false);
    })();

    const { data: listener } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadProfile(session.user.id);
      }
      if (event === 'SIGNED_OUT') {
        useAppStore.getState().reset();
      }
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!isOnboarded ? (
          <Root.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !userId ? (
          <>
            <Root.Screen name="SignIn" component={SignInScreen} />
            <Root.Screen name="SignUp" component={SignUpScreen} />
            <Root.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : role === 'restaurant_owner' ? (
          <Root.Screen name="RestaurantApp" component={RestaurantNavigator} />
        ) : role === 'driver' ? (
          <Root.Screen name="DriverApp" component={DriverNavigator} />
        ) : (
          <Root.Screen name="CustomerApp" component={CustomerNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
