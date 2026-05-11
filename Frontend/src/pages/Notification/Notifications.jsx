import React, { useMemo, useState } from "react";
import NotificationList from "./NotificationList";
import DropdownSelect from "../../components/Dropdown/DropdownSelect";
import { Mail, CheckCheck } from "lucide-react";
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
  } = useInfiniteNotifications(3);

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
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading notifications...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Error loading notifications: {error?.message || "Unknown error"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex flex-row justify-between items-center mb-6 relative">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2">
            <span className="text-blue-600">
              <Mail />
            </span>
            <span>Notifications</span>
          </h3>
          <p className="text-gray-500">Manage all notifications.</p>
        </div>

        <div className="flex flex-row items-center gap-3 right-0 bottom-0 absolute max-sm:mr-2 mr-8">
          {/* Mark all as read button */}
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllReadMutation.isPending}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Mark all as read"
          >
            <CheckCheck className="w-4 h-4" />
            <span className="max-sm:hidden">Mark all read</span>
          </button>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">Status:</p>
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

      <div className="rounded-2xl sm:mt-5 sm:p-4 relative">
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
