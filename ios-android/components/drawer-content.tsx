import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Text, View, StyleSheet, Platform } from "react-native";
import PlusIcon from "@/icons/plus";
import DrawerProfile from "./drawer-profile";
import { useChatsStore, useUserStore } from "@/lib/store";
import { lightHapticFeedbackPress } from "@/lib/utils";
import { useEffect } from "react";
import { getChats } from "@/api/chat";
import { getMe } from "@/api/auth";
import { Image } from "expo-image";

const backgroundImages = {
  astronaut: require("@/assets/images/astronaut.png"),
  overcoat: require("@/assets/images/overcoat.png"),
  redhead: require("@/assets/images/redhead.png"),
};

function CustomDrawerContent({ state, navigation, ...props }: any) {
  const currentRoute = state.routes[state.index];
  const isMemiActive = currentRoute.name === "index";

  const store = useChatsStore();
  const chats = Object.values(store.chats).reverse();

  const userStore = useUserStore();
  const chatBackground = userStore.chatBackground || "";
  const drawerBackground = chatBackground
    ? backgroundImages[chatBackground as keyof typeof backgroundImages]
    : undefined;

  useEffect(() => {
    if (userStore.jwtToken && userStore.jwtTokenExpiry) {
      if (chats.length === 0) {
        console.log("Getting chats");
        getChats().then((chats) => {
          if (chats) {
            store.setChats(chats);
          }
        });
      }

      getMe().then((user) => {
        if (user) {
          userStore.setUser(user);
        }
      });
    }
  }, [userStore.jwtToken]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.absoluteFill}>
        <Image
          source={drawerBackground}
          style={styles.backgroundImage}
          contentFit="cover"
        />
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          borderRightWidth: 1,
          borderRightColor: "rgba(255, 255, 255, 0.21)", // @TODO: without border there is border flickering? without us setting the border? removing image fixes it?
        }}
      >
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{
            paddingTop: Platform.OS === "android" ? 45 : 75,
          }}
        >
          <DrawerItem
            label="New Memi Chat"
            onPress={() => {
              lightHapticFeedbackPress();
              navigation.navigate("index");
            }}
            focused={isMemiActive}
            icon={({ color, size }) => (
              <View
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.21)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.21)",
                  borderRadius: 6,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: isMemiActive ? 0 : 3,
                  marginRight: -3,
                }}
              >
                <PlusIcon color="rgba(255, 255, 255, 0.9)" size={18} />
              </View>
            )}
            activeTintColor="white"
            inactiveTintColor="rgba(255, 255, 255, 0.9)"
            activeBackgroundColor="rgba(255, 255, 255, 0.1)"
            style={styles.item}
            labelStyle={styles.itemLabel}
          />
          <Text
            style={{
              paddingTop: 21,
              paddingBottom: 10,
              paddingHorizontal: 15,
              fontSize: 15,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.9)",
            }}
          >
            All Chats
          </Text>
          {chats.map((chat) => {
            const isChatActive =
              currentRoute.name === "chat/[id]" &&
              currentRoute.params?.id === chat.id;
            return (
              <DrawerItem
                key={chat.id}
                label={chat.title}
                onPress={() => {
                  lightHapticFeedbackPress();
                  navigation.navigate("chat/[id]", { id: chat.id });
                }}
                focused={isChatActive}
                activeTintColor="white"
                inactiveTintColor="rgba(255, 255, 255, 0.9)"
                activeBackgroundColor="rgba(255, 255, 255, 0.1)"
                style={styles.item}
                labelStyle={styles.itemLabel}
              />
            );
          })}
        </DrawerContentScrollView>
        <DrawerProfile />
      </View>
    </View>
  );
}

export default CustomDrawerContent;

const styles = StyleSheet.create({
  itemLabel: {
    fontSize: 14.5,
    fontWeight: 600,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginVertical: 0,
    marginHorizontal: 0,
  },
  item: {
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginVertical: 0,
    marginHorizontal: 0,
    height: 54,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: -1,
  },
  absoluteFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    zIndex: -1,
  },
});
