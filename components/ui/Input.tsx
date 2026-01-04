import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { TouchableOpacity, type TextInputProps } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  StyledAnimatedView,
  StyledText,
  StyledTextInput,
} from "./StyledComponents";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
}

/**
 * Color constants for Input component
 * Note: These are inline styles because Uniwind/Tailwind doesn't support
 * dynamic border colors with animated values. The colors match the Tailwind
 * zinc palette for consistency with the rest of the app.
 *
 * - zinc-200: #e4e4e7 (default border)
 * - zinc-500: #71717a (focused border, icon color)
 * - zinc-900: #18181b (text color)
 * - zinc-400: #a1a1aa (placeholder color)
 * - zinc-50:  #fafafa (background)
 * - red-500:  #ef4444 (error border)
 */
const INPUT_COLORS = {
  border: {
    default: "#e4e4e7",
    focused: "#71717a",
    error: "#ef4444",
  },
  background: "#fafafa",
  text: "#18181b",
  placeholder: "#a1a1aa",
  icon: "#71717a",
} as const;

export function Input({
  label,
  error,
  leftIcon,
  isPassword = false,
  ...props
}: InputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animation values
  const shakeOffset = useSharedValue(0);

  // Memoized border color based on error and focus state
  const borderColor = useMemo(() => {
    if (error) return INPUT_COLORS.border.error;
    if (isFocused) return INPUT_COLORS.border.focused;
    return INPUT_COLORS.border.default;
  }, [error, isFocused]);

  // Shake on error
  useEffect(() => {
    if (error) {
      shakeOffset.value = withSequence(
        withTiming(-4, { duration: 40, easing: Easing.linear }),
        withTiming(4, { duration: 40, easing: Easing.linear }),
        withTiming(-3, { duration: 40, easing: Easing.linear }),
        withTiming(3, { duration: 40, easing: Easing.linear }),
        withTiming(0, { duration: 40, easing: Easing.linear })
      );
    }
  }, [error, shakeOffset]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }],
  }));

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <StyledAnimatedView className="mb-4" style={containerAnimatedStyle}>
      {label && (
        <StyledText className="text-zinc-600 text-sm font-medium mb-2">
          {label}
        </StyledText>
      )}
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: INPUT_COLORS.background,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: borderColor,
          paddingHorizontal: 16,
          height: 52,
        }}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={INPUT_COLORS.icon}
            style={{ marginRight: 12 }}
          />
        )}
        <StyledTextInput
          style={{
            flex: 1,
            color: INPUT_COLORS.text,
            fontSize: 16,
            padding: 0,
            margin: 0,
            height: "100%",
            textAlignVertical: "center",
          }}
          placeholderTextColor={INPUT_COLORS.placeholder}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={INPUT_COLORS.icon}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <StyledText className="text-red-500 text-xs mt-1.5">{error}</StyledText>
      )}
    </StyledAnimatedView>
  );
}
