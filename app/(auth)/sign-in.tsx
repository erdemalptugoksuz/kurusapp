import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { FadeInDown } from "react-native-reanimated";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  StyledSafeAreaView,
  StyledView,
  StyledText,
  StyledTouchableOpacity,
  StyledAnimatedView,
} from "../../components/ui/StyledComponents";
import { useAuth } from "../../contexts/AuthContext";
import { useSignInValidation } from "../../hooks/useAuthValidation";

export default function SignInScreen() {
  const { signIn } = useAuth();
  const { errors, validate } = useSignInValidation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!validate(email, password)) return;

    setIsLoading(true);
    const { error } = await signIn({ email, password });
    setIsLoading(false);

    if (error) {
      Alert.alert(
        "Giriş Başarısız",
        "E-posta veya şifre hatalı. Lütfen tekrar deneyin."
      );
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <StyledView className="flex-1 px-6 pt-12">
            {/* Header */}
            <StyledAnimatedView
              entering={FadeInDown.duration(300).delay(100)}
              className="mb-12"
            >
              <StyledText className="text-3xl font-bold text-zinc-900 mb-2">
                Hoş Geldin 👋
              </StyledText>
              <StyledText className="text-base text-zinc-500">
                Hesabına giriş yaparak devam et
              </StyledText>
            </StyledAnimatedView>

            {/* Form */}
            <StyledAnimatedView entering={FadeInDown.duration(300).delay(200)}>
              <Input
                label="E-posta"
                placeholder="ornek@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                leftIcon="mail-outline"
              />
            </StyledAnimatedView>

            <StyledAnimatedView entering={FadeInDown.duration(300).delay(250)}>
              <Input
                label="Şifre"
                placeholder="••••••••"
                isPassword
                autoCapitalize="none"
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                leftIcon="lock-closed-outline"
              />
            </StyledAnimatedView>

            {/* Forgot Password */}
            <StyledAnimatedView entering={FadeInDown.duration(300).delay(300)}>
              <StyledTouchableOpacity
                onPress={() => router.push("/(auth)/forgot-password")}
                className="self-end mb-6"
              >
                <StyledText className="text-zinc-600 font-medium">
                  Şifremi Unuttum
                </StyledText>
              </StyledTouchableOpacity>
            </StyledAnimatedView>

            <StyledAnimatedView entering={FadeInDown.duration(300).delay(350)}>
              <Button
                title="Giriş Yap"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                onPress={handleSignIn}
              />
            </StyledAnimatedView>

            {/* Sign Up Link */}
            <StyledAnimatedView
              entering={FadeInDown.duration(300).delay(400)}
              className="flex-row justify-center items-center mt-auto pb-8"
            >
              <StyledText className="text-zinc-500">Hesabın yok mu? </StyledText>
              <StyledTouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
                <StyledText className="text-zinc-900 font-semibold">
                  Kayıt Ol
                </StyledText>
              </StyledTouchableOpacity>
            </StyledAnimatedView>
          </StyledView>
        </ScrollView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}
