import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  StyledSafeAreaView,
  StyledView,
  StyledText,
  StyledTouchableOpacity,
  StyledAnimatedView,
  StyledAnimatedPressable,
} from "../../components/ui/StyledComponents";
import { useAuth } from "../../contexts/AuthContext";
import { useSignUpValidation } from "../../hooks/useAuthValidation";

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const { errors, validate } = useSignUpValidation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const backButtonScale = useSharedValue(1);

  const backButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backButtonScale.value }],
  }));

  const handleSignUp = async () => {
    if (!validate(fullName, email, password, acceptedTerms)) return;

    setIsLoading(true);
    const { error } = await signUp({ email, password, fullName });
    setIsLoading(false);

    if (error) {
      Alert.alert(
        "Kayıt Başarısız",
        "Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin."
      );
    } else {
      Alert.alert(
        "Kayıt Başarılı",
        "E-posta adresinize bir doğrulama bağlantısı gönderdik. Lütfen e-postanızı kontrol edin.",
        [{ text: "Tamam", onPress: () => router.replace("/(auth)/sign-in") }]
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
                Hesap Oluştur
              </StyledText>
              <StyledText className="text-base text-zinc-500">
                Finansal hedeflerine ulaşmak için hemen başla
              </StyledText>
            </StyledAnimatedView>

            {/* Form */}
            <StyledAnimatedView entering={FadeInDown.duration(300).delay(150)}>
              <Input
                label="Ad Soyad"
                placeholder="Adınız Soyadınız"
                autoCapitalize="words"
                autoComplete="name"
                value={fullName}
                onChangeText={setFullName}
                error={errors.fullName}
                leftIcon="person-outline"
              />
            </StyledAnimatedView>

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
                placeholder="En az 6 karakter"
                isPassword
                autoCapitalize="none"
                autoComplete="new-password"
                value={password}
                onChangeText={setPassword}
                error={errors.password}
                leftIcon="lock-closed-outline"
              />
            </StyledAnimatedView>

            {/* Terms Checkbox */}
            <StyledAnimatedView entering={FadeInDown.duration(300).delay(300)}>
              <StyledTouchableOpacity
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                className="flex-row items-start mb-6"
              >
                <StyledView
                  className={`w-6 h-6 rounded-md border-2 items-center justify-center mr-3 ${
                    acceptedTerms
                      ? "bg-zinc-900 border-zinc-900"
                      : "bg-transparent border-zinc-300"
                  }`}
                >
                  {acceptedTerms && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </StyledView>
                <StyledText className="flex-1 text-zinc-600 text-sm leading-5">
                  Devam ederek{" "}
                  <StyledText className="text-zinc-900 font-medium">
                    Kullanım Koşulları
                  </StyledText>{" "}
                  ve{" "}
                  <StyledText className="text-zinc-900 font-medium">
                    Gizlilik Politikası
                  </StyledText>
                  &apos;nı kabul ediyorum.
                </StyledText>
              </StyledTouchableOpacity>
              {errors.terms && (
                <StyledText className="text-red-500 text-sm mb-4 -mt-4">
                  {errors.terms}
                </StyledText>
              )}
            </StyledAnimatedView>

            <StyledAnimatedView entering={FadeInDown.duration(300).delay(350)}>
              <Button
                title="Kayıt Ol"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                onPress={handleSignUp}
              />
            </StyledAnimatedView>

            {/* Sign In Link */}
            <StyledAnimatedView
              entering={FadeInDown.duration(300).delay(400)}
              className="flex-row justify-center items-center mt-auto pb-8"
            >
              <StyledText className="text-zinc-500">Zaten hesabın var mı? </StyledText>
              <StyledTouchableOpacity
                onPress={() => router.replace("/(auth)/sign-in")}
              >
                <StyledText className="text-zinc-900 font-semibold">
                  Giriş Yap
                </StyledText>
              </StyledTouchableOpacity>
            </StyledAnimatedView>
          </StyledView>
        </ScrollView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}
