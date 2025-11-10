
import { useNetworkState } from "expo-network";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme, View, ActivityIndicator } from "react-native";
import { Button } from "@/components/button";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Stack, router, useSegments, useRootNavigationState } from "expo-router";
import { SystemBars } from "react-native-edge-to-edge";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, session, isLoading, isAuthenticated } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) {
      console.log('Navigation not ready');
      return;
    }

    if (isLoading) {
      console.log('Auth still loading');
      return;
    }

    const inAuthGroup = segments[0] === 'auth' || segments[0] === 'onboarding' || segments[0] === 'email-confirmed';
    
    console.log('=== ROOT LAYOUT AUTH GUARD ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('hasUser:', !!user);
    console.log('hasSession:', !!session);
    console.log('userType:', user?.userType);
    console.log('segments:', segments);
    console.log('inAuthGroup:', inAuthGroup);

    // Only redirect if we have a clear auth state
    if (!session && !inAuthGroup) {
      // No session and not in auth flow - redirect to auth
      console.log('Redirecting to auth - no session');
      router.replace('/auth');
    } else if (session && !user && !inAuthGroup) {
      // Has session but no user yet (still loading profile) - wait
      console.log('Waiting for profile to load');
      return;
    } else if (isAuthenticated && user && inAuthGroup) {
      // User is authenticated and in auth flow - redirect based on user type
      console.log('User authenticated in auth flow, redirecting based on type');
      
      if (user.userType === 'admin') {
        console.log('Redirecting admin to admin dashboard');
        router.replace('/(tabs)/admin');
      } else if (user.userType === 'business_user') {
        console.log('Redirecting business user to dashboard');
        router.replace('/(tabs)/dashboard');
      } else {
        console.log('Redirecting customer to home');
        router.replace('/(tabs)/(home)/');
      }
    }
  }, [isAuthenticated, segments, navigationState?.key, isLoading, user, session]);

  // Show loading screen while checking authentication
  if (isLoading || !navigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="email-confirmed" options={{ headerShown: false }} />
      <Stack.Screen 
        name="business/[id]" 
        options={{ 
          presentation: 'card',
          headerShown: true,
          title: 'Business Details'
        }} 
      />
      <Stack.Screen 
        name="cart" 
        options={{ 
          presentation: 'card',
          headerShown: true,
          title: 'Shopping Cart'
        }} 
      />
      <Stack.Screen 
        name="messages" 
        options={{ 
          presentation: 'card',
          headerShown: true,
          title: 'Messages'
        }} 
      />
      <Stack.Screen 
        name="booking" 
        options={{ 
          presentation: 'modal',
          headerShown: true,
          title: 'Book Service'
        }} 
      />
      <Stack.Screen 
        name="bookings" 
        options={{ 
          presentation: 'card',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="orders" 
        options={{ 
          presentation: 'card',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="business-management" 
        options={{ 
          presentation: 'modal',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="products" 
        options={{ 
          presentation: 'card',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="wallet" 
        options={{ 
          presentation: 'card',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="reviews" 
        options={{ 
          presentation: 'modal',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="checkout" 
        options={{ 
          presentation: 'card',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          presentation: 'card',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ 
          presentation: 'card',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="subscription" 
        options={{ 
          presentation: 'card',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="payment-methods" 
        options={{ 
          presentation: 'card',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="profile/edit" 
        options={{ 
          presentation: 'card',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="debug/refresh-user" 
        options={{ 
          presentation: 'card',
          headerShown: true,
          title: 'Debug User'
        }} 
      />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="formsheet"
        options={{
          presentation: "formSheet",
          sheetAllowedDetents: [0.5, 1],
          sheetGrabberVisible: true,
        }}
      />
      <Stack.Screen
        name="transparent-modal"
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const { isConnected } = useNetworkState();

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <CartProvider>
          <WidgetProvider>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              <SystemBars style={colorScheme === "dark" ? "light" : "dark"} />
              <RootLayoutNav />
              <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            </ThemeProvider>
          </WidgetProvider>
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
