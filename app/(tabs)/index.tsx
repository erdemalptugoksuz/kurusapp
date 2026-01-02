import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  StyledSafeAreaView,
  StyledView,
  StyledText,
  StyledPressable,
  StyledAnimatedView,
  StyledAnimatedPressable,
} from "../../components/ui/StyledComponents";
import { useAuth } from "../../contexts/AuthContext";

function LogoutButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <StyledAnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.95, { duration: 100 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 100 });
      }}
      style={animatedStyle}
      className="w-10 h-10 rounded-full bg-zinc-100 items-center justify-center"
    >
      <Ionicons name="log-out-outline" size={20} color="#18181b" />
    </StyledAnimatedPressable>
  );
}

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <StyledSafeAreaView className="flex-1 bg-white">
      <StyledView className="flex-1 px-6 pt-6">
        {/* Header */}
        <StyledAnimatedView
          entering={FadeInDown.duration(300).delay(50)}
          className="flex-row justify-between items-center mb-8"
        >
          <StyledView>
            <StyledText className="text-zinc-500 text-base">Merhaba 👋</StyledText>
            <StyledText className="text-2xl font-bold text-zinc-900">
              {user?.user_metadata?.full_name || "Kullanıcı"}
            </StyledText>
          </StyledView>
          <LogoutButton onPress={signOut} />
        </StyledAnimatedView>

        {/* Balance Card */}
        <StyledAnimatedView
          entering={FadeInDown.duration(300).delay(100)}
          className="bg-zinc-900 rounded-2xl p-6 mb-6"
        >
          <StyledText className="text-zinc-400 text-sm mb-1">
            Toplam Bakiye
          </StyledText>
          <StyledText className="text-white text-4xl font-bold">
            ₺0,00
          </StyledText>
          <StyledView className="flex-row mt-4 gap-4">
            <StyledView className="flex-1 rounded-xl p-3 bg-white/10">
              <StyledView className="flex-row items-center mb-1">
                <Ionicons name="arrow-up" size={16} color="#22c55e" />
                <StyledText className="text-zinc-400 text-xs ml-1">
                  Gelir
                </StyledText>
              </StyledView>
              <StyledText className="text-white font-semibold">
                ₺0,00
              </StyledText>
            </StyledView>
            <StyledView className="flex-1 rounded-xl p-3 bg-white/10">
              <StyledView className="flex-row items-center mb-1">
                <Ionicons name="arrow-down" size={16} color="#ef4444" />
                <StyledText className="text-zinc-400 text-xs ml-1">
                  Gider
                </StyledText>
              </StyledView>
              <StyledText className="text-white font-semibold">
                ₺0,00
              </StyledText>
            </StyledView>
          </StyledView>
        </StyledAnimatedView>

        {/* Recent Transactions Header */}
        <StyledAnimatedView
          entering={FadeInDown.duration(300).delay(150)}
          className="flex-row justify-between items-center mb-4"
        >
          <StyledText className="text-lg font-semibold text-zinc-900">
            Son İşlemler
          </StyledText>
          <StyledPressable>
            <StyledText className="text-zinc-500">Tümünü Gör</StyledText>
          </StyledPressable>
        </StyledAnimatedView>

        {/* Empty State */}
        <StyledAnimatedView
          entering={FadeInDown.duration(300).delay(200)}
          className="flex-1 items-center justify-center"
        >
          <StyledView className="w-20 h-20 rounded-full bg-zinc-100 items-center justify-center mb-4">
            <Ionicons name="receipt-outline" size={40} color="#a1a1aa" />
          </StyledView>
          <StyledText className="text-zinc-900 font-semibold text-lg mb-2">
            Henüz işlem yok
          </StyledText>
          <StyledText className="text-zinc-500 text-center">
            İlk işlemini ekleyerek{"\n"}harcamalarını takip etmeye başla
          </StyledText>
        </StyledAnimatedView>
      </StyledView>
    </StyledSafeAreaView>
  );
}
