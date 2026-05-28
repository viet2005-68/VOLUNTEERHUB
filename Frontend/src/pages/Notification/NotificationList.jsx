import React from "react";
import { Virtuoso } from "react-virtuoso";
import NotificationCard from "./NotificationCard";
import { Loader2, Bell } from "lucide-react";

function NotificationList({ items, loadMore, hasMore, isLoading }) {
  const Footer = () => {
    if (!hasMore && items.length > 0) {
      return (
        <div className="py-4 text-center text-sm font-semibold text-deep-forest/55">
          No more notifications
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-deep-forest" />
          <span className="ml-2 text-sm font-medium text-deep-forest/60">
            Loading more...
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative bg-pale-canvas">
      {items.length === 0 ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-[20px] border border-deep-forest/10 bg-ash-whisper/25">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-[80px] w-[80px] items-center justify-center rounded-full bg-pale-canvas text-deep-forest/45 shadow-sm">
              <Bell className="h-10 w-10" />
            </div>
            <p className="text-base font-bold text-deep-forest">
              No notifications yet
            </p>
            <p className="mt-1 text-sm font-medium text-deep-forest/55">
              New updates will show up here.
            </p>
          </div>
        </div>
      ) : (
        <div className="h-[min(68vh,720px)] min-h-[420px] overflow-hidden rounded-[20px] border border-deep-forest/10 bg-ash-whisper/25">
          <Virtuoso
            data={items}
            endReached={loadMore}
            overscan={240}
            increaseViewportBy={{ top: 160, bottom: 360 }}
            computeItemKey={(index, noti) => noti?.id ?? index}
            itemContent={(index, noti) => (
              <div className="px-3 pt-3">
                <NotificationCard noti={noti} />
              </div>
            )}
            components={{
              Footer,
            }}
            style={{ height: "100%" }}
          />
        </div>
      )}
    </div>
  );
}

export default NotificationList;
