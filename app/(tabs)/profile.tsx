import { Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  StyledSafeAreaView,
  StyledView,
  StyledText,
  StyledTouchableOpacity,
} from "../../components/ui/StyledComponents";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabından çıkış yapmak istediğine emin misin?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Çıkış Yap", style: "destructive", onPress: signOut },
      ]
    );
  };

  const menuItems = [
    {
      icon: "person-outline" as const,
      title: "Profil Bilgileri",
      subtitle: "Ad, e-posta, şifre",
    },
    {
      icon: "wallet-outline" as const,
      title: "Hesaplarım",
      subtitle: "Banka ve kart hesapları",
    },
    {
      icon: "pricetags-outline" as const,
      title: "Kategoriler",
      subtitle: "Gelir ve gider kategorileri",
    },
    {
      icon: "notifications-outline" as const,
      title: "Bildirimler",
      subtitle: "Hatırlatma ayarları",
    },
    {
      icon: "settings-outline" as const,
      title: "Ayarlar",
      subtitle: "Para birimi, dil",
    },
  ];

  return (
    <StyledSafeAreaView className="flex-1 bg-white">
      <StyledView className="flex-1 px-6 pt-6">
        {/* Header */}
        <StyledText className="text-2xl font-bold text-zinc-900 mb-8">
          Profil
        </StyledText>

        {/* User Info */}
        <StyledView className="flex-row items-center mb-8">
          <StyledView className="w-16 h-16 rounded-full bg-zinc-900 items-center justify-center">
            <StyledText className="text-white text-xl font-bold">
              {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || "K"}
            </StyledText>
          </StyledView>
          <StyledView className="ml-4 flex-1">
            <StyledText className="text-lg font-semibold text-zinc-900">
              {user?.user_metadata?.full_name || "Kullanıcı"}
            </StyledText>
            <StyledText className="text-zinc-500">{user?.email}</StyledText>
          </StyledView>
        </StyledView>

        {/* Menu Items */}
        <StyledView className="bg-zinc-50 rounded-2xl overflow-hidden">
          {menuItems.map((item, index) => (
            <StyledTouchableOpacity
              key={item.title}
              className={`flex-row items-center px-4 py-4 ${
                index < menuItems.length - 1 ? "border-b border-zinc-100" : ""
              }`}
            >
              <StyledView className="w-10 h-10 rounded-full bg-white items-center justify-center">
                <Ionicons name={item.icon} size={20} color="#18181b" />
              </StyledView>
              <StyledView className="flex-1 ml-3">
                <StyledText className="text-zinc-900 font-medium">{item.title}</StyledText>
                <StyledText className="text-zinc-500 text-sm">{item.subtitle}</StyledText>
              </StyledView>
              <Ionicons name="chevron-forward" size={20} color="#a1a1aa" />
            </StyledTouchableOpacity>
          ))}
        </StyledView>

        {/* Sign Out Button */}
        <StyledTouchableOpacity
          onPress={handleSignOut}
          className="flex-row items-center justify-center mt-8 py-4"
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <StyledText className="text-red-500 font-semibold ml-2">Çıkış Yap</StyledText>
        </StyledTouchableOpacity>
      </StyledView>
    </StyledSafeAreaView>
  );
}
