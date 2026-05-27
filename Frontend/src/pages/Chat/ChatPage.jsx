import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ImagePlus,
  Loader2,
  Menu,
  MessageSquare,
  Send,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
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
import { useEventDetail } from "../../hook/useEvent";

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

const initialsFor = (name) => {
  const text = String(name || "?").trim();
  if (!text) return "?";
  return text
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const avatarSizes = {
  header: "h-[44px] w-[44px] text-base",
  message: "h-[34px] w-[34px] text-xs",
};

function ChatAvatar({ user, name, size = "message" }) {
  const [failedPrimary, setFailedPrimary] = useState(false);
  const [failedFallback, setFailedFallback] = useState(false);
  const label = name || displayUserName(user);
  const fallbackSrc = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    label || "VolunteerHub"
  )}`;
  const primarySrc = user?.avatarUrl;
  const src = primarySrc && !failedPrimary ? primarySrc : fallbackSrc;
  const showImage = src && !(src === fallbackSrc && failedFallback);

  useEffect(() => {
    setFailedPrimary(false);
    setFailedFallback(false);
  }, [primarySrc, label]);

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-deep-forest/10 font-black text-deep-forest ${avatarSizes[size] || avatarSizes.message}`}
      aria-label={label}
      title={label}
    >
      {showImage ? (
        <img
          src={src}
          alt={label}
          className="h-full w-full object-cover"
          onError={() => {
            if (src === primarySrc) {
              setFailedPrimary(true);
            } else {
              setFailedFallback(true);
            }
          }}
        />
      ) : (
        <span>{initialsFor(label)}</span>
      )}
    </div>
  );
}

const userIdentity = (value) =>
  value?.id || value?.userId || value?.user_id || value?.sub || value;

const sameUser = (left, right) => {
  const leftId = userIdentity(left);
  const rightId = userIdentity(right);
  return !!leftId && !!rightId && String(leftId) === String(rightId);
};

const conversationPeer = (conversation, currentUser) => {
  if (!conversation) return { id: null, role: "Member", user: null };

  if (sameUser(currentUser, conversation.managerId)) {
    return {
      id: conversation.volunteerId,
      role: "Volunteer",
      user: conversation.volunteer || null,
    };
  }

  if (sameUser(currentUser, conversation.volunteerId)) {
    return {
      id: conversation.managerId,
      role: "Manager",
      user: conversation.manager || null,
    };
  }

  if (currentUser?.role === ROLES.MANAGER && conversation.volunteerId) {
    return {
      id: conversation.volunteerId,
      role: "Volunteer",
      user: conversation.volunteer || null,
    };
  }

  if (currentUser?.role === ROLES.USER && conversation.managerId) {
    return {
      id: conversation.managerId,
      role: "Manager",
      user: conversation.manager || null,
    };
  }

  if (conversation.otherUser && !sameUser(currentUser, conversation.otherUser)) {
    return {
      id: conversation.otherUserId || userIdentity(conversation.otherUser),
      role: "Member",
      user: conversation.otherUser,
    };
  }

  const fallbackId = [
    conversation.otherUserId,
    conversation.volunteerId,
    conversation.managerId,
  ].find((id) => id && !sameUser(currentUser, id));

  return { id: fallbackId, role: "Member", user: null };
};

const conversationLabel = (conversation, currentUser) => {
  if (!conversation) return "Select a conversation";
  const peer = conversationPeer(conversation, currentUser);
  if (peer.user) return displayUserName(peer.user);
  return `${peer.role} ${shortId(peer.id)}`;
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
  const { eventId: routeEventId } = useParams();
  const queryClient = useQueryClient();
  const isEventScoped = Boolean(routeEventId);
  const { data: scopedEvent } = useEventDetail(routeEventId, {
    enabled: isEventScoped,
  });
  const { data: conversations = [], isLoading } = useConversations({
    eventId: routeEventId,
  });
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
  const [isConversationListOpen, setIsConversationListOpen] = useState(false);
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
  const scopedEventData = scopedEvent?.data || scopedEvent;
  const scopedEventTitle =
    scopedEventData?.name ||
    (activeConversation
      ? eventTitle(activeConversation)
      : "Event #" + (routeEventId || ""));
  const pageTitle = isEventScoped ? "Event Chat" : "Messages";
  const pageSubtitle = isEventScoped ? scopedEventTitle : "Event conversations";

  useEffect(() => {
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, []);

  useEffect(() => {
    selectedRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    if (conversations.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !conversations.some((item) => item.id === selectedId)) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    if (isEventScoped) return;
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
  }, [isEventScoped, openChatConversation, searchParams, setSearchParams]);

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
  const activePeer = conversationPeer(activeConversation, user);
  const activeOtherName = conversationLabel(activeConversation, user);

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-white text-deep-forest md:rounded-[20px] lg:grid lg:grid-cols-[330px_minmax(0,1fr)]">
      {isConversationListOpen && (
        <button
          type="button"
          className="fixed inset-x-0 bottom-[72px] top-16 z-30 bg-black/20 lg:hidden"
          onClick={() => setIsConversationListOpen(false)}
          aria-label="Close conversation list"
        />
      )}
      <aside
        className={`fixed inset-x-0 bottom-[72px] z-40 max-h-[70dvh] min-h-0 flex-col overflow-hidden overflow-x-hidden rounded-t-[20px] bg-pale-canvas shadow-2xl lg:static lg:z-auto lg:flex lg:max-h-none lg:rounded-none lg:shadow-none lg:border-r lg:border-deep-forest/10 ${
          isConversationListOpen ? "flex" : "hidden"
        }`}
      >
        <div className="flex items-center gap-3 px-4 py-3 md:pb-5 md:pt-4">
          <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] bg-deep-forest text-pale-canvas">
            <MessageSquare className="h-[20px] w-[20px]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-2xl font-black uppercase leading-[1.05] text-deep-forest">
              {pageTitle}
            </div>
            <p className="text-xs font-bold text-deep-forest/60">
              {pageSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsConversationListOpen(false)}
            className="inline-flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] bg-deep-forest/5 text-deep-forest lg:hidden"
            aria-label="Close conversations"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        {openingFromQuery && (
          <div className="mx-4 mb-3 flex items-center gap-2 rounded-[10px] bg-deep-forest/5 px-3 py-2 text-sm font-bold text-deep-forest/70">
            <Loader2 className="h-[16px] w-[16px] animate-spin" />
            Opening event chat...
          </div>
        )}

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden overscroll-contain px-3">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-deep-forest/65">
              <Loader2 className="h-[16px] w-[16px] animate-spin" />
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-[10px] bg-white/70 p-4 text-sm text-deep-forest/65">
              {isEventScoped ? "No conversations for this event yet." : "No conversations yet."}
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                type="button"
                key={conversation.id}
                onClick={() => {
                  setSelectedId(conversation.id);
                  setIsConversationListOpen(false);
                }}
                className={`w-full p-3 text-left transition ${
                  selectedId === conversation.id
                    ? "rounded-[12px] bg-deep-forest text-pale-canvas"
                    : "rounded-[12px] bg-white/70 hover:bg-deep-forest/5"
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <ChatAvatar
                    user={conversationPeer(conversation, user).user}
                    name={conversationLabel(conversation, user)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-black">
                        {conversationLabel(conversation, user)}
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
                      {eventTitle(conversation)}
                    </p>
                    <p
                      className={`mt-1 text-[11px] ${
                        selectedId === conversation.id
                          ? "text-pale-canvas/65"
                          : "text-deep-forest/45"
                      }`}
                    >
                      {formatDateTime(conversation.lastMessageAt || conversation.updatedAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden">
        {activeConversation ? (
          <>
            <header className="flex items-center justify-between gap-4 bg-white px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsConversationListOpen(true)}
                  className="inline-flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[10px] bg-deep-forest/5 text-deep-forest lg:hidden"
                  aria-label="Open conversation list"
                  title="Open conversation list"
                >
                  <Menu className="h-[20px] w-[20px]" />
                </button>
                <ChatAvatar
                  user={activePeer.user}
                  name={activeOtherName}
                  size="header"
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
              className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-pale-canvas/35 px-4 py-5"
            >
              {isLoadingMessages ? (
                <div className="flex items-center justify-center gap-2 text-sm text-deep-forest/65">
                  <Loader2 className="h-[16px] w-[16px] animate-spin" />
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
                          <Loader2 className="h-[14px] w-[14px] animate-spin" />
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
                          <ChatAvatar user={sender} name={senderName} />
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
                                    className="h-[128px] w-full object-cover"
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

            {isReadOnly ? (
              <div className="border-t border-deep-forest/10 bg-white p-4">
                <div className="rounded-[10px] bg-deep-forest/5 px-4 py-3 text-sm font-bold text-deep-forest">
                  Cuộc trò chuyện hiện chỉ cho phép xem.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} className="border-t border-deep-forest/10 bg-white p-4">
                {selectedImages.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {selectedImages.map((image) => (
                      <div
                        key={image.id}
                        className="relative h-[80px] w-[80px] overflow-hidden rounded-[10px]"
                      >
                        <img
                          src={image.previewUrl}
                          alt={image.file.name}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeSelectedImage(image.id)}
                          className="absolute right-1 top-1 inline-flex h-[24px] w-[24px] items-center justify-center rounded-full bg-deep-forest text-pale-canvas"
                          aria-label="Remove image"
                        >
                          <X className="h-[14px] w-[14px]" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex min-w-0 gap-3">
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
                    disabled={isSending || selectedImages.length >= MAX_IMAGES}
                    className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px] bg-deep-forest/5 text-deep-forest transition hover:bg-deep-forest hover:text-pale-canvas disabled:opacity-50"
                    aria-label="Attach image"
                    title="Attach image"
                  >
                    <ImagePlus className="h-[20px] w-[20px]" />
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
                    disabled={isSending}
                    placeholder="Write a message..."
                    rows={2}
                    className="min-h-[52px] min-w-0 flex-1 resize-none rounded-[10px] border border-deep-forest/15 px-3 py-2 text-sm leading-[1.25] outline-none focus:border-deep-forest disabled:bg-deep-forest/5"
                  />
                  <button
                    type="submit"
                    disabled={!canSend || isSending}
                    className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px] bg-deep-forest text-pale-canvas transition hover:bg-foudre-pink disabled:opacity-50"
                    aria-label="Send message"
                  >
                    {isSending ? (
                      <Loader2 className="h-[20px] w-[20px] animate-spin" />
                    ) : (
                      <Send className="h-[20px] w-[20px]" />
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div>
              <MessageSquare className="mx-auto h-[48px] w-[48px] text-deep-forest/35" />
              <h2 className="mt-4 font-beni text-[64px] leading-[0.72] text-deep-forest">
                No Chat Selected
              </h2>
              <p className="mt-2 max-w-sm text-sm text-deep-forest/65">
                {isEventScoped
                  ? "Choose a volunteer conversation for this event."
                  : "Open a conversation from an event page or choose one from the list."}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
