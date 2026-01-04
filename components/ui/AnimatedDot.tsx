import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface AnimatedDotProps {
  isActive: boolean;
  activeColor?: string;
  inactiveColor?: string;
}

export function AnimatedDot({
  isActive,
  activeColor = "#18181b",
  inactiveColor = "#d4d4d8",
}: AnimatedDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isActive ? 24 : 8, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      backgroundColor: withTiming(isActive ? activeColor : inactiveColor, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
      opacity: withTiming(isActive ? 1 : 0.5, {
        duration: 200,
      }),
    };
  }, [isActive, activeColor, inactiveColor]);

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 4,
          marginHorizontal: 4,
        },
        animatedStyle,
      ]}
    />
  );
}

