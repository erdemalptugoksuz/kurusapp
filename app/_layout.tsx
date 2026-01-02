import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { handleAuthDeepLink, isAuthDeepLink } from "../lib/deepLinking";
import "../global.css";

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isAuthenticated, isLoading, isRecoveryMode } = useAuth();
  const url = Linking.useURL();

  useEffect(() => {
    // Hide splash screen after a short delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

        {/* Protected routes - only accessible when NOT authenticated */}
        <Stack.Protected guard={!isAuthenticated || isRecoveryMode}>
          <Stack.Screen
            name="(auth)"
            options={{
              animation: "slide_from_right",
              animationDuration: 350,
            }}
          />
        </Stack.Protected>

        {/* Protected routes - only accessible when authenticated */}
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
