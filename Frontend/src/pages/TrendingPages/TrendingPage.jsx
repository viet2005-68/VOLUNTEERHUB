import React, { useState, useEffect } from "react";
import { Virtuoso } from "react-virtuoso";
import { useInfiniteTrendingEvents } from "../../hook/useEvent";
import TrendingEventCard from "../../components/TrendingEvent/TrendingEventCard";
import {
  TrendingUp,
  Flame,
  Calendar,
  ArrowLeft,
  Loader2,
  SearchX,
} from "lucide-react";
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

  // Group events into rows for smoother window virtualization
  const ITEMS_PER_ROW = 2;
  const groupedEvents = [];
  for (let i = 0; i < events.length; i += ITEMS_PER_ROW) {
    groupedEvents.push(events.slice(i, i + ITEMS_PER_ROW));
  }

  // Virtuoso Footer Component
  const Footer = () => {
    if (!hasMore && events.length > 0) {
      return (
        <div className="py-8 text-center">
          <p className="text-base font-bold text-deep-forest">
            You've reached the end
          </p>
          <p className="mt-2 text-sm font-medium text-deep-forest/55">
            No more trending events to show
          </p>
        </div>
      );
    }

    if (hasMore && isFetching) {
      return (
        <div className="flex flex-col items-center gap-3 py-6">
          <Loader2 className="h-6 w-6 animate-spin text-deep-forest" />
          <p className="text-sm font-bold text-deep-forest/60">
            Loading more events...
          </p>
        </div>
      );
    }

    return null;
  };

  // Virtuoso Item Component - renders a row of cards
  const ItemContent = (index, row) => {
    return (
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
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
      <div className="min-h-screen bg-pale-canvas p-6 text-deep-forest">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[18px] bg-ash-whisper text-foudre-pink">
              <SearchX className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-deep-forest">
              Oops! Something went wrong
            </h2>
            <p className="mb-4 text-sm font-medium text-deep-forest/65">
              {error?.message || "Failed to load trending events"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-[10px] bg-deep-forest px-6 py-3 text-sm font-bold text-pale-canvas transition-colors hover:bg-foudre-pink"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pale-canvas text-deep-forest">
      {/* Header Section */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        <div className="relative overflow-hidden rounded-[25px] border-2 border-ash-whisper bg-deep-forest p-6 text-pale-canvas shadow-sm sm:p-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-[12px] bg-pale-canvas/10 text-pale-canvas transition-colors hover:bg-foudre-pink"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="mb-4 flex items-center gap-4 pr-14">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-ash-whisper text-deep-forest">
              <Flame className="h-7 w-7" />
            </div>
            <div>
              <div className="font-beni text-[58px] font-black uppercase leading-[0.75] text-pale-canvas sm:text-[76px]">
                Trending Events
              </div>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-[1.25] text-pale-canvas/75 sm:text-base">
                Discover the hottest volunteer opportunities right now
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-[10px] bg-pale-canvas/10 px-4 py-3 text-sm font-bold">
              <TrendingUp className="h-4 w-4" />
              <span>{totalElements} Trending Events</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-[10px] bg-pale-canvas/10 px-4 py-3 text-sm font-bold">
              <Calendar className="h-4 w-4" />
              <span>Updated Daily</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="rounded-[20px] border-2 border-ash-whisper bg-pale-canvas p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <span className="text-sm font-bold text-deep-forest/70">
                Time Range:
              </span>
              <div className="flex flex-wrap gap-2">
                {timeRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDaysChange(option.value)}
                    disabled={
                      isChangingFilter || (isLoading && days === option.value)
                    }
                    className={`rounded-[10px] px-4 py-3 text-sm font-bold transition-colors ${
                      days === option.value
                        ? "bg-deep-forest text-pale-canvas"
                        : "bg-ash-whisper/70 text-deep-forest hover:bg-bubblegum-blush"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading && days === option.value ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
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
              <div className="flex animate-pulse items-center gap-2 text-deep-forest/60">
                <Loader2 className="h-5 w-5 animate-spin text-deep-forest" />
                <span className="text-sm">Loading more...</span>
              </div>
            )}
          </div>

          {/* Progress indicator when changing filter */}
          {isChangingFilter && (
            <div className="mt-4 border-t border-deep-forest/10 pt-4">
              <div className="flex items-center gap-3 text-deep-forest/60">
                <Loader2 className="h-5 w-5 animate-spin text-deep-forest" />
                <span className="text-sm">Fetching trending events...</span>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-ash-whisper">
                <div
                  className="h-full animate-pulse rounded-full bg-deep-forest"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        {isLoading || isChangingFilter ? (
          <div className="space-y-4">
            {isChangingFilter && (
              <div className="text-center py-4">
                <p className="text-sm font-bold text-deep-forest/60">
                  Loading trending events for the selected time range...
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[20px] border border-deep-forest/10 bg-white/55 p-5 shadow-sm"
                >
                  <div className="animate-pulse">
                    <div className="aspect-[16/10] rounded-2xl bg-deep-forest/10" />
                    <div className="mt-5 space-y-3">
                      <div className="h-5 w-2/3 rounded-full bg-deep-forest/10" />
                      <div className="h-4 w-5/6 rounded-full bg-deep-forest/10" />
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="h-12 rounded-[10px] bg-deep-forest/10" />
                        <div className="h-12 rounded-[10px] bg-deep-forest/10" />
                        <div className="h-12 rounded-[10px] bg-deep-forest/10" />
                        <div className="h-12 rounded-[10px] bg-deep-forest/10" />
                      </div>
                      <div className="h-11 rounded-[10px] bg-deep-forest/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-ash-whisper text-deep-forest/45">
              <SearchX className="h-10 w-10" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-deep-forest">
              No Trending Events Found
            </h2>
            <p className="mb-6 text-sm font-medium text-deep-forest/60">
              Check back later for new trending opportunities!
            </p>
            <button
              onClick={() => setDays(90)}
              className="rounded-[10px] bg-deep-forest px-6 py-3 text-sm font-bold text-pale-canvas transition-colors hover:bg-foudre-pink"
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
