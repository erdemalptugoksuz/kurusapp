import AsyncStorage from "@react-native-async-storage/async-storage";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import Constants from "expo-constants";
import { router } from "expo-router";
import { supabase } from "./supabase";
import { RECOVERY_MODE_KEY } from "./constants";

/**
 * Deep link URL types for authentication
 */
type AuthDeepLinkType =
  | "recovery" // Password reset
  | "signup" // Email confirmation
  | "magiclink" // Magic link login
  | "invite"; // User invite

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

/**
 * Sets recovery mode flag in AsyncStorage
 * Used to persist recovery state across app restarts
 */
export const setRecoveryMode = async (): Promise<void> => {
  await AsyncStorage.setItem(RECOVERY_MODE_KEY, "true");
  if (__DEV__) console.log("[DeepLink] Recovery mode flag set");
};

/**
 * Clears recovery mode flag from AsyncStorage
 * Called after password update or on error
 */
export const clearRecoveryMode = async (): Promise<void> => {
  await AsyncStorage.removeItem(RECOVERY_MODE_KEY);
  if (__DEV__) console.log("[DeepLink] Recovery mode flag cleared");
};

interface DeepLinkResult {
  success: boolean;
  type?: AuthDeepLinkType;
  error?: string;
}

/**
 * Parses the deep link URL and extracts authentication parameters
 * @param url - The deep link URL to parse
 * @returns Parsed query parameters or null if invalid
 */
const parseDeepLinkUrl = (
  url: string
): { params: Record<string, string>; errorCode: string | null } | null => {
  try {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    return { params, errorCode };
  } catch (error) {
    if (__DEV__) console.error("[DeepLink] Failed to parse URL:", error);
    return null;
  }
};

/**
 * Creates a session from the deep link tokens
 * @param accessToken - The access token from the URL
 * @param refreshToken - The refresh token from the URL
 * @returns Whether the session was created successfully
 */
const createSessionFromTokens = async (
  accessToken: string,
  refreshToken: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      if (__DEV__) console.error("[DeepLink] Failed to set session:", error.message);
      return false;
    }

    if (__DEV__) console.log("[DeepLink] Session created successfully for user:", data.user?.email);
    return true;
  } catch (error) {
    if (__DEV__) console.error("[DeepLink] Unexpected error creating session:", error);
    return false;
  }
};

/**
 * Determines the auth type from URL parameters
 * @param params - The parsed URL parameters
 * @returns The auth type or undefined
 */
const getAuthType = (params: Record<string, string>): AuthDeepLinkType | undefined => {
  const type = params.type as AuthDeepLinkType | undefined;
  
  // Check for valid auth types
  if (type && ["recovery", "signup", "magiclink", "invite"].includes(type)) {
    return type;
  }
  
  return undefined;
};

/**
 * Handles navigation based on the auth type
 * @param type - The type of authentication action
 */
const navigateBasedOnAuthType = async (type: AuthDeepLinkType): Promise<void> => {
  switch (type) {
    case "recovery":
      // Recovery mode is already set before session creation/OTP verification
      // Just navigate to reset password screen
      if (__DEV__) console.log("[DeepLink] Navigating to reset password screen");
      router.replace("/(auth)/reset-password");
      break;
    case "signup":
    case "magiclink":
    case "invite":
      // Navigate to main app after successful verification
      if (__DEV__) console.log("[DeepLink] Navigating to main app");
      router.replace("/(tabs)");
      break;
    default:
      if (__DEV__) console.log("[DeepLink] Unknown auth type, navigating to main app");
      router.replace("/(tabs)");
  }
};

/**
 * Handles incoming deep link URLs for authentication
 * This function processes the URL, extracts tokens, creates a session,
 * and navigates to the appropriate screen
 * 
 * @param url - The deep link URL to handle
 * @returns Result of the deep link handling
 */
export const handleAuthDeepLink = async (url: string): Promise<DeepLinkResult> => {
  if (__DEV__) {
    console.log("[DeepLink] Handling URL:", url);
    console.log("[DeepLink] Running in Expo Go:", isExpoGo);
  }

  // Check if URL is from a valid scheme
  if (!hasValidScheme(url)) {
    if (__DEV__) console.log("[DeepLink] Invalid URL scheme");
    return { success: false, error: "Invalid URL scheme" };
  }

  // Parse the URL
  const parsed = parseDeepLinkUrl(url);
  
  if (!parsed) {
    return { success: false, error: "Failed to parse URL" };
  }

  const { params, errorCode } = parsed;

  // Check for errors in the URL (e.g., otp_expired, access_denied)
  if (errorCode || params.error || params.error_code) {
    const error = errorCode || params.error_code || params.error;
    const errorDescription = params.error_description?.replace(/\+/g, " ") || "Authentication failed";
    if (__DEV__) console.error("[DeepLink] Error in URL:", error, "-", errorDescription);
    
    // Navigate to sign-in with error state
    // In a real app, you might want to show an alert or error screen
    router.replace("/(auth)/sign-in");
    return { success: false, error: `${error}: ${errorDescription}` };
  }

  // Extract tokens from URL parameters
  const { access_token, refresh_token } = params;

  // Determine the auth type early
  const authType = getAuthType(params);

  // If this is a recovery flow, set the flag BEFORE creating session
  // This ensures AuthContext knows about recovery mode when it loads
  if (authType === "recovery") {
    await setRecoveryMode();
  }

  // If we don't have tokens, this might be a different type of deep link
  if (!access_token || !refresh_token) {
    if (__DEV__) console.log("[DeepLink] No tokens found in URL, checking for other params");
    
    // Check if there's a token_hash for OTP verification
    if (params.token_hash && params.type) {
      return handleOtpVerification(params);
    }
    
    return { success: false, error: "No authentication tokens found" };
  }

  // Create session from tokens
  const sessionCreated = await createSessionFromTokens(access_token, refresh_token);

  if (!sessionCreated) {
    // Clear recovery mode flag on error
    if (authType === "recovery") {
      await clearRecoveryMode();
    }
    return { success: false, error: "Failed to create session" };
  }

  // Navigate based on auth type
  if (authType) {
    await navigateBasedOnAuthType(authType);
    return { success: true, type: authType };
  }

  // Default: navigate to main app
  router.replace("/(tabs)");
  return { success: true };
};

/**
 * Handles OTP-based verification (token_hash flow)
 * @param params - URL parameters containing token_hash and type
 */
const handleOtpVerification = async (
  params: Record<string, string>
): Promise<DeepLinkResult> => {
  const { token_hash, type } = params;

  if (__DEV__) console.log("[DeepLink] Handling OTP verification, type:", type);

  // If this is a recovery flow, set the flag BEFORE verifying OTP
  // This ensures AuthContext knows about recovery mode when it loads
  if (type === "recovery") {
    await setRecoveryMode();
  }

  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "recovery" | "signup" | "email" | "magiclink" | "invite",
    });

    if (error) {
      if (__DEV__) console.error("[DeepLink] OTP verification failed:", error.message);
      // Clear recovery mode flag on error
      if (type === "recovery") {
        await clearRecoveryMode();
      }
      return { success: false, error: error.message };
    }

    if (__DEV__) console.log("[DeepLink] OTP verified successfully");

    // Navigate based on type
    const authType = type as AuthDeepLinkType;
    await navigateBasedOnAuthType(authType);

    return { success: true, type: authType };
  } catch (error) {
    if (__DEV__) console.error("[DeepLink] Unexpected error during OTP verification:", error);
    // Clear recovery mode flag on error
    if (type === "recovery") {
      await clearRecoveryMode();
    }
    return { success: false, error: "OTP verification failed" };
  }
};

/**
 * Checks if URL starts with a valid scheme
 * Supports both custom scheme (kurusapp://) and Expo Go (exp://)
 */
const hasValidScheme = (url: string): boolean => {
  // In Expo Go, links come as exp:// scheme
  if (isExpoGo) {
    return url.startsWith("exp://");
  }
  // In standalone/development builds, use custom scheme
  return url.startsWith("kurusapp://");
};

/**
 * Checks if a URL is an authentication deep link
 * @param url - The URL to check
 * @returns Whether the URL is an auth deep link
 */
export const isAuthDeepLink = (url: string): boolean => {
  if (!hasValidScheme(url)) {
    return false;
  }

  // Check if URL contains auth-related parameters (in query string or hash fragment)
  const hasAuthParams =
    url.includes("access_token=") ||
    url.includes("refresh_token=") ||
    url.includes("token_hash=") ||
    url.includes("type=recovery") ||
    url.includes("type=signup") ||
    url.includes("error=") ||
    url.includes("error_code=");

  return hasAuthParams;
};

