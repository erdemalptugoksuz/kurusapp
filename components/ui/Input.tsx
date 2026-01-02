import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { TouchableOpacity, type TextInputProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import {
  StyledText,
  StyledAnimatedView,
  StyledTextInput,
} from "./StyledComponents";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
}

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
  const borderColor = useSharedValue(0);
  const shakeOffset = useSharedValue(0);

  // Update border on focus
  useEffect(() => {
    borderColor.value = withTiming(isFocused ? 1 : 0, { duration: 150 });
  }, [isFocused, borderColor]);

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

  const getBorderColor = () => {
    if (error) return "#ef4444";
    if (isFocused) return "#71717a";
    return "#e4e4e7";
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
          backgroundColor: "#fafafa",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: getBorderColor(),
          paddingHorizontal: 16,
          height: 52,
        }}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color="#71717a"
            style={{ marginRight: 12 }}
          />
        )}
        <StyledTextInput
          style={{
            flex: 1,
            color: "#18181b",
            fontSize: 16,
            padding: 0,
            margin: 0,
            height: "100%",
            textAlignVertical: "center",
          }}
          placeholderTextColor="#a1a1aa"
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
              color="#71717a"
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
