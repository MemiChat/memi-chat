import { View, Text, TouchableOpacity } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import SettingsIcon from "@/icons/settings";
import { useUserStore } from "@/lib/store";
import { useRouter } from "expo-router";
import { lightHapticFeedbackPress } from "@/lib/utils";

export default function DrawerProfile() {
  const router = useRouter();

  const userStore = useUserStore();

  function getInitials(name: string) {
    if (!name) {
      return "";
    }
    return name.charAt(0).toUpperCase() + name.charAt(1).toUpperCase();
  }

  return (
    <TouchableOpacity
      onPress={() => router.push("/settings")}
      onPressIn={lightHapticFeedbackPress}
      style={{
        paddingHorizontal: 30,
        paddingBottom: 36,
        paddingTop: 15,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: "100%",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderColor: "rgba(255, 255, 255, 0.15)",
            borderWidth: 1,
          }}
        >
          <Text style={{ color: "white", fontSize: 18 }}>
            {getInitials(userStore.user?.name || "")}
          </Text>
        </View>
        <View>
          <Text
            numberOfLines={1}
            style={{ color: "white", fontWeight: "600", fontSize: 16 }}
          >
            {userStore.user?.name}
          </Text>
        </View>
      </View>
      <SettingsIcon color="rgba(255, 255, 255, 0.75)" />
    </TouchableOpacity>
  );
}
