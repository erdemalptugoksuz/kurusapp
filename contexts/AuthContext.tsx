import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { makeRedirectUri } from "expo-auth-session";
import { useRouter } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { RECOVERY_MODE_KEY } from "../lib/constants";
import type {
  AuthContextType,
  SignInCredentials,
  SignUpCredentials,
} from "../types/auth";

// Generate redirect URI that works in both Expo Go and standalone builds
// Expo Go uses exp:// scheme, standalone builds use custom scheme
const redirectUri = makeRedirectUri({
  scheme: "kurusapp",
  path: "auth/callback",
});

const passwordResetUri = makeRedirectUri({
  scheme: "kurusapp",
  path: "reset-password",
});

if (__DEV__) {
  console.log("[AuthContext] Redirect URI:", redirectUri);
  console.log("[AuthContext] Password Reset URI:", passwordResetUri);
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const isInitialLoad = useRef(true);
  const router = useRouter();

  // Handle navigation based on auth state changes
  const handleAuthNavigation = useCallback(
    (event: AuthChangeEvent, newSession: Session | null) => {
      // Skip navigation during initial load - let app/index.tsx handle it
      if (isInitialLoad.current) {
        return;
      }

      // Handle password recovery - navigate to reset password screen
      if (event === "PASSWORD_RECOVERY" && newSession) {
        if (__DEV__) console.log("[AuthContext] Password recovery event detected");
        setIsRecoveryMode(true);
        AsyncStorage.setItem(RECOVERY_MODE_KEY, "true");
        router.replace("/(auth)/reset-password");
        return;
      }

      // Only navigate on explicit sign in/out events
      if (event === "SIGNED_IN" && newSession) {
        router.replace("/(tabs)");
      } else if (event === "SIGNED_OUT") {
        router.replace("/(auth)/sign-in");
      }
    },
    [router]
  );

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      // Check if we're in recovery mode (persisted)
      const storedRecoveryMode = await AsyncStorage.getItem(RECOVERY_MODE_KEY);
      if (storedRecoveryMode === "true") {
        setIsRecoveryMode(true);
      }

      // Get initial session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      // Mark initial load as complete after state updates are flushed
      // Using queueMicrotask ensures React state updates are processed first
      queueMicrotask(() => {
        isInitialLoad.current = false;
        if (__DEV__) console.log("[AuthContext] Initial load complete");
      });
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      // Handle navigation for auth state changes
      handleAuthNavigation(event, session);
    });

    return () => subscription.unsubscribe();
  }, [handleAuthNavigation]);

  const signIn = async ({
    email,
    password,
  }: SignInCredentials): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error ?? null };
  };

  const signUp = async ({
    email,
    password,
    fullName,
  }: SignUpCredentials): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: redirectUri,
      },
    });
    return { error: error ?? null };
  };

  const signOut = async (): Promise<void> => {
    // Clear recovery mode when signing out
    setIsRecoveryMode(false);
    await AsyncStorage.removeItem(RECOVERY_MODE_KEY);
    // Using default scope (local) - clears session from device only
    // This is intentional for better UX: allows user to stay signed in on other devices
    // For complete logout from all devices, use { scope: "global" }
    await supabase.auth.signOut();
  };

  const resetPassword = async (
    email: string
  ): Promise<{ error: Error | null }> => {
    // Clear existing session before sending reset email
    // This prevents the user from being auto-logged in when reopening the app
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    if (currentSession) {
      await supabase.auth.signOut({ scope: "local" });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: passwordResetUri,
    });
    return { error: error ?? null };
  };

  const updatePassword = async (
    newPassword: string
  ): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    // Clear recovery mode after successful password update
    if (!error) {
      setIsRecoveryMode(false);
      await AsyncStorage.removeItem(RECOVERY_MODE_KEY);
    }

    return { error: error ?? null };
  };

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    isAuthenticated: !!session && !isRecoveryMode,
    isRecoveryMode,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
