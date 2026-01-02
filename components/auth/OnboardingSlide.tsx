import { Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StyledView, StyledText } from "../ui/StyledComponents";

const { width } = Dimensions.get("window");

interface OnboardingSlideProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
}

export function OnboardingSlide({
  icon,
  iconColor,
  iconBgColor,
  title,
  description,
}: OnboardingSlideProps) {
  return (
    <StyledView
      className="flex-1 items-center justify-center px-8"
      style={{ width }}
    >
      {/* Icon */}
      <StyledView
        className="w-32 h-32 rounded-full items-center justify-center mb-12"
        style={{ backgroundColor: iconBgColor }}
      >
        <Ionicons name={icon} size={56} color={iconColor} />
      </StyledView>

      {/* Title */}
      <StyledText className="text-3xl font-bold text-zinc-900 text-center mb-4">
        {title}
      </StyledText>

      {/* Description */}
      <StyledText className="text-base text-zinc-500 text-center leading-relaxed px-2">
        {description}
      </StyledText>
    </StyledView>
  );
}
