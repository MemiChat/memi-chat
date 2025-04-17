import React, { useRef, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from "react-native-gesture-handler";
import ChatToolbar from "./chat-toolbar";
import PromptHelp from "./prompt-help";
import { PROMPT_HELPERS } from "@/lib/helper";

export default function ChatInput({
  keyboardHeight,
  onSendMessage,
  chatId = "",
  handleAgentSelectionOpen,
  abortStream,
}: {
  keyboardHeight: SharedValue<number>;
  onSendMessage: (text: string) => void;
  chatId?: string;
  handleAgentSelectionOpen: () => void;
  abortStream: () => void;
}) {
  const translateY = useSharedValue(0);
  const inputRef = useRef(null);
  const [inputText, setInputText] = useState("");

  const focusInput = () => {
    const currentRef = inputRef.current as TextInput | null;
    if (currentRef) {
      currentRef.focus();
    }
  };

  const blurInput = () => {
    const currentRef = inputRef.current as TextInput | null;
    if (currentRef) {
      currentRef.blur();
    }
  };

  const swipeGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (Math.abs(event.translationY) > Math.abs(event.translationX)) {
        translateY.value = Math.max(-100, Math.min(100, event.translationY));
      }
    })
    .onEnd(() => {
      if (translateY.value < -50) {
        runOnJS(focusInput)();
      } else if (translateY.value > 50) {
        runOnJS(blurInput)();
      }

      translateY.value = withTiming(0);
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: withTiming(keyboardHeight.value > 0 ? 10 : 24, {
        duration: 420,
      }),
      backgroundColor: withTiming(
        keyboardHeight.value > 0
          ? "rgba(26, 26, 26, 0.975)"
          : "rgba(0, 0, 0, 0.45)",
        {
          duration: 300,
        }
      ),
      shadowOpacity: withTiming(keyboardHeight.value > 0 ? 0.15 : 0.24, {
        duration: 420,
      }),
    };
  });

  const handleSendMessage = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText("");
      blurInput();
    }
  };

  return (
    <KeyboardStickyView style={styles.stickyContainer}>
      <GestureDetector gesture={swipeGesture}>
        <View>
          {!chatId && (
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={styles.promptHelpScrollContainer}
              scrollEventThrottle={16}
            >
              <View style={styles.promptHelpContainer}>
                {PROMPT_HELPERS.map((item, index) => (
                  <PromptHelp
                    key={index}
                    title={item.title}
                    description={item.description}
                    onPress={() => {
                      setInputText(item.prompt);
                      focusInput();
                    }}
                  />
                ))}
              </View>
            </ScrollView>
          )}
          <Animated.View style={[styles.textContainer, animatedStyle]}>
            <TextInput
              ref={inputRef}
              multiline={true}
              placeholder="Message Memi"
              placeholderTextColor="rgba(255, 255, 255, 0.75)"
              style={[styles.textInput]}
              value={inputText}
              onChangeText={setInputText}
            />
            <ChatToolbar
              handleAgentSelectionOpen={handleAgentSelectionOpen}
              onSendPress={handleSendMessage}
              chatId={chatId}
              hideKeyboard={blurInput}
              abortStream={abortStream}
            />
          </Animated.View>
        </View>
      </GestureDetector>
    </KeyboardStickyView>
  );
}

const styles = StyleSheet.create({
  stickyContainer: {
    width: "100%",
    height: "auto",
  },
  textInput: {
    width: "100%",
    height: "auto",
    minHeight: 51,
    maxHeight: 270,
    paddingHorizontal: 14.5,
    alignSelf: "center",
    marginBottom: 0,
    textAlignVertical: "top",
    fontSize: 16,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    color: "white",
    flexGrow: 0,
    overflow: "hidden",
  },
  textContainer: {
    width: "100%",
    height: "auto",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: -4.5 },
    shadowRadius: 21,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  promptHelpScrollContainer: {
    width: "100%",
    paddingBottom: 8,
  },
  promptHelpContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 6,
    width: "100%",
    paddingHorizontal: 15,
  },
});
