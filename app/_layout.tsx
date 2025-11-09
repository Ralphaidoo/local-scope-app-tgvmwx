
import { useNetworkState } from "expo-network";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme, Alert } from "react-native";
import { Button } from "@/components/button";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Stack, router } from "expo-router";
import { SystemBars } from "react-native-edge-to-edge";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import "react-native-reanimated";

SplashScreen.preventAutoHideAsync();

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
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
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
              <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            </ThemeProvider>
          </WidgetProvider>
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
