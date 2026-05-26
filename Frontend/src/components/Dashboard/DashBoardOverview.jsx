// src/components/Dashboard/DashBoardOverview.jsx
import React from "react";

// Import các Hooks
import { useAuth } from "../../hook/useAuth";
import { useDashboardStats } from "../../hook/useDashboardStats";

// Import các Components giao diện
import EventCard from "./EventCard";
import EventCardSkeleton from "../Skeleton/EventCardSkeleton";
import EventCardError from "./EventCardError";

function DashBoardOverview() {
  // 1. Lấy Role của user hiện tại
  const { user } = useAuth();
  const role = user?.role?.toUpperCase() || "USER";

  const cardDataList = useDashboardStats(role);

  return (
    <div className="space-y-4 text-deep-forest w-full">
      {/* Grid Layout: Mobile 1 cột, Tablet 2 cột, PC 4 cột */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 w-full justify-between gap-3 md:gap-8">
        {cardDataList.map((card, index) => {
          if (card.isLoading) {
            return <EventCardSkeleton key={`skeleton-${index}`} />;
          }

          if (card.isError) {
            return (
              <EventCardError
                key={`error-${index}`}
                message="Không tải được dữ liệu"
                onRetry={() => card.refetch()}
              />
            );
          }

          return <EventCard key={card.id || index} {...card} />;
        })}
      </div>
    </div>
  );
}

export default DashBoardOverview;
