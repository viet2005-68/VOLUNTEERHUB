// src/components/Dashboard/EventCardSkeleton.jsx
import React from "react";
import Skeleton from "./Skeleton";

const EventCardSkeleton = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full flex items-center space-x-4">
      {/* 1. Icon tròn */}
      <Skeleton className="h-12 w-12 rounded-full shrink-0" />

      {/* 2. Text Content */}
      <div className="flex-1 space-y-2">
        {/* Label nhỏ */}
        <Skeleton className="h-3 w-1/2" />
        {/* Value to */}
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
};

export default EventCardSkeleton;
