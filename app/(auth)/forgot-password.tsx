import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  StyledSafeAreaView,
  StyledView,
  StyledText,
  StyledTouchableOpacity,
  StyledAnimatedView,
  StyledAnimatedPressable,
} from "../../components/ui/StyledComponents";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useEmailValidation } from "../../hooks/useAuthValidation";

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const { error, validate } = useEmailValidation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const backButtonScale = useSharedValue(1);

  const backButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backButtonScale.value }],
  }));

  const handleResetPassword = async () => {
    if (!validate(email)) return;

    setIsLoading(true);
    const { error: resetError } = await resetPassword(email);
    setIsLoading(false);

    if (resetError) {
      Alert.alert(
        "Hata",
        "Şifre sıfırlama bağlantısı gönderilemedi. Lütfen tekrar deneyin."
      );
    } else {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <StyledSafeAreaView className="flex-1 bg-white">
        <StyledView className="flex-1 px-6 pt-8">
          {/* Back Button */}
          <StyledAnimatedView entering={FadeIn.duration(200)}>
            <StyledAnimatedPressable
              onPress={() => router.back()}
              onPressIn={() => {
                backButtonScale.value = withTiming(0.95, { duration: 100 });
              }}
              onPressOut={() => {
                backButtonScale.value = withTiming(1, { duration: 100 });
              }}
              style={backButtonStyle}
              className="w-10 h-10 items-center justify-center rounded-full bg-zinc-100 mb-6"
            >
              <Ionicons name="arrow-back" size={20} color="#18181b" />
            </StyledAnimatedPressable>
          </StyledAnimatedView>

          {/* Success State */}
          <StyledAnimatedView
            entering={FadeInDown.duration(300).delay(100)}
            className="flex-1 items-center justify-center px-4"
          >
            <StyledView className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-8">
              <Ionicons name="mail-outline" size={48} color="#22c55e" />
            </StyledView>
            <StyledText className="text-3xl font-bold text-zinc-900 text-center mb-4">
              E-posta Gönderildi
            </StyledText>
            <StyledText className="text-base text-zinc-500 text-center mb-8 leading-7">
              Şifre sıfırlama bağlantısı{"\n"}
              <StyledText className="font-semibold text-zinc-600">
                {email}
              </StyledText>
              {"\n"}adresine gönderildi.
            </StyledText>
            <Button
              title="Giriş Ekranına Dön"
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => router.replace("/(auth)/sign-in")}
            />
          </StyledAnimatedView>
        </StyledView>
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <StyledView className="flex-1 px-6 pt-8">
          {/* Back Button */}
          <StyledAnimatedView entering={FadeInDown.duration(250).delay(50)}>
            <StyledAnimatedPressable
              onPress={() => router.back()}
              onPressIn={() => {
                backButtonScale.value = withTiming(0.95, { duration: 100 });
              }}
              onPressOut={() => {
                backButtonScale.value = withTiming(1, { duration: 100 });
              }}
              style={backButtonStyle}
              className="w-10 h-10 items-center justify-center rounded-full bg-zinc-100 mb-6"
            >
              <Ionicons name="arrow-back" size={20} color="#18181b" />
            </StyledAnimatedPressable>
          </StyledAnimatedView>

          {/* Header */}
          <StyledAnimatedView
            entering={FadeInDown.duration(300).delay(100)}
            className="mb-10"
          >
            <StyledText className="text-3xl font-bold text-zinc-900 mb-2">
              Şifremi Unuttum
            </StyledText>
            <StyledText className="text-base text-zinc-500 leading-6">
              E-posta adresini gir, şifre sıfırlama bağlantısı gönderelim
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
              error={error}
              leftIcon="mail-outline"
            />
          </StyledAnimatedView>

          <StyledAnimatedView entering={FadeInDown.duration(300).delay(250)}>
            <Button
              title="Şifre Sıfırlama Bağlantısı Gönder"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              onPress={handleResetPassword}
            />
          </StyledAnimatedView>

          {/* Back to Sign In */}
          <StyledAnimatedView
            entering={FadeInDown.duration(300).delay(300)}
            className="flex-row justify-center items-center mt-8"
          >
            <StyledText className="text-zinc-500">Şifreni hatırladın mı? </StyledText>
            <StyledTouchableOpacity
              onPress={() => router.replace("/(auth)/sign-in")}
            >
              <StyledText className="text-zinc-900 font-semibold">
                Giriş Yap
              </StyledText>
            </StyledTouchableOpacity>
          </StyledAnimatedView>
        </StyledView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}
