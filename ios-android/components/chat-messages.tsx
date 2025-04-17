import { useCallback, useRef, useEffect, useMemo } from "react";
import ChatMessage from "./chat-message";
import { StyleSheet, FlatList, ListRenderItem } from "react-native";
import { Message } from "@/lib/types";
import { useChatsStore } from "@/lib/store";
import { SYSTEM_ROLE } from "@/lib/helper";
import { randomUUID } from "expo-crypto";
import { getChatMessages } from "@/api/chat";

interface ChatMessagesProps {
  chatId: string;
  onMessagePress: (message: Message) => void;
  autoScroll: boolean;
  setAutoScroll: (autoScroll: boolean) => void;
}

export default function ChatMessages({
  chatId,
  onMessagePress,
  autoScroll,
  setAutoScroll,
}: ChatMessagesProps) {
  const flatListRef = useRef<FlatList>(null);
  const store = useChatsStore();
  const { getMessagesForChat, addMessage, setMessages } = store;
  const messages = getMessagesForChat(chatId);

  useEffect(() => {
    if (chatId && messages.length === 0) {
      addMessage({
        id: randomUUID(),
        chatId: chatId,
        role: SYSTEM_ROLE,
        text: "I am looking up our messages, please wait",
      });
      addMessage({
        id: randomUUID(),
        chatId: chatId,
        role: SYSTEM_ROLE,
        text: "",
      });
      fetchMessages();
    } else {
      if (
        messages.length > 0 &&
        messages[0].text === "I am looking up our messages, please wait"
      ) {
        fetchMessages();
      }
    }
  }, [chatId]);

  /*
  const messages = [
    {
      id: "1",
      role: "system",
      text: "hi",
    },
  ];
  */

  const flatListStyle = useMemo(() => ({ flex: 1 }), []);

  useEffect(() => {
    if (autoScroll && messages.length > 0 && flatListRef.current) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
        setAutoScroll(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [chatId]);

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item: message }) => (
      <ChatMessage message={message} onPress={onMessagePress} />
    ),
    [onMessagePress]
  );

  const keyExtractor = useCallback((message: Message) => message.id, []);

  const onContentSizeChange = useCallback(() => {
    const shouldScroll = autoScroll && messages.length > 0;

    if (shouldScroll) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [messages.length, autoScroll]);

  function fetchMessages() {
    getChatMessages(chatId).then((messages) => {
      if (messages) {
        setMessages(chatId, messages);
      } else {
        setMessages(chatId, []);
      }
    });
  }

  // Optimize FlatList with getItemLayout for fixed height items if possible
  // Note: Only enable this if your messages have predictable heights
  // const getItemLayout = useCallback(
  //   (_, index) => ({
  //     length: 100, // Approximate height of each item
  //     offset: 100 * index,
  //     index,
  //   }),
  //   []
  // );

  return (
    <FlatList
      style={flatListStyle}
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.container}
      keyboardDismissMode="on-drag"
      inverted={false}
      initialNumToRender={5}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews={true}
      onContentSizeChange={onContentSizeChange}
      onScrollBeginDrag={() => {
        setAutoScroll(false);
      }}
      updateCellsBatchingPeriod={50}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 8,
    paddingBottom: 24, // Add extra padding at the bottom to ensure messages aren't cut off
  },
});
