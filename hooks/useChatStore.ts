// hooks/useChatStore.ts
"use client";

import { create } from "zustand";
import { ChatMessage } from "@/types";

interface ChatStore {
  messages: ChatMessage[];
  chatId: string | null;
  isLoading: boolean;
  remainingQueries: number | null;

  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  setChatId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setRemainingQueries: (n: number) => void;
  createNewChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  chatId: null,
  isLoading: false,
  remainingQueries: null,

  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content,
        };
      }
      return { messages };
    }),
  setChatId: (chatId) => set({ chatId }),
  setLoading: (isLoading) => set({ isLoading }),
  setRemainingQueries: (remainingQueries) => set({ remainingQueries }),
  createNewChat: () =>
    set({ messages: [], chatId: null, isLoading: false }),
}));
