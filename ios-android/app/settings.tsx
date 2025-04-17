import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  TextInput,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import { ThemedView } from "@/components/themed-view";
import { AuthGuard } from "@/components/auth-guard";
import CloseIcon from "@/icons/close";
import { useRouter } from "expo-router";
import { lightHapticFeedbackPress } from "@/lib/utils";
import { useThemeColor } from "@/hooks/useThemeColor";
import EmailIcon from "@/icons/email";
import { ThemedText } from "@/components/themed-text";
import BookmarkAIIcon from "@/icons/bookmark-ai";
import Constants from "expo-constants";
import ComputeCloudIcon from "@/icons/compute-cloud";
import ClipboardTextIcon from "@/icons/clipboard-text";
import LockIcon from "@/icons/lock";
import LogOutIcon from "@/icons/log-out";
import { useUserStore } from "@/lib/store";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef, useState } from "react";
import { changeMemory, getMemory } from "@/api/memory";
import * as WebBrowser from "expo-web-browser";
import { deleteMe } from "@/api/auth";
import { GENERIC_SUCCESS_MESSAGE } from "@/lib/helper";

function ManageMemory({ isVisible }: { isVisible: boolean }) {
  const agentSelectionTitleText = useThemeColor({}, "agentSelectionTitleText");
  const agentSelectionDescriptionText = useThemeColor(
    {},
    "agentSelectionDescriptionText"
  );
  const editAgentInputBackground = useThemeColor(
    {},
    "editAgentInputBackground"
  );
  const color = useThemeColor({}, "text");
  const [memory, setMemory] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMemoryChange = (text: string) => {
    setMemory(text);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      changeMemory(text);
    }, 1500);
  };

  useEffect(() => {
    getMemory().then((memory) => {
      if (memory) {
        setMemory(memory);
      }
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible]);

  return (
    <BottomSheetView
      style={styles.bottomSheetContent}
      children={
        <View style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Text style={[styles.labelText, { color: agentSelectionTitleText }]}>
            Memory
          </Text>
          <TextInput
            value={memory}
            onChangeText={handleMemoryChange}
            placeholder="Memory an AI has of you"
            multiline={true}
            style={[
              styles.multilineTextInput,
              { color, backgroundColor: editAgentInputBackground },
            ]}
            placeholderTextColor="gray"
          />
          <Text
            style={[styles.labelText, { color: agentSelectionDescriptionText }]}
          >
            Experimental feature. Only works in Group Chat.
          </Text>
        </View>
      }
    />
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const agentSelectionTitleText = useThemeColor({}, "agentSelectionTitleText");
  const settingsItemContainerBg = useThemeColor({}, "settingsItemContainerBg");
  const color = useThemeColor({}, "text");
  const settingsBackground = useThemeColor({}, "settingsBackground");
  const bottomSheetBackground = useThemeColor({}, "bottomSheetBackground");
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isVisible, setIsVisible] = useState(false);

  const appVersion = Constants.expoConfig?.version || "Unknown";

  const userStore = useUserStore();

  const handleSheetClose = useCallback(() => {
    Keyboard.dismiss();
    bottomSheetRef.current?.close();
    setIsVisible(false);
  }, []);

  const handleSheetOpen = useCallback(() => {
    bottomSheetRef.current?.expand();
    setIsVisible(true);
  }, []);

  const openBrowser = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Error opening browser:", error);
    }
  };

  return (
    <AuthGuard>
      <SafeAreaView
        style={[styles.container, { backgroundColor: settingsBackground }]}
        edges={["top", "left", "right"]}
      >
        <ThemedView style={styles.container}>
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <CloseIcon
                onPress={() => router.back()}
                onPressIn={lightHapticFeedbackPress}
                style={styles.closeIcon}
                color="gray"
              />
              <ThemedText style={[styles.headerText, { color }]}>
                Settings
              </ThemedText>
              <CloseIcon
                onPress={() => router.back()}
                onPressIn={lightHapticFeedbackPress}
                style={styles.closeIcon}
                color="transparent"
              />
            </View>
            <View style={styles.sectionContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: agentSelectionTitleText },
                ]}
              >
                ACCOUNT
              </Text>
              <View
                style={[
                  styles.sectionBody,
                  { backgroundColor: settingsItemContainerBg },
                ]}
              >
                <View style={styles.settingsItem}>
                  <View style={styles.iconTextContainer}>
                    <EmailIcon color={color} />
                    <Text style={[styles.settingLabel, { color }]}>Email</Text>
                  </View>
                  <Text
                    style={[
                      styles.settingValue,
                      { color: agentSelectionTitleText },
                    ]}
                  >
                    {userStore.user?.email}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleSheetOpen}
                  onPressIn={lightHapticFeedbackPress}
                  style={[
                    styles.settingsItem,
                    styles.noBorder,
                    styles.removeTopMargin,
                  ]}
                >
                  <View style={styles.iconTextContainer}>
                    <BookmarkAIIcon color={color} />
                    <Text style={[styles.settingLabel, { color }]}>Memory</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.sectionContainer}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: agentSelectionTitleText },
                ]}
              >
                APP
              </Text>
              <View
                style={[
                  styles.sectionBody,
                  { backgroundColor: settingsItemContainerBg },
                ]}
              >
                <View style={styles.settingsItem}>
                  <View style={styles.iconTextContainer}>
                    <ComputeCloudIcon color={color} />
                    <Text style={[styles.settingLabel, { color }]}>
                      Version
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.settingValue,
                      { color: agentSelectionTitleText },
                    ]}
                  >
                    {appVersion}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.settingsItem, styles.removeTopMargin]}
                  onPress={() => openBrowser("https://memichat.com/terms")}
                  onPressIn={lightHapticFeedbackPress}
                >
                  <View style={styles.iconTextContainer}>
                    <ClipboardTextIcon color={color} />
                    <Text style={[styles.settingLabel, { color }]}>
                      Terms of Service
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.settingsItem,
                    styles.noBorder,
                    styles.removeTopMargin,
                  ]}
                  onPress={() => openBrowser("https://memichat.com/privacy")}
                  onPressIn={lightHapticFeedbackPress}
                >
                  <View style={styles.iconTextContainer}>
                    <LockIcon color={color} />
                    <Text style={[styles.settingLabel, { color }]}>
                      Privacy Policy
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.sectionContainer}>
              <View
                style={[
                  styles.sectionBody,
                  { backgroundColor: settingsItemContainerBg },
                ]}
              >
                <TouchableOpacity
                  onPress={() => userStore.logout()}
                  onPressIn={lightHapticFeedbackPress}
                  style={[styles.settingsItem, styles.noBorder]}
                >
                  <View style={styles.iconTextContainer}>
                    <LogOutIcon color={color} />
                    <Text style={[styles.settingLabel, { color }]}>
                      Log Out
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.sectionContainer}>
              <View
                style={[
                  styles.sectionBody,
                  { backgroundColor: settingsItemContainerBg },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      "Delete Account",
                      "Are you sure? This action is irreversible. It will delete your account permanently",
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "Delete Account",
                          style: "destructive",
                          onPress: async () => {
                            const res = await deleteMe();
                            if (res === GENERIC_SUCCESS_MESSAGE) {
                              userStore.logout();
                            } else {
                              Alert.alert("Error", res);
                            }
                          },
                        },
                      ]
                    );
                  }}
                  onPressIn={lightHapticFeedbackPress}
                  style={[styles.settingsItem, styles.noBorder]}
                >
                  <View style={styles.iconTextContainer}>
                    <LogOutIcon color="red" />
                    <Text
                      style={[
                        styles.settingLabel,
                        { color: "red", fontWeight: 600 },
                      ]}
                    >
                      Delete Account
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ThemedView>
      </SafeAreaView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["93%"]}
        enablePanDownToClose
        onClose={handleSheetClose}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: bottomSheetBackground }}
        handleIndicatorStyle={{ backgroundColor: color }}
        animationConfigs={{
          damping: 20,
          stiffness: 150,
        }}
        overDragResistanceFactor={0.5}
      >
        <ManageMemory isVisible={isVisible} />
      </BottomSheet>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    paddingVertical: 9,
    paddingHorizontal: 6,
  },
  closeIcon: {
    zIndex: 100,
  },
  headerText: {
    fontSize: 17,
    fontWeight: "500",
    textAlign: "center",
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contentContainer: {
    paddingTop: Platform.OS === "android" ? 30 : 60,
    paddingHorizontal: 10,
    display: "flex",
    flexDirection: "column",
    gap: 30,
  },
  sectionContainer: {
    paddingHorizontal: 10,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "400",
  },
  sectionBody: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    borderRadius: 10,
  },
  settingsItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  iconTextContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  settingLabel: {
    fontWeight: "400",
  },
  settingValue: {
    fontWeight: "400",
  },
  removeTopMargin: {
    marginTop: -7.5,
  },
  bottomSheetContent: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 30,
    paddingBottom: 45,
  },
  labelText: {
    fontSize: 14,
    fontWeight: 400,
  },
  multilineTextInput: {
    borderRadius: 6,
    height: 330,
    paddingHorizontal: 10,
    textAlignVertical: "top",
  },
});
