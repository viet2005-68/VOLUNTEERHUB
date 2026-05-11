import React, { useState, useEffect } from "react";
import { Virtuoso } from "react-virtuoso";
import { useInfiniteTrendingEvents } from "../../hook/useEvent";
import TrendingEventCard from "../../components/TrendingEvent/TrendingEventCard";
import { TrendingUp, Flame, Calendar, Sparkles, ArrowLeft } from "lucide-react";
import { Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";

function TrendingPage() {
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [isChangingFilter, setIsChangingFilter] = useState(false);
  const {
    events,
    isLoading,
    isFetching,
    isError,
    error,
    hasMore,
    loadMore,
    totalElements,
  } = useInfiniteTrendingEvents({ days, pageSize: 12 });

  // Reset when days filter changes
  useEffect(() => {
    setIsChangingFilter(true);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Reset filter change state after a delay
    const timer = setTimeout(() => {
      setIsChangingFilter(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [days]);

  const handleDaysChange = (newDays) => {
    if (days === newDays) return; // Prevent unnecessary resets
    setDays(newDays);
  };

  const timeRangeOptions = [
    { value: 7, label: "Last 7 Days" },
    { value: 30, label: "Last 30 Days" },
    { value: 90, label: "Last 3 Months" },
  ];

  // Group events into rows of 3 for better virtualization
  const ITEMS_PER_ROW = 3;
  const groupedEvents = [];
  for (let i = 0; i < events.length; i += ITEMS_PER_ROW) {
    groupedEvents.push(events.slice(i, i + ITEMS_PER_ROW));
  }

  // Virtuoso Footer Component
  const Footer = () => {
    if (!hasMore && events.length > 0) {
      return (
        <div className="py-6 text-center">
          <p className="text-gray-500 text-lg">🎉 You've reached the end!</p>
          <p className="text-gray-400 text-sm mt-2">
            No more trending events to show
          </p>
        </div>
      );
    }

    if (hasMore && isFetching) {
      return (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading more events...</p>
        </div>
      );
    }

    return null;
  };

  // Virtuoso Item Component - renders a row of cards
  const ItemContent = (index, row) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {row.map((event, idx) => (
          <div
            key={event.id}
            style={{
              animation: `fadeInUp 0.5s ease-out ${
                (index * ITEMS_PER_ROW + idx) * 0.02
              }s both`,
            }}
          >
            <TrendingEventCard {...event} />
          </div>
        ))}
      </div>
    );
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              {error?.message || "Failed to load trending events"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-pink-500 text-white relative">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200 group"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Flame className="w-10 h-10 animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-3">
                Trending Events
                <Sparkles className="w-8 h-8 animate-spin" />
              </h1>
              <p className="text-white/90 text-lg mt-2">
                Discover the hottest volunteer opportunities right now
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-6">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">
                  {totalElements} Trending Events
                </span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Updated Daily</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <span className="text-gray-700 font-semibold">Time Range:</span>
              <div className="flex gap-2 flex-wrap">
                {timeRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDaysChange(option.value)}
                    disabled={
                      isChangingFilter || (isLoading && days === option.value)
                    }
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      days === option.value
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading && days === option.value ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      option.label
                    )}
                  </button>
                ))}
              </div>
            </div>

            {isFetching && events.length > 0 && !isChangingFilter && (
              <div className="flex items-center gap-2 text-gray-600 animate-pulse">
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Loading more...</span>
              </div>
            )}
          </div>

          {/* Progress indicator when changing filter */}
          {isChangingFilter && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Fetching trending events...</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {isLoading || isChangingFilter ? (
          <div className="space-y-4">
            {isChangingFilter && (
              <div className="text-center py-4">
                <p className="text-gray-600 font-medium">
                  Loading trending events for the selected time range...
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
                >
                  <Skeleton
                    variant="rectangular"
                    height={200}
                    animation="wave"
                  />
                  <div className="p-4 space-y-2">
                    <Skeleton variant="text" width="70%" height={28} />
                    <Skeleton variant="text" width="90%" height={20} />
                    <Skeleton variant="text" width="50%" height={20} />
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Skeleton variant="rectangular" height={40} />
                      <Skeleton variant="rectangular" height={40} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Trending Events Found
            </h2>
            <p className="text-gray-600 mb-6">
              Check back later for new trending opportunities!
            </p>
            <button
              onClick={() => setDays(90)}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all"
            >
              Try Longer Time Range
            </button>
          </div>
        ) : (
          <Virtuoso
            useWindowScroll
            data={groupedEvents}
            endReached={() => {
              if (hasMore && !isFetching) {
                console.log("End reached, loading more...");
                loadMore();
              }
            }}
            overscan={600}
            increaseViewportBy={{ top: 200, bottom: 600 }}
            itemContent={ItemContent}
            components={{
              Footer,
            }}
          />
        )}
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default TrendingPage;
