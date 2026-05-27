import React, { useMemo, useState } from "react";
import NotificationList from "./NotificationList";
import DropdownSelect from "../../components/Dropdown/DropdownSelect";
import { Bell, CheckCheck } from "lucide-react";
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
  const allNotifications = useMemo(() => {
    if (!data?.pages) return [];

    const notifications = data.pages.flatMap((page) => page.data);

    // Filter by read/unread status
    if (status === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    if (status === "read") {
      return notifications.filter((n) => n.isRead);
    }
    return notifications;
  }, [data, status]);

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
      <div className="rounded-[20px] border border-deep-forest/15 bg-pale-canvas p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-deep-forest/60">Loading notifications...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[20px] border border-deep-forest/15 bg-pale-canvas p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-foudre-pink">
            Error loading notifications: {error?.message || "Unknown error"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-deep-forest/15 bg-pale-canvas p-5 text-deep-forest sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="inline-flex items-center gap-3 font-clash-grotesk text-2xl font-bold text-deep-forest sm:text-3xl">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-ash-whisper text-deep-forest">
              <Bell className="h-6 w-6" />
            </span>
            <span>Notifications</span>
          </h3>
          <p className="text-sm font-medium text-deep-forest/60">
            Manage all notifications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mark all as read button */}
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllReadMutation.isPending}
            className="flex h-11 items-center gap-2 rounded-[10px] bg-deep-forest px-4 text-sm font-bold text-pale-canvas transition-colors hover:bg-foudre-pink disabled:cursor-not-allowed disabled:opacity-50"
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
