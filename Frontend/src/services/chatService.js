import { Client } from "@stomp/stompjs";
import axiosClient from "./axiosClient";

const CHAT_BASE_URL = "/v1/chats";
const AGGREGATED_CHAT_BASE_URL = "/v1/aggregated/chats";

const shouldFallbackToChatService = (error) => {
  const status = error?.response?.status;
  return status === 404 || status === 503 || (status >= 500 && status < 600);
};

const resolveWsUrl = () => {
  const explicit = import.meta.env.VITE_CHAT_WS_URL;
  if (explicit) return explicit;

  const apiBase = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
  if (apiBase.startsWith("http")) {
    const url = new URL(apiBase);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = url.pathname.replace(/\/api$/i, "");
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/ws/chat`;
    return url.toString();
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws/chat`;
};

export const listConversations = async ({ eventId } = {}) => {
  const params = eventId ? { eventId: Number(eventId) } : undefined;
  try {
    return await axiosClient.get(`${AGGREGATED_CHAT_BASE_URL}/conversations`, { params });
  } catch (error) {
    if (shouldFallbackToChatService(error)) {
      return axiosClient.get(`${CHAT_BASE_URL}/conversations`, { params });
    }
    throw error;
  }
};

export const openConversation = async ({ eventId, volunteerId }) => {
  return axiosClient.post(`${CHAT_BASE_URL}/conversations`, {
    eventId: Number(eventId),
    volunteerId: volunteerId || undefined,
  });
};

export const listMessages = async ({ conversationId, before, limit = 50 }) => {
  try {
    return await axiosClient.get(`${AGGREGATED_CHAT_BASE_URL}/conversations/${conversationId}/messages`, {
      params: { before, limit },
    });
  } catch (error) {
    if (shouldFallbackToChatService(error)) {
      return axiosClient.get(`${CHAT_BASE_URL}/conversations/${conversationId}/messages`, {
        params: { before, limit },
      });
    }
    throw error;
  }
};

export const uploadChatMedia = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosClient.post(`${CHAT_BASE_URL}/media`, formData);
};

const createClientMessageId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const sendMessage = async ({
  conversationId,
  body,
  attachments = [],
  clientMessageId,
}) => {
  return axiosClient.post(`${CHAT_BASE_URL}/conversations/${conversationId}/messages`, {
    body: body || "",
    attachments,
    clientMessageId: clientMessageId || createClientMessageId(),
  });
};

export const markConversationRead = async ({ conversationId, lastReadMessageId }) => {
  return axiosClient.put(`${CHAT_BASE_URL}/conversations/${conversationId}/read`, {
    lastReadMessageId,
  });
};

export const createChatClient = ({ onConnect, onConversationMessage, onUserMessage }) => {
  const token = localStorage.getItem("token");
  const baseUrl = resolveWsUrl();
  const brokerURL = token
    ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`
    : baseUrl;

  const client = new Client({
    brokerURL,
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      if (onUserMessage) {
        client.subscribe("/user/queue/chats", (frame) => {
          onUserMessage(JSON.parse(frame.body));
        });
      }
      onConnect?.(client);
    },
  });

  client.subscribeToConversation = (conversationId) => {
    if (!client.connected || !conversationId || !onConversationMessage) return null;
    return client.subscribe(`/topic/chats/${conversationId}`, (frame) => {
      onConversationMessage(JSON.parse(frame.body));
    });
  };

  return client;
};
