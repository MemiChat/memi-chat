import { useState } from "react";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { ThemedView } from "./themed-view";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import MenuIcon from "@/icons/menu";
import NewChatIcon from "@/icons/new-chat";
import { lightHapticFeedbackPress } from "@/lib/utils";
import { ThemedText } from "./themed-text";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import Popover from "react-native-popover-view";
import SparklesIcon from "@/icons/sparkles";
import DeleteIcon from "@/icons/delete";
import ChevronRightIcon from "@/icons/chevron-right";
import { useChatsStore } from "@/lib/store";

type DrawerParamList = {
  index: undefined;
  [key: string]: undefined | object;
};

export default function TopBar({
  chatId = "",
  hideNewChatIcon = false,
}: {
  chatId?: string;
  hideNewChatIcon?: boolean;
}) {
  const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();
  const router = useRouter();
  const messageBackground = useThemeColor({}, "messageBackground");
  const textColor = useThemeColor({}, "text");
  const store = useChatsStore();
  const [showPopover, setShowPopover] = useState(false);

  return (
    <ThemedView style={[styles.container]}>
      <MenuIcon
        size={24}
        color="rgba(255, 255, 255, 0.84)"
        onPress={() => {
          navigation.openDrawer();
        }}
        onPressIn={lightHapticFeedbackPress}
      />
      <Popover
        from={
          <TouchableOpacity
            style={styles.popoverOpen}
            onPress={() => setShowPopover(true)}
            onPressIn={lightHapticFeedbackPress}
          >
            <Text style={styles.title}>Memi</Text>
            <ChevronRightIcon
              color="rgba(255, 255, 255, 0.84)"
              size={16}
              style={{
                marginTop: 0.5,
              }}
            />
          </TouchableOpacity>
        }
        arrowSize={{
          width: -3,
          height: -3,
        }}
        popoverStyle={[styles.popover, { backgroundColor: messageBackground }]}
        isVisible={showPopover}
        onRequestClose={() => setShowPopover(false)}
      >
        {chatId ? (
          <TouchableOpacity
            onPress={() => {
              setShowPopover(false);
              router.push("/");
              store.deleteChat(chatId);
            }}
            style={styles.popoverContentContainer}
          >
            <DeleteIcon color="#ed1515" size={19} />
            <ThemedText
              style={{ fontWeight: 600, fontSize: 14.5, color: "#ed1515" }}
            >
              Delete Chat
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.popoverContentContainer}>
            <SparklesIcon color={textColor} size={19} />
            <ThemedText
              style={{ fontWeight: 600, fontSize: 14.5, color: textColor }}
            >
              AI Chat For People
            </ThemedText>
          </TouchableOpacity>
        )}
      </Popover>
      <NewChatIcon
        size={18}
        color={hideNewChatIcon ? "transparent" : "white"}
        onPress={() => router.push("/")}
        onPressIn={lightHapticFeedbackPress}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 0,
    paddingBottom: 0,
    borderBottomWidth: 1.5,
    borderBottomColor: "rgba(255, 255, 255, 0.15)",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgba(255, 255, 255, 0.84)",
  },
  popoverContentContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  popover: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  popoverOpen: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});
