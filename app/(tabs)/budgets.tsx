import { Ionicons } from "@expo/vector-icons";
import {
  StyledSafeAreaView,
  StyledView,
  StyledText,
  StyledTouchableOpacity,
} from "../../components/ui/StyledComponents";

export default function BudgetsScreen() {
  return (
    <StyledSafeAreaView className="flex-1 bg-white">
      <StyledView className="flex-1 px-6 pt-6">
        {/* Header */}
        <StyledView className="flex-row justify-between items-center mb-8">
          <StyledText className="text-2xl font-bold text-zinc-900">Bütçeler</StyledText>
          <StyledTouchableOpacity className="flex-row items-center bg-zinc-100 rounded-full px-4 py-2">
            <Ionicons name="add" size={18} color="#18181b" />
            <StyledText className="text-zinc-900 font-medium ml-1">Yeni</StyledText>
          </StyledTouchableOpacity>
        </StyledView>

        {/* Empty State */}
        <StyledView className="flex-1 items-center justify-center">
          <StyledView className="w-24 h-24 rounded-full bg-zinc-100 items-center justify-center mb-4">
            <Ionicons name="pie-chart-outline" size={48} color="#a1a1aa" />
          </StyledView>
          <StyledText className="text-zinc-900 font-semibold text-lg mb-2">
            Henüz bütçe yok
          </StyledText>
          <StyledText className="text-zinc-500 text-center leading-relaxed">
            Bütçe oluşturarak harcama{"\n"}hedeflerini takip et
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledSafeAreaView>
  );
}
