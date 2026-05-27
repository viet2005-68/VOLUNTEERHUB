import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ImagePlus,
  Loader2,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navigate, useSearchParams } from "react-router-dom";
import {
  chatQueryKey,
  mergeChatMessages,
  useConversationMessages,
  useConversations,
  useLoadOlderMessages,
  useMarkConversationRead,
  useOpenConversation,
  useSendChatMessage,
  useUploadChatMedia,
} from "../../hook/useChat";
import { createChatClient } from "../../services/chatService";
import { useAuth } from "../../hook/useAuth";
import { ROLES } from "../../constant/role";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGES = 5;
const MESSAGE_PAGE_SIZE = 50;

const formatDateTime = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const shortId = (value) => {
  if (!value) return "Unknown";
  const text = String(value);
  return text.length > 12 ? `${text.slice(0, 8)}...${text.slice(-4)}` : text;
};

const displayUserName = (user, fallback) =>
  user?.fullName || user?.username || user?.email || fallback || "Unknown user";

const conversationLabel = (conversation, userId) => {
  if (!conversation) return "Select a conversation";
  if (conversation.otherUser) {
    return displayUserName(conversation.otherUser);
  }
  const other = conversation.otherUserId || conversation.volunteerId || conversation.managerId;
  const role =
    userId === conversation.managerId
      ? "Volunteer"
      : userId === conversation.volunteerId
      ? "Manager"
      : "Member";
  return `${role} ${shortId(other)}`;
};

const eventTitle = (conversation) =>
  conversation?.eventName || conversation?.event?.name || `Event #${conversation?.eventId || ""}`;

const senderForMessage = (message, conversation) => {
  if (message.sender) return message.sender;
  if (!conversation) return null;
  if (message.senderId === conversation.managerId) return conversation.manager;
  if (message.senderId === conversation.volunteerId) return conversation.volunteer;
  return null;
};

const getImageAttachments = (message) =>
  (message.attachments || []).filter((attachment) => attachment.type === "IMAGE" && attachment.url);

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: conversations = [], isLoading } = useConversations();
  const { mutate: openChatConversation } = useOpenConversation();
  const sendMessage = useSendChatMessage();
  const uploadMedia = useUploadChatMedia();
  const loadOlderMessages = useLoadOlderMessages();
  const { mutate: markConversationRead } = useMarkConversationRead();
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [hasMoreOlder, setHasMoreOlder] = useState(true);
  const [openingFromQuery, setOpeningFromQuery] = useState(false);
  const messagePaneRef = useRef(null);
  const fileInputRef = useRef(null);
  const openedQueryRef = useRef("");
  const clientRef = useRef(null);
  const selectedRef = useRef(null);
  const selectedImagesRef = useRef([]);
  const conversationSubscriptionRef = useRef(null);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId) || null,
    [conversations, selectedId]
  );
  const { data: messages = [], isLoading: isLoadingMessages } =
    useConversationMessages(selectedId);
  const orderedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      ),
    [messages]
  );

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    const eventId = searchParams.get("eventId");
    if (!eventId) return;
    const volunteerId = searchParams.get("volunteerId") || undefined;
    const queryKey = `${eventId}:${volunteerId || ""}`;
    if (openedQueryRef.current === queryKey) return;

    openedQueryRef.current = queryKey;
    setOpeningFromQuery(true);
    openChatConversation(
      { eventId, volunteerId },
      {
        onSuccess: (conversation) => {
          setSelectedId(conversation.id);
          setHasMoreOlder(true);
          setSearchParams(
            (current) => {
              const next = new URLSearchParams(current);
              next.delete("eventId");
              next.delete("volunteerId");
              return next;
            },
            { replace: true }
          );
        },
        onSettled: () => setOpeningFromQuery(false),
      }
    );
  }, [openChatConversation, searchParams, setSearchParams]);

  useEffect(() => {
    const addMessageToCache = (message) => {
      queryClient.setQueryData(
        [...chatQueryKey, "messages", message.conversationId],
        (old = []) => mergeChatMessages(old, [message])
      );
      queryClient.invalidateQueries({ queryKey: [...chatQueryKey, "conversations"] });
    };

    const client = createChatClient({
      onConnect: (connectedClient) => {
        if (selectedRef.current) {
          conversationSubscriptionRef.current?.unsubscribe();
          conversationSubscriptionRef.current =
            connectedClient.subscribeToConversation(selectedRef.current);
        }
      },
      onConversationMessage: addMessageToCache,
      onUserMessage: addMessageToCache,
    });

    clientRef.current = client;
    client.activate();
    return () => {
      conversationSubscriptionRef.current?.unsubscribe();
      conversationSubscriptionRef.current = null;
      clientRef.current = null;
      client.deactivate();
    };
  }, [queryClient]);

  useEffect(() => {
    const client = clientRef.current;
    conversationSubscriptionRef.current?.unsubscribe();
    conversationSubscriptionRef.current = null;
    if (client?.connected && selectedId) {
      conversationSubscriptionRef.current = client.subscribeToConversation(selectedId);
    }
    setHasMoreOlder(true);
  }, [selectedId]);

  useEffect(() => {
    const pane = messagePaneRef.current;
    if (!pane) return;
    requestAnimationFrame(() => {
      pane.scrollTop = pane.scrollHeight;
    });
  }, [orderedMessages.length, selectedId]);

  useEffect(() => {
    if (!selectedId || orderedMessages.length === 0) return;
    const newestMessage = orderedMessages[orderedMessages.length - 1];
    markConversationRead({ conversationId: selectedId, lastReadMessageId: newestMessage.id });
  }, [markConversationRead, orderedMessages, selectedId]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const handleSelectImages = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - selectedImages.length;
    const accepted = files
      .filter((file) => IMAGE_TYPES.includes(file.type))
      .slice(0, Math.max(remaining, 0));

    const nextImages = accepted.map((file) => ({
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((current) => [...current, ...nextImages].slice(0, MAX_IMAGES));
    event.target.value = "";
  };

  const removeSelectedImage = (imageId) => {
    setSelectedImages((current) => {
      const removed = current.find((image) => image.id === imageId);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((image) => image.id !== imageId);
    });
  };

  const handleLoadOlder = () => {
    if (!selectedId || orderedMessages.length === 0) return;
    const pane = messagePaneRef.current;
    const previousScrollHeight = pane?.scrollHeight || 0;
    const previousScrollTop = pane?.scrollTop || 0;
    const oldestMessage = orderedMessages[0];
    loadOlderMessages.mutate(
      {
        conversationId: selectedId,
        before: oldestMessage.createdAt,
        limit: MESSAGE_PAGE_SIZE,
      },
      {
        onSuccess: (olderMessages) => {
          setHasMoreOlder(olderMessages.length >= MESSAGE_PAGE_SIZE);
          requestAnimationFrame(() => {
            const nextPane = messagePaneRef.current;
            if (!nextPane) return;
            nextPane.scrollTop =
              nextPane.scrollHeight - previousScrollHeight + previousScrollTop;
          });
        },
      }
    );
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!selectedId || isSending || (!draft.trim() && selectedImages.length === 0)) return;

    const clientMessageId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const imagesToSend = selectedImages;
    const bodyToSend = draft.trim();

    try {
      const attachments = await Promise.all(
        imagesToSend.map((image) => uploadMedia.mutateAsync(image.file))
      );
      sendMessage.mutate(
        {
          conversationId: selectedId,
          body: bodyToSend,
          attachments,
          clientMessageId,
        },
        {
          onSuccess: () => {
            setDraft("");
            setSelectedImages((current) => {
              current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
              return [];
            });
          },
        }
      );
    } catch {
      // Upload hook already shows the backend error message.
    }
  };

  if (user?.role === ROLES.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  const isReadOnly = activeConversation?.status === "READ_ONLY";
  const isSending = sendMessage.isPending || uploadMedia.isPending;
  const canSend = !!selectedId && !isReadOnly && (draft.trim() || selectedImages.length > 0);
  const activeOtherName = conversationLabel(activeConversation, user?.id);

  return (
    <div className="grid h-[min(720px,calc(100vh-190px))] min-h-[620px] overflow-hidden rounded-[20px] bg-white text-deep-forest lg:grid-cols-[330px_minmax(0,1fr)]">
      <aside className="flex min-h-0 flex-col bg-pale-canvas p-4 lg:border-r lg:border-deep-forest/10">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-deep-forest text-pale-canvas">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-2xl font-black uppercase leading-[1.05] text-deep-forest">
              Messages
            </div>
            <p className="text-xs font-bold text-deep-forest/60">
              Event conversations
            </p>
          </div>
        </div>

        {openingFromQuery && (
          <div className="mb-3 flex items-center gap-2 rounded-[10px] bg-deep-forest/5 px-3 py-2 text-sm font-bold text-deep-forest/70">
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening event chat...
          </div>
        )}

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-deep-forest/65">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-[10px] bg-white/70 p-4 text-sm text-deep-forest/65">
              No conversations yet.
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                type="button"
                key={conversation.id}
                onClick={() => setSelectedId(conversation.id)}
                className={`w-full rounded-[10px] p-3 text-left transition ${
                  selectedId === conversation.id
                    ? "bg-deep-forest text-pale-canvas"
                    : "bg-white/70 hover:bg-deep-forest/5"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-black">
                    {eventTitle(conversation)}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span
                      className={`rounded-[10px] px-2 py-0.5 text-xs font-black ${
                        selectedId === conversation.id
                          ? "bg-pale-canvas text-deep-forest"
                          : "bg-deep-forest text-pale-canvas"
                      }`}
                    >
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p
                  className={`mt-1 truncate text-xs ${
                    selectedId === conversation.id
                      ? "text-pale-canvas/80"
                      : "text-deep-forest/65"
                  }`}
                >
                  {conversationLabel(conversation, user?.id)}
                </p>
                <p
                  className={`mt-2 text-[11px] ${
                    selectedId === conversation.id
                      ? "text-pale-canvas/65"
                      : "text-deep-forest/45"
                  }`}
                >
                  {formatDateTime(conversation.lastMessageAt || conversation.updatedAt)}
                </p>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        {activeConversation ? (
          <>
            <header className="flex items-center justify-between gap-4 bg-white px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={
                    activeConversation.otherUser?.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeOtherName}`
                  }
                  alt={activeOtherName}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                <div className="truncate text-xl font-black leading-[1.1] text-deep-forest">
                  {activeOtherName}
                </div>
                <p className="mt-1 truncate text-xs font-bold text-deep-forest/65">
                  {eventTitle(activeConversation)}
                </p>
                </div>
              </div>
              <span className="rounded-[10px] bg-deep-forest/8 px-3 py-1 text-xs font-black">
                {activeConversation.status}
              </span>
            </header>

            <div
              ref={messagePaneRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-pale-canvas/35 px-4 py-5"
            >
              {isLoadingMessages ? (
                <div className="flex items-center justify-center gap-2 text-sm text-deep-forest/65">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading messages...
                </div>
              ) : orderedMessages.length === 0 ? (
                <div className="rounded-[10px] bg-white/75 p-6 text-center text-sm text-deep-forest/65">
                  Start the conversation when you are ready.
                </div>
              ) : (
                <div className="space-y-4">
                  {hasMoreOlder && (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleLoadOlder}
                        disabled={loadOlderMessages.isPending}
                        className="inline-flex items-center gap-2 rounded-[10px] bg-white px-3 py-2 text-xs font-black text-deep-forest hover:bg-deep-forest hover:text-pale-canvas disabled:opacity-60"
                      >
                        {loadOlderMessages.isPending && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        Load older
                      </button>
                    </div>
                  )}

                  {orderedMessages.map((message) => {
                    const mine = message.senderId === user?.id;
                    const images = getImageAttachments(message);
                    const sender = senderForMessage(message, activeConversation);
                    const senderName = displayUserName(sender, shortId(message.senderId));
                    return (
                      <div
                        key={message.id || message.clientMessageId}
                        className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
                      >
                        {!mine && (
                          <img
                            src={
                              sender?.avatarUrl ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderName}`
                            }
                            alt={senderName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        )}
                        <div
                          className={`max-w-[82%] rounded-[18px] px-4 py-3 text-sm ${
                            mine
                              ? "bg-deep-forest text-pale-canvas"
                              : "bg-white text-deep-forest"
                          }`}
                        >
                          {!mine && (
                            <p className="mb-1 text-xs font-black text-deep-forest/70">
                              {senderName}
                            </p>
                          )}
                          {images.length > 0 && (
                            <div className="mb-2 grid max-w-[320px] grid-cols-2 gap-2">
                              {images.map((attachment) => (
                                <a
                                  key={attachment.id || attachment.url}
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block overflow-hidden rounded-[10px] bg-white"
                                >
                                  <img
                                    src={attachment.url}
                                    alt={attachment.fileName || "Chat image"}
                                    className="h-32 w-full object-cover"
                                  />
                                </a>
                              ))}
                            </div>
                          )}
                          {message.body && (
                            <p className="whitespace-pre-wrap break-words leading-[1.25]">
                              {message.body}
                            </p>
                          )}
                          <p
                            className={`mt-2 text-[11px] ${
                              mine ? "text-pale-canvas/65" : "text-deep-forest/45"
                            }`}
                          >
                            {formatDateTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="border-t border-deep-forest/10 bg-white p-4">
              {isReadOnly && (
                <p className="mb-3 rounded-[10px] bg-deep-forest/5 px-3 py-2 text-sm font-bold text-deep-forest">
                  This conversation is read-only for the current registration state.
                </p>
              )}

              {selectedImages.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative h-20 w-20 overflow-hidden rounded-[10px]"
                    >
                      <img
                        src={image.previewUrl}
                        alt={image.file.name}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(image.id)}
                        className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-deep-forest text-pale-canvas"
                        aria-label="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={IMAGE_TYPES.join(",")}
                  multiple
                  className="hidden"
                  onChange={handleSelectImages}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isReadOnly || isSending || selectedImages.length >= MAX_IMAGES}
                  className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px] bg-deep-forest/5 text-deep-forest transition hover:bg-deep-forest hover:text-pale-canvas disabled:opacity-50"
                  aria-label="Attach image"
                  title="Attach image"
                >
                  <ImagePlus className="h-5 w-5" />
                </button>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend(event);
                    }
                  }}
                  disabled={isReadOnly || isSending}
                  placeholder="Write a message..."
                  rows={2}
                  className="min-h-[52px] flex-1 resize-none rounded-[10px] border border-deep-forest/15 px-3 py-2 text-sm leading-[1.25] outline-none focus:border-deep-forest disabled:bg-deep-forest/5"
                />
                <button
                  type="submit"
                  disabled={!canSend || isSending}
                  className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px] bg-deep-forest text-pale-canvas transition hover:bg-foudre-pink disabled:opacity-50"
                  aria-label="Send message"
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div>
              <MessageSquare className="mx-auto h-12 w-12 text-deep-forest/35" />
              <h2 className="mt-4 font-beni text-[64px] leading-[0.72] text-deep-forest">
                No Chat Selected
              </h2>
              <p className="mt-2 max-w-sm text-sm text-deep-forest/65">
                Open a conversation from an event page or choose one from the list.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
