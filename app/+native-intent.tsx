import { handleAuthDeepLink, isAuthDeepLink } from "../lib/deepLinking";

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
  if (__DEV__)
    console.log("[NativeIntent] Incoming path:", path, "Initial:", initial);

  try {
    // Check if this is an auth callback URL
    if (isAuthDeepLink(path)) {
      if (__DEV__) console.log("[NativeIntent] Processing auth callback");
      return handleAuthCallbackAndRedirect(path);
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
 * Handles authentication callback URLs using centralized deepLinking module
 * Returns the appropriate redirect path based on auth result
 */
async function handleAuthCallbackAndRedirect(path: string): Promise<string> {
  if (__DEV__) console.log("[NativeIntent] Handling auth callback:", path);

  try {
    const result = await handleAuthDeepLink(path);

    if (!result.success) {
      if (__DEV__) console.error("[NativeIntent] Auth failed:", result.error);
      return "/(auth)/sign-in";
    }

    // handleAuthDeepLink already handles navigation via router.replace
    // Return the path that was navigated to for consistency
    if (result.type === "recovery") {
      return "/(auth)/reset-password";
    }

    return "/(tabs)";
  } catch (error) {
    if (__DEV__)
      console.error("[NativeIntent] Error handling auth callback:", error);
    return "/(auth)/sign-in";
  }
}
