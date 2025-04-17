import { fetch } from "expo/fetch";
import { GENERIC_SUCCESS_MESSAGE, API_URL } from "@/lib/helper";
import { Agent } from "@/lib/types";
import { getJwtToken } from "@/lib/storage";

export async function getChatTitle(chatId: string) {
  try {
    const resp = await fetch(`${API_URL}/v1/user/chat/${chatId}/title`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwtToken()}`,
      },
    });

    const data = await resp.json();
    if (data.message === GENERIC_SUCCESS_MESSAGE) {
      return data.title;
    }
  } catch (error) {
    console.error(error);
  }
  return null;
}

export async function deleteChat(chatId: string) {
  try {
    const resp = await fetch(`${API_URL}/v1/user/chat/${chatId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwtToken()}`,
      },
    });

    const data = await resp.json();
    if (data.message === GENERIC_SUCCESS_MESSAGE) {
      return true;
    }
  } catch (error) {
    console.error(error);
  }
  return false;
}

export async function createChat(prompt: string, chatId: string) {
  try {
    const chatResp = await fetch(`${API_URL}/v1/user/chat/new`, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwtToken()}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        chatId: chatId,
      }),
    });
    const chatData = await chatResp.json();
    if (chatData.message !== GENERIC_SUCCESS_MESSAGE) {
      return false;
    }
  } catch (error) {
    console.log("Error creating chat:", error);
  }

  return true;
}

export async function addChatMessage({
  chatId,
  id,
  text,
  role,
}: {
  chatId: string;
  id: string;
  text: string;
  role: string;
}) {
  try {
    const resp = await fetch(`${API_URL}/v1/user/chat/add/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwtToken()}`,
      },
      body: JSON.stringify({
        chatId: chatId,
        id: id,
        text: text,
        role: role,
      }),
    });
    const data = await resp.json();
    if (data.message === GENERIC_SUCCESS_MESSAGE) {
      return true;
    }
  } catch (error) {
    console.log("Error adding chat message:", error);
  }

  return false;
}

export async function streamMessage({
  prompt,
  chatId,
  userMessageId,
  systemMessageId,
  history,
  lastMessage,
  signal,
}: {
  prompt: string;
  chatId: string;
  userMessageId: string;
  systemMessageId: string;
  history: any[];
  lastMessage: any;
  signal: AbortSignal;
}) {
  try {
    const resp = await fetch(`${API_URL}/v1/user/chat/stream/message`, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwtToken()}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        chatId: chatId,
        userMessageId: userMessageId,
        systemMessageId: systemMessageId,
        history: history,
        lastMessage: lastMessage,
      }),
      signal: signal,
    });

    return resp;
  } catch (error) {
    console.log("Error streaming message:", error);
  }

  return null;
}

export async function streamAgentMessage({
  prompt,
  chatId,
  userMessageId,
  systemMessageId,
  history,
  lastMessage,
  agent,
  signal,
  talkMore,
  selectedAI,
}: {
  prompt: string;
  chatId: string;
  userMessageId: string | null;
  systemMessageId: string;
  history: any[];
  lastMessage: any;
  agent: Agent;
  signal: AbortSignal;
  talkMore: boolean;
  selectedAI: string;
}) {
  try {
    const resp = await fetch(`${API_URL}/v1/user/chat/stream/agent/message`, {
      method: "POST",
      headers: {
        Accept: "text/event-stream",
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwtToken()}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        chatId: chatId,
        userMessageId: userMessageId,
        systemMessageId: systemMessageId,
        history: history,
        lastMessage: lastMessage,
        agent: agent,
        talkMore: talkMore,
        selectedAI: selectedAI,
      }),
      signal: signal,
    });

    return resp;
  } catch (error) {
    console.log("Error streaming message:", error);
  }

  return null;
}

export async function getChatMessages(chatId: string) {
  try {
    const resp = await fetch(`${API_URL}/v1/user/chat/${chatId}/messages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwtToken()}`,
      },
    });
    const data = await resp.json();
    if (data.message === GENERIC_SUCCESS_MESSAGE) {
      return data.messages;
    }
  } catch (error) {
    console.log("Error getting chat messages:", error);
  }

  return null;
}

export async function getChats() {
  try {
    const resp = await fetch(`${API_URL}/v1/user/chat/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwtToken()}`,
      },
    });
    const data = await resp.json();
    if (data.message === GENERIC_SUCCESS_MESSAGE) {
      return data.chats;
    }
  } catch (error) {
    console.log("Error getting chats:", error);
  }

  return null;
}

export async function updateMemory(history: any[]) {
  try {
    await fetch(`${API_URL}/v1/user/chat/update/memory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJwtToken()}`,
      },
      body: JSON.stringify({
        history: history,
      }),
    });
  } catch (error) {
    console.log("Error updating memory:", error);
  }
}
