import React from "react";
import TrendingCard from "./TrendingCard";
import ModalActivity from "../ModalActivity/ModalActivity";
import { ArrowRight } from "lucide-react";
import { useTrendingEvents } from "../../hook/useEvent";
import { useNavigate } from "react-router-dom";

function TrendingEvent() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useTrendingEvents({
    days: 30,
    pageNum: 0,
    pageSize: 10,
  });

  const trendingEvents = data?.data || [];

  return (
    <div className="flex flex-col gap-5">
      <ModalActivity title="Trending Events" subtile="Most popular events">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading trending events...</div>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">
              Error: {error?.message || "Failed to load trending events"}
            </div>
          </div>
        )}

        {!isLoading && !isError && trendingEvents.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">No trending events available</div>
          </div>
        )}

        {!isLoading &&
          !isError &&
          trendingEvents.map((item) => (
            <TrendingCard key={item.id} items={item} />
          ))}

        {!isLoading && !isError && trendingEvents.length > 0 && (
          <div
            className="flex flex-row items-center justify-end gap-1 cursor-pointer hover:text-red-500 transition-colors text-sm font-semibold"
            onClick={() => navigate("/trending")}
          >
            <p>See all trending</p>
            <ArrowRight className="w-4 h-4" />
          </div>
        )}
      </ModalActivity>
    </div>
  );
}

export default TrendingEvent;
