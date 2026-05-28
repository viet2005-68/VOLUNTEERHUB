import React, { useMemo, useState } from "react";
import NotificationList from "./NotificationList";
import DropdownSelect from "../../components/Dropdown/DropdownSelect";
import { Bell, CheckCheck, Loader2, TriangleAlert } from "lucide-react";
import {
  useInfiniteNotifications,
  useMarkAllRead,
} from "../../hook/useNotification";

export default function Notifications() {
  const [status, setStatus] = useState("all");

  // Fetch notifications with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteNotifications(10);

  const markAllReadMutation = useMarkAllRead();

  // Flatten all pages into single array and filter by status
  const notifications = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  const allNotifications = useMemo(() => {
    // Filter by read/unread status
    if (status === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    if (status === "read") {
      return notifications.filter((n) => n.isRead);
    }
    return notifications;
  }, [notifications, status]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );
  const readCount = notifications.length - unreadCount;

  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-6 text-deep-forest shadow-sm">
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-ash-whisper">
            <Loader2 className="h-6 w-6 animate-spin text-deep-forest" />
          </div>
          <div className="text-sm font-bold text-deep-forest/60">
            Loading notifications...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-6 text-deep-forest shadow-sm">
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-ash-whisper text-foudre-pink">
            <TriangleAlert className="h-6 w-6" />
          </div>
          <div className="max-w-md text-sm font-bold text-foudre-pink">
            Error loading notifications: {error?.message || "Unknown error"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas/95 p-5 text-deep-forest shadow-sm sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="inline-flex items-center gap-3 font-clash-grotesk text-2xl font-bold leading-[1.05] text-deep-forest sm:text-3xl">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-ash-whisper text-deep-forest">
              <Bell className="h-6 w-6" />
            </span>
            <span>Notifications</span>
          </h3>
          <p className="text-sm font-medium text-deep-forest/60">
            Manage all notifications.
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-[10px] bg-ash-whisper px-3 py-2 text-deep-forest">
              {notifications.length} total
            </span>
            <span className="rounded-[10px] bg-foudre-pink/10 px-3 py-2 text-foudre-pink">
              {unreadCount} unread
            </span>
            <span className="rounded-[10px] bg-deep-forest/10 px-3 py-2 text-deep-forest">
              {readCount} read
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          {/* Mark all as read button */}
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllReadMutation.isPending || unreadCount === 0}
            className="flex h-12 items-center gap-2 rounded-[10px] bg-deep-forest px-4 text-sm font-bold text-pale-canvas shadow-sm transition-colors hover:bg-foudre-pink disabled:cursor-not-allowed disabled:opacity-50"
            title="Mark all as read"
          >
            <CheckCheck className="w-4 h-4" />
            <span className="max-sm:hidden">Mark all read</span>
          </button>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-deep-forest/70">Status:</p>
            <div className="min-w-[128px]">
              <DropdownSelect
                options={[
                  { value: "all", label: "All" },
                  { value: "unread", label: "Unread" },
                  { value: "read", label: "Read" },
                ]}
                onChange={setStatus}
                value={status}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative rounded-2xl">
        <NotificationList
          items={allNotifications}
          loadMore={loadMore}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
        />
      </div>
    </div>
  );
}
