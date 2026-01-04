import { Pressable } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  SlideInRight,
  SlideInLeft,
  SlideOutRight,
  SlideOutLeft,
  LinearTransition,
  withSpring,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Easing,
  type WithSpringConfig,
  type WithTimingConfig,
} from "react-native-reanimated";

// Animated component exports
export const AnimatedView = Animated.View;
export const AnimatedText = Animated.Text;
export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Professional spring config - subtle and smooth
export const smoothSpringConfig: WithSpringConfig = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
};

// Professional timing config
export const smoothTimingConfig: WithTimingConfig = {
  duration: 250,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1), // ease-out
};

// Subtle fade animation
export const fadeIn = FadeIn.duration(200).easing(
  Easing.bezier(0.25, 0.1, 0.25, 1)
);
export const fadeOut = FadeOut.duration(150);

// Professional slide animations for screen transitions
export const slideInFromRight = SlideInRight.duration(300).easing(
  Easing.bezier(0.25, 0.1, 0.25, 1)
);
export const slideOutToLeft = SlideOutLeft.duration(250).easing(
  Easing.bezier(0.25, 0.1, 0.25, 1)
);
export const slideInFromLeft = SlideInLeft.duration(300).easing(
  Easing.bezier(0.25, 0.1, 0.25, 1)
);
export const slideOutToRight = SlideOutRight.duration(250).easing(
  Easing.bezier(0.25, 0.1, 0.25, 1)
);

// Subtle fade-in-down for content entrance
export const fadeInDown = FadeInDown.duration(300)
  .delay(50)
  .easing(Easing.bezier(0.25, 0.1, 0.25, 1));

export const fadeOutUp = FadeOutUp.duration(200);

// Layout transition for smooth reordering
export const layoutTransition = LinearTransition.duration(200);

// Professional staggered entrance - subtle delays
export const staggeredEntrance = (index: number, baseDelay = 0) =>
  FadeInDown.duration(300)
    .delay(baseDelay + index * 50)
    .easing(Easing.bezier(0.25, 0.1, 0.25, 1));

// Animation utilities
export {
  withSpring,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Easing,
};

// Re-export core animations
export {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutUp,
  SlideInRight,
  SlideInLeft,
  SlideOutRight,
  SlideOutLeft,
  LinearTransition,
};
