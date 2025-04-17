import { create } from "zustand";
import { persist } from "zustand/middleware";
import { zustandStorage } from "./storage";
import { Agent, Chat, Message, User } from "./types";
import { deleteChat, getChatTitle } from "@/api/chat";

export interface ChatState {
  sendLoading: { [chatId: string]: boolean };
  setSendLoading: (chatId: string, sendLoading: boolean) => void;
  getSendLoading: (chatId: string) => boolean;

  isStreaming: { [chatId: string]: boolean };
  setIsStreaming: (chatId: string, isStreaming: boolean) => void;
  getIsStreaming: (chatId: string) => boolean;

  chats: { [id: string]: Chat };
  addChat: (chat: Chat) => void;
  updateChatTitle: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  setChats: (chats: Chat[]) => void;

  messagesByChat: { [chatId: string]: { [messageId: string]: Message } };
  addMessage: (message: Message) => void;
  addTextToMessage: (chatId: string, messageId: string, text: string) => void;
  getMessagesForChat: (chatId: string) => Message[];
  getLast50MessagesForChat: (chatId: string) => Message[];
  getLastSystemMessageForChat: (chatId: string) => Message | undefined;
  updateMessageText: (chatId: string, messageId: string, text: string) => void;
  setMessages: (chatId: string, messages: Message[]) => void;

  abortControllers: { [chatId: string]: AbortController };
  setAbortController: (chatId: string, controller: AbortController) => void;
  removeAbortController: (chatId: string) => void;
  getAbortController: (chatId: string) => AbortController | undefined;

  typingAnimation: string;
  setTypingAnimation: (typingAnimation: string) => void;

  reset: () => void;
}

const useChatsStore = create<ChatState>()(
  persist(
    (set, get) => ({
      abortControllers: {},
      sendLoading: {},
      isStreaming: {},
      chats: {},
      messagesByChat: {},
      typingAnimation: "",
      reset: () => set({
        abortControllers: {},
        sendLoading: {},
        isStreaming: {},
        chats: {},
        messagesByChat: {},
        typingAnimation: "",
      }),
      setTypingAnimation: (typingAnimation: string) => set({ typingAnimation }),
      setAbortController: (chatId: string, controller: AbortController) =>
        set((state) => ({
          abortControllers: { ...state.abortControllers, [chatId]: controller },
        })),
      removeAbortController: (chatId: string) =>
        set((state) => {
          const { [chatId]: _, ...abortControllers } = state.abortControllers;
          return { abortControllers };
        }),
      getAbortController: (chatId: string) => get().abortControllers[chatId],
      setSendLoading: (chatId: string, sendLoading: boolean) =>
        set((state) => ({
          sendLoading: { ...state.sendLoading, [chatId]: sendLoading },
        })),
      setIsStreaming: (chatId: string, isStreaming: boolean) =>
        set((state) => ({
          isStreaming: { ...state.isStreaming, [chatId]: isStreaming },
        })),
      getIsStreaming: (chatId: string) => get().isStreaming[chatId],
      getSendLoading: (chatId: string) => get().sendLoading[chatId],
      setMessages: (chatId: string, messages: Message[]) =>
        set((state) => {
          const messagesMap: { [messageId: string]: Message } = {};
          for (const message of messages) {
            messagesMap[message.id] = message;
          }

          return {
            messagesByChat: {
              ...state.messagesByChat,
              [chatId]: messagesMap,
            },
          };
        }),
      setChats: (chats: Chat[]) =>
        set(() => {
          const chatsMap: { [id: string]: Chat } = {};
          for (const chat of chats) {
            chatsMap[chat.id] = chat;
          }

          return { chats: chatsMap };
        }),
      getMessagesForChat: (chatId: string) => {
        const messagesForChat = get().messagesByChat[chatId] || {};
        return Object.values(messagesForChat);
      },
      getLast50MessagesForChat: (chatId: string) => {
        const messagesForChat = get().messagesByChat[chatId] || {};
        return Object.values(messagesForChat).slice(-50);
      },
      getLastSystemMessageForChat: (chatId: string) => {
        const messagesForChat = get().messagesByChat[chatId] || {};
        const messages = Object.values(messagesForChat).reverse();
        return messages.find((message) => message.role === "system");
      },
      addChat: (chat) =>
        set((state) => {
          const newChats = { ...state.chats, [chat.id]: chat };
          const chatIds = Object.values(state.chats);

          if (chatIds.length > 30) {
            const oldestChat = chatIds[0];
            const newMessagesByChat = { ...state.messagesByChat };
            delete newMessagesByChat[oldestChat.id];

            return {
              chats: newChats,
              messagesByChat: newMessagesByChat,
            };
          }

          return {
            chats: newChats,
          };
        }),
      addMessage: (message) =>
        set((state) => ({
          messagesByChat: {
            ...state.messagesByChat,
            [message.chatId!]: {
              ...(state.messagesByChat[message.chatId!] || {}),
              [message.id]: message,
            },
          },
        })),
      addTextToMessage: (chatId: string, messageId: string, text: string) =>
        set((state) => {
          const messagesByChat = { ...state.messagesByChat };
          if (messagesByChat[chatId][messageId]) {
            const message = messagesByChat[chatId][messageId];
            messagesByChat[chatId][messageId] = {
              ...message,
              text: message.text + text,
            };
            return { messagesByChat };
          }
          return state;
        }),
      updateMessageText: (chatId: string, messageId: string, text: string) =>
        set((state) => {
          const messagesByChat = { ...state.messagesByChat };
          if (messagesByChat[chatId][messageId]) {
            const message = messagesByChat[chatId][messageId];
            messagesByChat[chatId][messageId] = {
              ...message,
              text: text,
            };
            return { messagesByChat };
          }
          return state;
        }),
      updateChatTitle: async (chatId: string) => {
        const chat = get().chats[chatId];
        if (chat.title === "New Chat") {
          const title = await getChatTitle(chatId);
          if (title) {
            set((state) => {
              const chats = { ...state.chats };
              chats[chatId].title = title;
              return { chats };
            });
          }
        }
      },
      deleteChat: async (chatId: string) => {
        const success = await deleteChat(chatId);
        if (success) {
          set((state) => {
            const { [chatId]: _, ...chats } = state.chats;
            const messagesByChat = { ...state.messagesByChat };
            delete messagesByChat[chatId];
            return { chats, messagesByChat };
          });
        }
      },
    }),
    {
      name: "chats",
      storage: zustandStorage,
    }
  )
);

export interface AgentsState {
  selectedAgents: Agent[];
  setSelectedAgents: (agents: Agent[]) => void;
  addSelectedAgent: (agent: Agent) => void;
  removeSelectedAgent: (agent: Agent) => void;

  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  addAgent: (agent: Agent) => void;
  deleteAgent: (agent: Agent) => void;

  selectedAI: string;
  setSelectedAI: (ai: string) => void;

  talkMore: boolean;
  setTalkMore: (talkMore: boolean) => void;

  reset: () => void;
}

const useAgentsStore = create<AgentsState>()(
  persist(
    (set, get) => ({
      agents: [],
      selectedAgents: [],
      selectedAI: "Think More",
      talkMore: true,
      reset: () => set({
        agents: [],
        selectedAgents: [],
        selectedAI: "Think More",
        talkMore: true,
      }),
      setSelectedAI: (ai: string) => set({ selectedAI: ai }),
      setTalkMore: (talkMore: boolean) => set({ talkMore }),
      setSelectedAgents: (agents: Agent[]) => set({ selectedAgents: agents }),
      addSelectedAgent: (agent: Agent) =>
        set((state) => ({
          selectedAgents: [...state.selectedAgents, agent],
        })),
      removeSelectedAgent: (agent: Agent) =>
        set((state) => ({
          selectedAgents: state.selectedAgents.filter((a) => a.id !== agent.id),
        })),
      setAgents: (agents: Agent[]) => set({ agents }),
      addAgent: (agent: Agent) =>
        set((state) => ({ agents: [...state.agents, agent] })),
      deleteAgent: (agent: Agent) =>
        set((state) => ({
          agents: state.agents.filter((a) => a.id !== agent.id),
        })),
    }),
    {
      name: "agents",
      storage: zustandStorage,
    }
  )
);

interface UserState {
  jwtToken: string | null;
  setToken: (token: string) => void;

  jwtTokenExpiry: number | null;
  setJwtTokenExpiry: (expiry: number) => void;

  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;

  firstTimeInstall: boolean;
  setFirstTimeInstall: (firstTimeInstall: boolean) => void;

  chatBackground: string;
  setChatBackground: (background: string) => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      jwtToken: null,
      user: null,
      firstTimeInstall: true,
      jwtTokenExpiry: null,
      chatBackground: "",
      setChatBackground: (background: string) =>
        set({ chatBackground: background }),
      setJwtTokenExpiry: (expiry: number) => set({ jwtTokenExpiry: expiry }),
      setToken: (token: string) => set({ jwtToken: token }),
      setUser: (user: User) => set({ user }),
      setFirstTimeInstall: (firstTimeInstall: boolean) =>
        set({ firstTimeInstall }),
      logout: () => set({ jwtToken: null, user: null, jwtTokenExpiry: null }),
    }),
    {
      name: "user",
      storage: zustandStorage,
    }
  )
);

export { useChatsStore, useAgentsStore, useUserStore };
