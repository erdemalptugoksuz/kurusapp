import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 300,
        contentStyle: { backgroundColor: "#ffffff" },
        gestureEnabled: true,
        gestureDirection: "horizontal",
      }}
    >
      <Stack.Screen
        name="onboarding"
        options={{
          animation: "fade",
          animationDuration: 400,
        }}
      />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen
        name="forgot-password"
        options={{
          animation: "slide_from_bottom",
          animationDuration: 350,
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          animation: "slide_from_bottom",
          animationDuration: 350,
        }}
      />
    </Stack>
  );
}
