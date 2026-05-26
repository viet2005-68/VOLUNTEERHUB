import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  listConversations,
  listMessages,
  markConversationRead,
  openConversation,
  sendMessage,
} from "../services/chatService";

const CHAT_QUERY_KEY = ["chats"];

export const useConversations = () => {
  return useQuery({
    queryKey: [...CHAT_QUERY_KEY, "conversations"],
    queryFn: listConversations,
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

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (message) => {
      queryClient.setQueryData(
        [...CHAT_QUERY_KEY, "messages", message.conversationId],
        (old = []) => {
          if (old.some((item) => item.id === message.id)) return old;
          return [...old, message];
        }
      );
      queryClient.invalidateQueries({ queryKey: [...CHAT_QUERY_KEY, "conversations"] });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error.message || "Could not send message";
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
