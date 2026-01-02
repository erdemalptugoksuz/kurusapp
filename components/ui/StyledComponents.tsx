import { withUniwind } from "uniwind";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import Animated from "react-native-reanimated";

// Styled versions of React Native components for Uniwind compatibility
export const StyledSafeAreaView = withUniwind(SafeAreaView);
export const StyledView = withUniwind(View);
export const StyledText = withUniwind(Text);
export const StyledScrollView = withUniwind(ScrollView);
export const StyledTouchableOpacity = withUniwind(TouchableOpacity);
export const StyledTextInput = withUniwind(TextInput);
export const StyledKeyboardAvoidingView = withUniwind(KeyboardAvoidingView);
export const StyledPressable = withUniwind(Pressable);

// Animated versions with Uniwind support
export const StyledAnimatedView = withUniwind(Animated.View);
export const StyledAnimatedText = withUniwind(Animated.Text);
export const StyledAnimatedPressable = withUniwind(
  Animated.createAnimatedComponent(Pressable)
);

