import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import "../global.css";
import { handleAuthDeepLink, isAuthDeepLink } from "../lib/deepLinking";

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isAuthenticated, isLoading, isRecoveryMode } = useAuth();
  const url = Linking.useURL();

  // Hide splash screen when auth state is loaded
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Process incoming deep links
  useEffect(() => {
    if (url && isAuthDeepLink(url)) {
      if (__DEV__) console.log("[RootLayout] Processing auth deep link:", url);
      handleAuthDeepLink(url);
    }
  }, [url]);

  // Show nothing while loading to prevent flicker
  if (isLoading) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom",
          animationDuration: 300,
          contentStyle: { backgroundColor: "#ffffff" },
        }}
      >
        <Stack.Screen name="index" options={{ animation: "fade" }} />

        {/* 
          Protected routes using Stack.Protected (Expo Router v6+)
          This feature provides declarative route guards based on conditions.
          
          - Auth routes: accessible when NOT authenticated OR in recovery mode
          - Tab routes: accessible when authenticated AND NOT in recovery mode
          
          @see https://docs.expo.dev/router/advanced/protected-routes/
        */}
        <Stack.Protected guard={!isAuthenticated || isRecoveryMode}>
          <Stack.Screen
            name="(auth)"
            options={{
              animation: "slide_from_right",
              animationDuration: 350,
            }}
          />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated && !isRecoveryMode}>
          <Stack.Screen
            name="(tabs)"
            options={{
              animation: "fade",
              animationDuration: 400,
            }}
          />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
