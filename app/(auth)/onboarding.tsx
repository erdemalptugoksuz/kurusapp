import { useRef, useState } from "react";
import {
  Dimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { router } from "expo-router";
import { FadeIn } from "react-native-reanimated";
import {
  StyledSafeAreaView,
  StyledView,
  StyledScrollView,
  StyledAnimatedView,
} from "../../components/ui/StyledComponents";
import { OnboardingSlide } from "../../components/auth/OnboardingSlide";
import { Button } from "../../components/ui/Button";
import { AnimatedDot } from "../../components/ui/AnimatedDot";
import type { ScrollView } from "react-native";

const { width } = Dimensions.get("window");

const slides = [
  {
    icon: "wallet-outline" as const,
    iconColor: "#22c55e",
    iconBgColor: "#dcfce7",
    title: "Harcamalarını Takip Et",
    description:
      "Tüm gelir ve giderlerini tek bir yerden kolayca takip et. Her işlemi kategorize ederek nereye para harcadığını gör.",
  },
  {
    icon: "pie-chart-outline" as const,
    iconColor: "#3b82f6",
    iconBgColor: "#dbeafe",
    title: "Bütçe Hedeflerini Belirle",
    description:
      "Kategorilere göre bütçe hedefleri oluştur ve harcamalarını kontrol altında tut. Limitlerini aştığında bildirim al.",
  },
  {
    icon: "trending-up-outline" as const,
    iconColor: "#a855f7",
    iconBgColor: "#f3e8ff",
    title: "Finansal Özgürlüğe Ulaş",
    description:
      "Detaylı raporlar ve grafiklerle finansal durumunu analiz et. Birikimlerini artır, hedeflerine ulaş.",
  },
];

export default function OnboardingScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
    } else {
      router.replace("/(auth)/sign-in");
    }
  };

  const goToSignIn = () => {
    router.replace("/(auth)/sign-in");
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-white">
      <StyledView className="flex-1">
        {/* Skip Button */}
        <StyledAnimatedView
          entering={FadeIn.delay(300).duration(200)}
          className="absolute top-4 right-6 z-10"
        >
          <Button title="Atla" variant="ghost" size="sm" onPress={goToSignIn} />
        </StyledAnimatedView>

        {/* Slides */}
        <StyledScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          className="flex-1"
        >
          {slides.map((slide, index) => (
            <OnboardingSlide
              key={index}
              icon={slide.icon}
              iconColor={slide.iconColor}
              iconBgColor={slide.iconBgColor}
              title={slide.title}
              description={slide.description}
            />
          ))}
        </StyledScrollView>

        {/* Animated Pagination Dots */}
        <StyledAnimatedView
          entering={FadeIn.delay(200).duration(200)}
          className="flex-row justify-center items-center mb-8"
        >
          {slides.map((_, index) => (
            <AnimatedDot key={index} isActive={index === currentIndex} />
          ))}
        </StyledAnimatedView>

        {/* Button */}
        <StyledAnimatedView
          entering={FadeIn.delay(400).duration(200)}
          className="px-6 pb-6"
        >
          <Button
            title={currentIndex === slides.length - 1 ? "Başla" : "Devam Et"}
            variant="primary"
            size="lg"
            fullWidth
            onPress={goToNext}
          />
        </StyledAnimatedView>
      </StyledView>
    </StyledSafeAreaView>
  );
}
