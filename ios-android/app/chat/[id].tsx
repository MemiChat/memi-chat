import { StyleSheet } from "react-native";
import ChatContainer from "@/components/chat-container";
import { ThemedView } from "@/components/themed-view";
import TopBar from "@/components/top-bar";
import { useLocalSearchParams } from "expo-router";
import { AuthGuard } from "@/components/auth-guard";
import { SafeAreaView } from "react-native-safe-area-context";
import RandomBackground from "@/components/backgrounds/random";

export default function ChatScreen() {
  const { id } = useLocalSearchParams();

  return (
    <AuthGuard>
      <RandomBackground />
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <ThemedView style={styles.container}>
          <TopBar chatId={String(id)} />
          <ChatContainer chatId={String(id)} />
        </ThemedView>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
