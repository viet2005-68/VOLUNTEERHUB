import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageSquare, Plus, Send, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  chatQueryKey,
  useConversationMessages,
  useConversations,
  useMarkConversationRead,
  useOpenConversation,
  useSendChatMessage,
} from "../../hook/useChat";
import { createChatClient } from "../../services/chatService";
import { useAuth } from "../../hook/useAuth";

const formatDateTime = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const conversationLabel = (conversation, userId) => {
  if (!conversation) return "Select a conversation";
  const other = conversation.otherUserId || conversation.volunteerId || conversation.managerId;
  const role =
    userId === conversation.managerId
      ? "Volunteer"
      : userId === conversation.volunteerId
      ? "Manager"
      : "Member";
  return `${role} ${String(other || "").slice(0, 8)}`;
};

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: conversations = [], isLoading } = useConversations();
  const openConversation = useOpenConversation();
  const sendMessage = useSendChatMessage();
  const markRead = useMarkConversationRead();
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState("");
  const [manualEventId, setManualEventId] = useState(searchParams.get("eventId") || "");
  const [manualVolunteerId, setManualVolunteerId] = useState(searchParams.get("volunteerId") || "");
  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId) || null,
    [conversations, selectedId]
  );
  const { data: messages = [], isLoading: isLoadingMessages } =
    useConversationMessages(selectedId);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    const eventId = searchParams.get("eventId");
    if (!eventId) return;

    openConversation.mutate(
      { eventId, volunteerId: searchParams.get("volunteerId") || undefined },
      {
        onSuccess: (conversation) => {
          setSelectedId(conversation.id);
          setSearchParams({});
        },
      }
    );
  }, [openConversation, searchParams, setSearchParams]);

  useEffect(() => {
    const client = createChatClient({
      onConversationMessage: (message) => {
        queryClient.setQueryData(
          [...chatQueryKey, "messages", message.conversationId],
          (old = []) => {
            if (old.some((item) => item.id === message.id)) return old;
            return [...old, message];
          }
        );
        queryClient.invalidateQueries({ queryKey: [...chatQueryKey, "conversations"] });
      },
      onUserMessage: (message) => {
        queryClient.invalidateQueries({ queryKey: [...chatQueryKey, "conversations"] });
        queryClient.setQueryData(
          [...chatQueryKey, "messages", message.conversationId],
          (old = []) => {
            if (old.some((item) => item.id === message.id)) return old;
            return [...old, message];
          }
        );
      },
    });

    client.activate();
    return () => client.deactivate();
  }, [queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, selectedId]);

  useEffect(() => {
    if (!selectedId || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    markRead.mutate({ conversationId: selectedId, lastReadMessageId: lastMessage.id });
  }, [markRead, messages, selectedId]);

  const handleOpenManualConversation = () => {
    if (!manualEventId) return;
    openConversation.mutate(
      {
        eventId: manualEventId,
        volunteerId: manualVolunteerId || undefined,
      },
      {
        onSuccess: (conversation) => {
          setSelectedId(conversation.id);
          setManualEventId("");
          setManualVolunteerId("");
        },
      }
    );
  };

  const handleSend = (event) => {
    event.preventDefault();
    if (!selectedId || !draft.trim()) return;
    sendMessage.mutate(
      { conversationId: selectedId, body: draft.trim() },
      {
        onSuccess: () => setDraft(""),
      }
    );
  };

  const isReadOnly = activeConversation?.status === "READ_ONLY";

  return (
    <div className="grid min-h-[680px] overflow-hidden rounded-[25px] border-2 border-ash-whisper bg-white text-deep-forest lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="border-b border-ash-whisper bg-pale-canvas p-4 lg:border-b-0 lg:border-r">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-deep-forest text-pale-canvas">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-black">Messages</h1>
            <p className="text-xs font-medium text-deep-forest/65">
              Event chat for web
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-ash-whisper bg-white p-3">
          <p className="mb-2 text-xs font-bold uppercase text-deep-forest/60">
            Open event chat
          </p>
          <input
            value={manualEventId}
            onChange={(event) => setManualEventId(event.target.value)}
            placeholder="Event ID"
            className="mb-2 w-full rounded-lg border border-ash-whisper px-3 py-2 text-sm outline-none focus:border-foudre-pink"
          />
          <input
            value={manualVolunteerId}
            onChange={(event) => setManualVolunteerId(event.target.value)}
            placeholder="Volunteer ID (manager only)"
            className="mb-2 w-full rounded-lg border border-ash-whisper px-3 py-2 text-sm outline-none focus:border-foudre-pink"
          />
          <button
            type="button"
            onClick={handleOpenManualConversation}
            disabled={!manualEventId || openConversation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-deep-forest px-3 py-2 text-sm font-bold text-pale-canvas transition hover:bg-foudre-pink disabled:opacity-60"
          >
            {openConversation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Open chat
          </button>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-deep-forest/65">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ash-whisper bg-white p-4 text-sm text-deep-forest/65">
              No conversations yet.
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                type="button"
                key={conversation.id}
                onClick={() => setSelectedId(conversation.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  selectedId === conversation.id
                    ? "border-foudre-pink bg-bubblegum-blush/40"
                    : "border-ash-whisper bg-white hover:bg-ash-whisper/40"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-bold">
                    Event #{conversation.eventId}
                  </span>
                  {conversation.unreadCount > 0 && (
                    <span className="rounded-full bg-foudre-pink px-2 py-0.5 text-xs font-bold text-pale-canvas">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-xs text-deep-forest/65">
                  {conversationLabel(conversation, user?.id)}
                </p>
                <p className="mt-1 text-[11px] text-deep-forest/50">
                  {formatDateTime(conversation.lastMessageAt || conversation.updatedAt)}
                </p>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex min-h-[620px] flex-col">
        {activeConversation ? (
          <>
            <header className="flex items-center justify-between border-b border-ash-whisper bg-white px-5 py-4">
              <div>
                <h2 className="text-base font-black">
                  Event #{activeConversation.eventId}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-xs font-medium text-deep-forest/65">
                  <Users className="h-3.5 w-3.5" />
                  {conversationLabel(activeConversation, user?.id)}
                </p>
              </div>
              <span className="rounded-full border border-ash-whisper px-3 py-1 text-xs font-bold">
                {activeConversation.status}
              </span>
            </header>

            <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-5">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center gap-2 text-sm text-deep-forest/65">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-ash-whisper bg-white p-6 text-center text-sm text-deep-forest/65">
                  Start the conversation when you are ready.
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const mine = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            mine
                              ? "bg-deep-forest text-pale-canvas"
                              : "bg-white text-deep-forest"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.body}</p>
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
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="border-t border-ash-whisper bg-white p-4">
              {isReadOnly && (
                <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  This conversation is read-only for the current registration state.
                </p>
              )}
              <div className="flex gap-3">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend(event);
                    }
                  }}
                  disabled={isReadOnly || sendMessage.isPending}
                  placeholder="Write a message..."
                  rows={2}
                  className="min-h-[52px] flex-1 resize-none rounded-xl border border-ash-whisper px-3 py-2 text-sm outline-none focus:border-foudre-pink disabled:bg-slate-100"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || isReadOnly || sendMessage.isPending}
                  className="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-foudre-pink text-pale-canvas transition hover:bg-deep-forest disabled:opacity-50"
                  aria-label="Send message"
                >
                  {sendMessage.isPending ? (
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
              <h2 className="mt-4 text-lg font-black">No chat selected</h2>
              <p className="mt-2 max-w-sm text-sm text-deep-forest/65">
                Open a conversation from an event page or enter an event ID to start.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
