import { ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { StyledView } from "../components/ui/StyledComponents";
import { useAuth } from "../contexts/AuthContext";

export default function Index() {
  const { isAuthenticated, isLoading, isRecoveryMode } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <StyledView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#18181b" />
      </StyledView>
    );
  }

  // If in recovery mode, redirect to reset password screen
  if (isRecoveryMode) {
    return <Redirect href="/(auth)/reset-password" />;
  }

  // If authenticated, go to main app
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // If not authenticated, go to auth flow
  return <Redirect href="/(auth)/onboarding" />;
}
