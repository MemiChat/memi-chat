import * as Haptics from "expo-haptics";
import { Agent } from "./types";
import { USER_ROLE } from "./helper";

export const lightHapticFeedbackPress = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export function createAgentsWithRandomDuplicates(agents: Agent[]): Agent[] {
  const result: Agent[] = [];

  for (const agent of agents) {
    // Always add the original agent
    result.push(agent);

    const numberOfCopies = Math.floor(Math.random() * 2);

    // Add the copies
    for (let i = 0; i < numberOfCopies; i++) {
      result.push({
        ...agent,
        consecutiveReply: true,
      });
    }
  }

  return result;
}

export function transformHistoryForGemini(messages: any[]): {
  chatHistory: any[];
  thirdLastMessage: any;
} {
  const chatHistory: any[] = [];
  let thirdLastMessage = null;
  let foundUserRole = false; // Flag to track if we've seen the first user message

  // Keep the original logic for thirdLastMessage based on the input array
  if (messages.length >= 3) {
    thirdLastMessage = messages[messages.length - 3];
  }

  for (const message of messages) {
    // If we haven't found the first user role yet, check if the current message is it
    if (!foundUserRole && message.role === USER_ROLE) {
      foundUserRole = true;
    }

    // Only process messages after the first user role message has been found
    // and ensure the message text is not empty
    if (foundUserRole && message.text !== "") {
      chatHistory.push({
        role: message.role === USER_ROLE ? USER_ROLE : "model",
        parts: [{ text: message.text }],
      });
    }
  }

  return { chatHistory, thirdLastMessage };
}
