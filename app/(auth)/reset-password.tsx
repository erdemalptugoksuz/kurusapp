import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  StyledSafeAreaView,
  StyledText,
  StyledView,
} from "../../components/ui/StyledComponents";
import { useAuth } from "../../contexts/AuthContext";
import { useResetPasswordValidation } from "../../hooks/useAuthValidation";

export default function ResetPasswordScreen() {
  const { updatePassword } = useAuth();
  const { errors, validate } = useResetPasswordValidation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Note: PASSWORD_RECOVERY event is handled by AuthContext
  // No need for a separate listener here

  const handleUpdatePassword = async () => {
    if (!validate(password, confirmPassword)) return;

    setIsLoading(true);
    const { error } = await updatePassword(password);
    setIsLoading(false);

    if (error) {
      Alert.alert("Hata", "Şifre güncellenemedi. Lütfen tekrar deneyin.");
    } else {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <StyledSafeAreaView className="flex-1 bg-white">
        <StyledView className="flex-1 items-center justify-center px-6">
          <StyledView className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-8">
            <Ionicons name="checkmark-circle" size={56} color="#22c55e" />
          </StyledView>
          <StyledText className="text-3xl font-bold text-zinc-900 text-center mb-4">
            Şifre Güncellendi
          </StyledText>
          <StyledText className="text-lg text-zinc-500 text-center mb-8 leading-7">
            Şifren başarıyla güncellendi.{"\n"}Artık yeni şifrenle giriş
            yapabilirsin.
          </StyledText>
          <Button
            title="Uygulamaya Git"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.replace("/(tabs)")}
          />
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
        <StyledView className="flex-1 px-6 pt-12">
          {/* Header */}
          <StyledView className="mb-10">
            <StyledView className="w-16 h-16 rounded-full bg-zinc-100 items-center justify-center mb-6">
              <Ionicons name="key-outline" size={32} color="#18181b" />
            </StyledView>
            <StyledText className="text-4xl font-bold text-zinc-900 mb-2">
              Yeni Şifre Belirle
            </StyledText>
            <StyledText className="text-lg text-zinc-500 leading-7">
              Hesabın için yeni ve güçlü bir şifre oluştur
            </StyledText>
          </StyledView>

          {/* Form */}
          <StyledView>
            <Input
              label="Yeni Şifre"
              placeholder="En az 8 karakter"
              isPassword
              autoCapitalize="none"
              autoComplete="new-password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              leftIcon="lock-closed-outline"
            />

            <Input
              label="Şifre Tekrarı"
              placeholder="Şifreni tekrar gir"
              isPassword
              autoCapitalize="none"
              autoComplete="new-password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              leftIcon="lock-closed-outline"
            />

            <Button
              title="Şifreyi Güncelle"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              onPress={handleUpdatePassword}
            />
          </StyledView>
        </StyledView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}
