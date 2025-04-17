import ChatMessages from "@/components/chat-messages";
import { Keyboard, StyleSheet } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import { useSharedValue } from "react-native-reanimated";
import ChatInput from "@/components/chat-input";
import { ThemedView } from "./themed-view";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useCallback, useRef, useState } from "react";
import { Message } from "@/lib/types";
import { useThemeColor } from "@/hooks/useThemeColor";
import SelectableText from "./selectable-text";
import { randomUUID } from "expo-crypto";
import { useRouter } from "expo-router";
import { useAgentsStore, useChatsStore } from "@/lib/store";
import { SYSTEM_ROLE, USER_ROLE } from "@/lib/helper";
import {
  createChat,
  streamAgentMessage,
  streamMessage,
  updateMemory,
} from "@/api/chat";
import AgentSelection from "./agent-selection";
import {
  createAgentsWithRandomDuplicates,
  transformHistoryForGemini,
} from "@/lib/utils";

export default function ChatContainer({ chatId }: { chatId: string }) {
  const keyboardHeight = useSharedValue(0);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const agentSelectionRef = useRef<BottomSheet>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const bottomSheetBackground = useThemeColor({}, "bottomSheetBackground");
  const agentSelectionBackground = useThemeColor(
    {},
    "agentSelectionBackground"
  );
  const color = useThemeColor({}, "text");
  const [autoScroll, setAutoScroll] = useState(true);
  const router = useRouter();
  const agentsStore = useAgentsStore();
  const store = useChatsStore();
  const {
    addChat,
    addMessage,
    updateMessageText,
    addTextToMessage,
    updateChatTitle,
    getLast50MessagesForChat,
    setTypingAnimation,
  } = store;

  useKeyboardHandler(
    {
      onMove: (e) => {
        "worklet";
        keyboardHeight.value =
          typeof e.height === "number" && !isNaN(e.height) ? e.height : 0;
      },
      onEnd: (e) => {
        "worklet";
        keyboardHeight.value =
          typeof e.height === "number" && !isNaN(e.height) ? e.height : 0;
      },
    },
    []
  );

  const handleMessagePress = useCallback((message: Message) => {
    setSelectedMessage(message);
    bottomSheetRef.current?.expand();
  }, []);

  const handleSheetClose = useCallback(() => {
    setSelectedMessage(null);
    bottomSheetRef.current?.close();
    Keyboard.dismiss();
  }, []);

  const handleAgentSelectionOpen = useCallback(() => {
    agentSelectionRef.current?.expand();
  }, []);

  const handleAgentSelectionClose = useCallback(() => {
    agentSelectionRef.current?.close();
  }, []);

  const handleSendMessage = async (text: string) => {
    const newChatId = chatId ? chatId : randomUUID();
    const userMessageId = randomUUID();
    let systemMessageId = randomUUID();

    if (!chatId) {
      addChat({
        id: newChatId,
        title: "New Chat",
      });
    }

    setAutoScroll(true);

    addMessage({
      id: userMessageId,
      chatId: newChatId,
      role: USER_ROLE,
      text: text,
    });

    setTypingAnimation("smile");
    addMessage({
      id: systemMessageId,
      chatId: newChatId,
      role: SYSTEM_ROLE,
      text: "",
    });
    store.setIsStreaming(newChatId, true);

    let chatCreated = true;
    if (!chatId) {
      router.push(`/chat/${newChatId}`);
      chatCreated = await createChat(text, newChatId);
    }

    const messages = getLast50MessagesForChat(newChatId);
    const { chatHistory, thirdLastMessage } =
      transformHistoryForGemini(messages);

    const controller = new AbortController();
    store.setAbortController(newChatId, controller);

    if (agentsStore.selectedAgents.length > 0) {
      let index = 0;
      const agents = createAgentsWithRandomDuplicates(
        agentsStore.selectedAgents
      );
      for (const agent of agents) {
        if (agent.name === "Memi") {
          setTypingAnimation("smile");
        } else {
          setTypingAnimation(`${agent.name} is typing...`);
        }
        if (!store.getIsStreaming(newChatId) || controller.signal.aborted) {
          break;
        }
        if (index > 0) {
          systemMessageId = randomUUID();
          addMessage({
            id: systemMessageId,
            chatId: newChatId,
            role: SYSTEM_ROLE,
            text: "",
          });
        }

        const resp = await streamAgentMessage({
          prompt: text,
          chatId: newChatId,
          userMessageId: index === 0 ? userMessageId : null,
          systemMessageId: systemMessageId,
          history: chatHistory,
          lastMessage: thirdLastMessage,
          agent: agent,
          signal: controller.signal,
          talkMore: agentsStore.talkMore,
          selectedAI: agentsStore.selectedAI,
        });

        if (resp && resp.body && chatCreated) {
          await handleMessageStream(resp, newChatId, systemMessageId);
        } else {
          console.log("resp.body is null");
          // @TODO sync to server db
          updateMessageText(
            newChatId,
            systemMessageId,
            "Please try again. Something went wrong"
          );
        }
        index++;
      }
      store.setIsStreaming(newChatId, false);
    } else {
      if (store.getIsStreaming(newChatId)) {
        const resp = await streamMessage({
          prompt: text,
          chatId: newChatId,
          userMessageId: userMessageId,
          systemMessageId: systemMessageId,
          history: chatHistory,
          lastMessage: thirdLastMessage,
          signal: controller.signal,
        });

        if (resp && resp.body && chatCreated) {
          await handleMessageStream(resp, newChatId, systemMessageId);
        } else {
          console.log("resp.body is null");
          // @TODO sync to server db
          updateMessageText(
            newChatId,
            systemMessageId,
            "Please try again. Something went wrong"
          );
        }
        store.setIsStreaming(newChatId, false);
      }
    }

    setTypingAnimation("smile");
    updateChatTitle(newChatId);
    updateMemory(chatHistory);
  };

  function abortStream() {
    const controller = store.getAbortController(chatId);
    if (controller) {
      controller.abort();
      store.removeAbortController(chatId);
    }
    store.setIsStreaming(chatId, false);
    const lastSystemMessage = store.getLastSystemMessageForChat(chatId);
    if (lastSystemMessage && lastSystemMessage.text === "") {
      updateMessageText(chatId, lastSystemMessage.id, "Aborted");
    }
  }

  async function handleMessageStream(
    resp: any,
    newChatId: string,
    systemMessageId: string
  ) {
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || ""; // Keep the last incomplete event
      for (const event of events) {
        const dataLines = event
          .split("\n")
          .filter((line) => line.startsWith("data: "));
        const data = dataLines.map((line) => line.slice(6)).join("\n");
        addTextToMessage(newChatId, systemMessageId, data); // Add to UI
      }
    }
    if (buffer.trim()) {
      const dataLines = buffer
        .split("\n")
        .filter((line) => line.startsWith("data: "));
      const data = dataLines.map((line) => line.slice(6)).join("\n");
      addTextToMessage(newChatId, systemMessageId, data);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ChatMessages
        autoScroll={autoScroll}
        setAutoScroll={setAutoScroll}
        chatId={chatId}
        onMessagePress={handleMessagePress}
      />
      <ChatInput
        keyboardHeight={keyboardHeight}
        onSendMessage={handleSendMessage}
        chatId={chatId}
        handleAgentSelectionOpen={handleAgentSelectionOpen}
        abortStream={abortStream}
      />

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["97%"]}
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
        <BottomSheetView style={styles.bottomSheetContent}>
          {selectedMessage && <SelectableText text={selectedMessage.text} />}
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet
        ref={agentSelectionRef}
        index={-1}
        snapPoints={["100%"]}
        enablePanDownToClose
        onClose={handleAgentSelectionClose}
        enableDynamicSizing={false}
        backgroundStyle={{ backgroundColor: agentSelectionBackground }}
        handleIndicatorStyle={{ backgroundColor: color }}
        animationConfigs={{
          damping: 20,
          stiffness: 150,
        }}
        overDragResistanceFactor={0.5}
      >
        <AgentSelection chatId={chatId} />
      </BottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomSheetContent: {
    flex: 1,
    alignItems: "center",
    paddingTop: 15,
    paddingHorizontal: 30,
    paddingBottom: 45,
  },
});
