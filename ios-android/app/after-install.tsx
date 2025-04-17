import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CloseIcon from "@/icons/close";
import { useRouter } from "expo-router";
import { useUserStore } from "@/lib/store";
import TreesBackground from "@/components/backgrounds/trees";
import { lightHapticFeedbackPress } from "@/lib/utils";

export default function AfterInstallScreen() {
  const router = useRouter();
  const userStore = useUserStore();

  function handleContinue() {
    userStore.setFirstTimeInstall(false);
    if (userStore.jwtToken && userStore.jwtTokenExpiry) {
      router.replace("/");
    } else {
      router.replace("/authentication");
    }
  }

  return (
    <View style={styles.container}>
      <TreesBackground />
      <SafeAreaView
        style={styles.contentContainer}
        edges={["top", "left", "right"]}
      >
        <View style={styles.contentContainer}>
          <CloseIcon
            onPress={handleContinue}
            onPressIn={lightHapticFeedbackPress}
            style={styles.closeIcon}
            color="white"
          />
          <View style={styles.titleContainer}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.appTitle}>Memi Chat</Text>
            <Text style={styles.welcomeText}>
              Use AI completely for free. Edit images and have group chats with
              AI.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            onPressIn={lightHapticFeedbackPress}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    height: "100%",
    padding: 20,
    justifyContent: "center",
  },
  continueText: {
    fontSize: 16,
    fontWeight: 500,
    color: "black",
  },
  continueButton: {
    backgroundColor: "white",
    paddingHorizontal: 30,
    paddingVertical: 13.5,
    borderRadius: 90,
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: 500,
    color: "white",
    textAlign: "center",
  },
  titleContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    marginBottom: 100,
  },
  closeIcon: {
    position: "absolute",
    top: 6,
    right: 9,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 90,
  },
  welcomeText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  appTitle: {
    fontWeight: "700",
    color: "white",
    fontSize: 36,
  },
});
