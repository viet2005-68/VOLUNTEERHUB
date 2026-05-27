import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  listConversations,
  listMessages,
  markConversationRead,
  openConversation,
  sendMessage,
  uploadChatMedia,
} from "../services/chatService";

const CHAT_QUERY_KEY = ["chats"];

export const mergeChatMessages = (old = [], incoming = []) => {
  const next = new Map();
  [...old, ...incoming].forEach((message) => {
    if (!message) return;
    const key = message.id || message.clientMessageId;
    const existing = next.get(key);
    next.set(key, existing ? { ...existing, ...message, sender: message.sender || existing.sender } : message);
  });
  return Array.from(next.values()).sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );
};

export const useConversations = (params = {}) => {
  const { eventId } = params;
  return useQuery({
    queryKey: [...CHAT_QUERY_KEY, "conversations", eventId || "all"],
    queryFn: () => listConversations({ eventId }),
    staleTime: 15 * 1000,
  });
};

export const useOpenConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: openConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CHAT_QUERY_KEY, "conversations"] });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error.message || "Could not open chat";
      toast.error(message);
    },
  });
};

export const useConversationMessages = (conversationId) => {
  return useQuery({
    queryKey: [...CHAT_QUERY_KEY, "messages", conversationId],
    queryFn: () => listMessages({ conversationId }),
    enabled: !!conversationId,
    staleTime: 10 * 1000,
  });
};

export const useLoadOlderMessages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: listMessages,
    onSuccess: (messages, variables) => {
      queryClient.setQueryData(
        [...CHAT_QUERY_KEY, "messages", variables.conversationId],
        (old = []) => mergeChatMessages(old, messages)
      );
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || error.message || "Could not load older messages";
      toast.error(message);
    },
  });
};

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (message) => {
      queryClient.setQueryData(
        [...CHAT_QUERY_KEY, "messages", message.conversationId],
        (old = []) => mergeChatMessages(old, [message])
      );
      queryClient.invalidateQueries({ queryKey: [...CHAT_QUERY_KEY, "conversations"] });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error.message || "Could not send message";
      toast.error(message);
    },
  });
};

export const useUploadChatMedia = () => {
  return useMutation({
    mutationFn: uploadChatMedia,
    onError: (error) => {
      const message = error?.response?.data?.message || error.message || "Could not upload image";
      toast.error(message);
    },
  });
};

export const useMarkConversationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markConversationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CHAT_QUERY_KEY, "conversations"] });
    },
  });
};

export const chatQueryKey = CHAT_QUERY_KEY;
