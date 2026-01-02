import * as QueryParams from "expo-auth-session/build/QueryParams";
import { supabase } from "../lib/supabase";

/**
 * This file intercepts incoming deep links before Expo Router handles them.
 * It processes authentication callbacks and redirects to appropriate screens.
 *
 * @see https://docs.expo.dev/router/advanced/native-intent/
 */

interface RedirectSystemPathOptions {
  path: string;
  initial: boolean;
}

/**
 * Redirects incoming system paths for authentication handling
 * Called before Expo Router processes the URL
 */
export function redirectSystemPath({
  path,
  initial,
}: RedirectSystemPathOptions): string | Promise<string> {
  if (__DEV__) console.log("[NativeIntent] Incoming path:", path, "Initial:", initial);

  try {
    // Check if this is an auth callback URL
    if (isAuthCallback(path)) {
      if (__DEV__) console.log("[NativeIntent] Processing auth callback");
      return handleAuthCallback(path);
    }

    // Return the original path for normal navigation
    return path;
  } catch (error) {
    if (__DEV__) console.error("[NativeIntent] Error processing path:", error);
    // On error, redirect to sign-in
    return "/(auth)/sign-in";
  }
}

/**
 * Checks if the URL is an authentication callback
 */
function isAuthCallback(path: string): boolean {
  // Check for auth-related paths or parameters
  const isAuthPath =
    path.includes("/auth/callback") ||
    path.includes("/reset-password") ||
    path.includes("access_token=") ||
    path.includes("refresh_token=") ||
    path.includes("token_hash=") ||
    path.includes("type=recovery") ||
    path.includes("type=signup") ||
    path.includes("error=");

  return isAuthPath;
}

/**
 * Handles authentication callback URLs
 * Extracts tokens, creates session, and returns the appropriate redirect path
 */
async function handleAuthCallback(path: string): Promise<string> {
  if (__DEV__) console.log("[NativeIntent] Handling auth callback:", path);

  try {
    // Parse the URL parameters (handles both query string and hash fragment)
    const { params, errorCode } = QueryParams.getQueryParams(path);

    // Check for errors in the URL
    if (errorCode || params.error || params.error_code) {
      const error = errorCode || params.error_code || params.error;
      const errorDescription =
        params.error_description?.replace(/\+/g, " ") ||
        "Kimlik doğrulama başarısız";
      if (__DEV__) console.error("[NativeIntent] Auth error:", error, "-", errorDescription);
      // Redirect to sign-in on error
      return "/(auth)/sign-in";
    }

    const { access_token, refresh_token, type } = params;

    // If we have tokens, create a session
    if (access_token && refresh_token) {
      if (__DEV__) console.log("[NativeIntent] Setting session with tokens");

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        if (__DEV__) console.error("[NativeIntent] Failed to set session:", error.message);
        return "/(auth)/sign-in";
      }

      if (__DEV__) console.log("[NativeIntent] Session created successfully");

      // Redirect based on auth type
      if (type === "recovery") {
        if (__DEV__) console.log("[NativeIntent] Redirecting to reset password");
        return "/(auth)/reset-password";
      }

      // For signup confirmation, magiclink, etc. - go to main app
      if (__DEV__) console.log("[NativeIntent] Redirecting to main app");
      return "/(tabs)";
    }

    // Handle OTP verification (token_hash flow)
    if (params.token_hash && params.type) {
      if (__DEV__) console.log("[NativeIntent] Verifying OTP, type:", params.type);

      const { error } = await supabase.auth.verifyOtp({
        token_hash: params.token_hash,
        type: params.type as
          | "recovery"
          | "signup"
          | "email"
          | "magiclink"
          | "invite",
      });

      if (error) {
        if (__DEV__) console.error("[NativeIntent] OTP verification failed:", error.message);
        return "/(auth)/sign-in";
      }

      if (__DEV__) console.log("[NativeIntent] OTP verified successfully");

      // Redirect based on type
      if (params.type === "recovery") {
        return "/(auth)/reset-password";
      }

      return "/(tabs)";
    }

    // No tokens found, redirect to sign-in
    if (__DEV__) console.log("[NativeIntent] No auth tokens found");
    return "/(auth)/sign-in";
  } catch (error) {
    if (__DEV__) console.error("[NativeIntent] Error handling auth callback:", error);
    return "/(auth)/sign-in";
  }
}
