import React, { memo, useMemo } from "react";
import { Message } from "@/lib/types";
import { Pressable, StyleSheet, View, Text } from "react-native";
import SmileAnimation from "./smile";
import { SYSTEM_ROLE, USER_ROLE } from "@/lib/helper";
import Markdown from "./markdown-display";
import { useChatsStore } from "@/lib/store";

interface ChatMessageProps {
  message: Message;
  onPress: (message: Message) => void;
}

const ChatMessage = memo(({ message, onPress }: ChatMessageProps) => {
  const chatStore = useChatsStore();
  const typingAnimation = chatStore.typingAnimation;

  const handlePress = () => {
    onPress(message);
  };

  const handleLongPress = () => {
    onPress(message);
  };

  const containerStyle = useMemo(
    () => [
      message.role === USER_ROLE
        ? styles.userMessageContainer
        : styles.systemMessageContainer,
    ],
    [message.role]
  );

  const markdownStyle = useMemo(
    () => ({
      body: { color: "rgba(255, 255, 255, 0.9)" },
      heading2: {
        fontSize: 14.5,
        fontWeight: "bold",
        marginTop: 6,
        marginBottom: 4,
      },
    }),
    []
  );

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={300}
    >
      <View style={containerStyle}>
        <Markdown style={markdownStyle}>{message.text}</Markdown>

        {message.role === SYSTEM_ROLE &&
          message.text.length === 0 &&
          (typingAnimation === "smile" ? (
            <SmileAnimation />
          ) : (
            <Text style={styles.typingText}>{typingAnimation}</Text>
          ))}
      </View>
    </Pressable>
  );
});

export default ChatMessage;

const styles = StyleSheet.create({
  userMessageContainer: {
    maxWidth: "80%",
    alignSelf: "flex-end",
    paddingVertical: 4.2,
    paddingHorizontal: 16.5,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.21)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  systemMessageContainer: {
    maxWidth: "93%",
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  loadingIndicator: {
    marginTop: 0,
  },
  typingText: {
    color: "#d4d4d4",
  },
});
