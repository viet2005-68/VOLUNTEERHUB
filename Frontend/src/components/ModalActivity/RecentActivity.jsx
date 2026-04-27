import React from "react";
import UpComingCard from "./UpComingCard";
import ModalActivity from "./ModalActivity";
import { useRecentPendingRegistrations } from "../../hook/useRegistration";
import Skeleton from "@mui/material/Skeleton";
import Card from "../Card/Card";
import { BellOff } from "lucide-react";

function RecentActivity() {
  const queryParams = {
    pageSize: 3,
    sortedBy: "date",
    order: "desc",
    status: "PENDING",
  };
  const { data, isLoading, isError, isFetching } =
    useRecentPendingRegistrations(queryParams);

  console.log("[RecentActivity] data:", data);

  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data?.data)
        ? data.data
        : [];

  console.log("[RecentActivity] items:", items);

  const cards = items
    .slice()
    .sort((a, b) => {
      const da = new Date(a?.event?.startTime || 0).getTime();
      const db = new Date(b?.event?.startTime || 0).getTime();
      return db - da; // desc
    })
    .slice(0, 3)
    .map((reg, idx) => {
      const ev = reg.event || {};

      // Format location
      const address = ev.address || {};
      const locationParts = [
        address.street,
        address.district,
        address.province,
      ].filter(Boolean);
      const locationText = locationParts.join(", ");

      return {
        id: reg.eventId ?? idx,
        title: ev.name || "Untitled",
        subtile: ev.category?.name,
        date: ev.startTime,
        starttime: ev.startTime,
        endtime: ev.endTime,
        location: locationText,
        status: (reg.status || "PENDING").toUpperCase(),
        urlImg: ev.imageUrl,
      };
    });

  console.log("[RecentActivity] cards:", cards);

  const SkeletonRecentActivityCard = () => (
    <div className="text-gray-600 max-md:text-sm">
      <Card>
        <div className="flex items-start gap-3 p-3">
          <div className="flex flex-col justify-between gap-1.5 flex-1">
            {/* Title */}
            <Skeleton width="80%" height={20} />
            {/* Category */}
            <Skeleton width={80} height={16} />
            {/* Date & Time */}
            <div className="flex flex-row gap-3">
              <Skeleton width={100} height={16} />
              <Skeleton width={70} height={16} />
            </div>
            {/* Location */}
            <Skeleton width="70%" height={16} />
            {/* Status badge */}
            <Skeleton width={70} height={24} className="rounded-full" />
          </div>
          {/* Image */}
          <Skeleton
            variant="rectangular"
            width={96}
            height={96}
            className="rounded-lg"
          />
        </div>
      </Card>
    </div>
  );

  return (
    <div className="h-full">
      <ModalActivity
        title="Awaiting Approval"
        subtile="Events recently added and pending review"
        viewMore={true}
        path="/dashboard/opportunities"
      >
        {(isLoading || isFetching) && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRecentActivityCard key={i} />
            ))}
          </>
        )}
        {isError && (
          <div className="text-center py-8 flex flex-col gap-4 items-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <BellOff className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              Failed to load recent activities.
            </p>
          </div>
        )}
        {!isLoading && !isFetching && !isError && cards.length === 0 && (
          <div className="text-center py-8 flex flex-col gap-4 items-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <BellOff className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">No pending activities.</p>
          </div>
        )}
        {!isLoading &&
          !isFetching &&
          !isError &&
          cards.map((item) => <UpComingCard key={item.id} {...item} />)}
      </ModalActivity>
    </div>
  );
}

export default RecentActivity;
