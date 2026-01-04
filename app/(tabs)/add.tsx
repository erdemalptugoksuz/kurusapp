import { Ionicons } from "@expo/vector-icons";
import {
  StyledSafeAreaView,
  StyledView,
  StyledText,
} from "../../components/ui/StyledComponents";

export default function AddTransactionScreen() {
  return (
    <StyledSafeAreaView className="flex-1 bg-white">
      <StyledView className="flex-1 items-center justify-center px-6">
        <StyledView className="w-24 h-24 rounded-full bg-zinc-100 items-center justify-center mb-4">
          <Ionicons name="add-circle-outline" size={48} color="#a1a1aa" />
        </StyledView>
        <StyledText className="text-zinc-900 font-semibold text-lg mb-2">
          İşlem Ekle
        </StyledText>
        <StyledText className="text-zinc-500 text-center">
          Bu ekran yakında aktif olacak
        </StyledText>
      </StyledView>
    </StyledSafeAreaView>
  );
}
