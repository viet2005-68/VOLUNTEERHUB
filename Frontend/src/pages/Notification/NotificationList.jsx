import React, { useRef } from "react";
import { Virtuoso } from "react-virtuoso";
import NotificationCard from "./NotificationCard";
import { MoveUp, Loader2, Bell } from "lucide-react";

function NotificationList({ items, loadMore, hasMore, isLoading }) {
  const virtuosoRef = useRef();

  // Hàm scroll đến đầu
  const scrollToTop = () => {
    virtuosoRef.current?.scrollToIndex({
      index: 0,
      align: "start",
      behavior: "smooth",
    });
  };

  // Footer component for loading state
  const Footer = () => {
    if (!hasMore && items.length > 0) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm">
          No more notifications
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="ml-2 text-sm text-gray-600">Loading more...</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-[55vh] max-h-[700px] min-h-[320px] bg-white p-3 sm:p-4">
      {items.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-yellow-500 text-5xl mb-4 flex justify-center">
              <Bell className="w-12 h-12" />
            </div>
            <p className="text-gray-500">No notifications yet</p>
          </div>
        </div>
      ) : (
        <>
          <Virtuoso
            ref={virtuosoRef}
            style={{ height: "100%" }}
            data={items}
            endReached={loadMore}
            itemContent={(index, noti) => (
              <NotificationCard key={`${noti?.id ?? index}`} noti={noti} />
            )}
            components={{
              Footer,
            }}
          />

          <button
            onClick={scrollToTop}
            className="absolute animate-bounce -bottom-5 right-0 w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition"
          >
            <MoveUp />
          </button>
        </>
      )}
    </div>
  );
}

export default NotificationList;
