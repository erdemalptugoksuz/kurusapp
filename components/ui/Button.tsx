import { ActivityIndicator, type ViewStyle } from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { StyledAnimatedPressable, StyledText } from "./StyledComponents";

interface ButtonProps {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Button({
  title,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  disabled,
  style,
  onPress,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
    opacity.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  // Variant classes - Dynamic styles need inline approach for variant-specific colors
  const variantClasses: Record<string, string> = {
    primary: "bg-zinc-900",
    secondary: "bg-zinc-100",
    outline: "bg-transparent border border-zinc-300",
    ghost: "bg-transparent",
  };

  const textClasses: Record<string, string> = {
    primary: "text-white",
    secondary: "text-zinc-900",
    outline: "text-zinc-900",
    ghost: "text-zinc-600",
  };

  const sizeClasses: Record<string, string> = {
    sm: "px-4 py-2",
    md: "px-6 py-3.5",
    lg: "px-8 py-4.5",
  };

  const textSizeClasses: Record<string, string> = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-base",
  };

  const baseClasses = `items-center justify-center rounded-xl ${
    variantClasses[variant]
  } ${sizeClasses[size]} ${fullWidth ? "w-full" : ""}`;

  return (
    <StyledAnimatedPressable
      className={baseClasses}
      style={[
        { opacity: disabled || isLoading ? 0.5 : 1 },
        animatedStyle,
        style,
      ]}
      disabled={disabled || isLoading}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#fff" : "#18181b"}
          size="small"
        />
      ) : (
        <StyledText
          className={`font-semibold ${textClasses[variant]} ${textSizeClasses[size]}`}
        >
          {title}
        </StyledText>
      )}
    </StyledAnimatedPressable>
  );
}
