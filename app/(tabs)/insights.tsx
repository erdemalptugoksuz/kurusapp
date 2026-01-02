import { Ionicons } from "@expo/vector-icons";
import {
  StyledSafeAreaView,
  StyledView,
  StyledText,
} from "../../components/ui/StyledComponents";

export default function InsightsScreen() {
  return (
    <StyledSafeAreaView className="flex-1 bg-white">
      <StyledView className="flex-1 px-6 pt-6">
        {/* Header */}
        <StyledView className="flex-row justify-between items-center mb-8">
          <StyledText className="text-2xl font-bold text-zinc-900">Raporlar</StyledText>
          <StyledView className="flex-row items-center bg-zinc-100 rounded-full px-4 py-2">
            <StyledText className="text-zinc-600 font-medium mr-1">Bu Hafta</StyledText>
            <Ionicons name="chevron-down" size={16} color="#52525b" />
          </StyledView>
        </StyledView>

        {/* Empty State */}
        <StyledView className="flex-1 items-center justify-center">
          <StyledView className="w-24 h-24 rounded-full bg-zinc-100 items-center justify-center mb-4">
            <Ionicons name="bar-chart-outline" size={48} color="#a1a1aa" />
          </StyledView>
          <StyledText className="text-zinc-900 font-semibold text-lg mb-2">
            Rapor için veri yok
          </StyledText>
          <StyledText className="text-zinc-500 text-center leading-relaxed">
            İşlem ekledikten sonra detaylı{"\n"}raporlarını burada görebilirsin
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledSafeAreaView>
  );
}
