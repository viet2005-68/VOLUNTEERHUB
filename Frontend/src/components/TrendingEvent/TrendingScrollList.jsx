import React from "react";
import TrendingCardHorizontal from "./TrendingCardHorizontal";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, FlameKindling } from "lucide-react";
import { useTopTrendingEvents } from "../../hook/useEvent";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "../../utils/date";

export default function TrendingCardList() {
  const navigate = useNavigate();
  const { data, isLoading } = useTopTrendingEvents({
    days: 30,
    pageSize: 5,
  });
  const scrollRef = useRef(null);
  const cardRef = useRef(null);

  const [cardWidth, setCardWidth] = useState(0);

  // Auto calc width of card
  useEffect(() => {
    if (cardRef.current) {
      const styles = window.getComputedStyle(cardRef.current);
      const marginRight = parseInt(styles.marginRight);

      setCardWidth(cardRef.current.offsetWidth + marginRight);
    }
  }, [data]);

  const scrollLeft = () => {
    scrollRef.current.scrollBy({
      left: -cardWidth + 50,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current.scrollBy({
      left: cardWidth - 50,
      behavior: "smooth",
    });
  };

  const trendingEvents = data?.data || [];

  const handleShowMore = () => {
    navigate("/trending");
  };

  // Don't render if loading or no data
  if (isLoading || trendingEvents.length === 0) {
    return null;
  }

  return (
    <div className="w-full rounded-[25px] bg-deep-forest px-5 py-5 text-pale-canvas md:px-6">
      <div className="mb-5 flex flex-col items-start justify-between gap-4 font-clash-grotesk sm:flex-row sm:items-center">
        <div className="flex flex-row gap-3 items-center">
          <div className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-bubblegum-blush text-deep-forest">
            <FlameKindling className="h-[22px] w-[22px] text-deep-forest" />
          </div>
          <div>
            <p className="font-beni text-[40px] font-black uppercase leading-[0.72] text-pale-canvas sm:text-[52px]">
              Trending Events
            </p>
            <p className="mt-1 text-sm font-bold leading-[1.2] text-pale-canvas/80">
              Hottest volunteer opportunities right now
            </p>
          </div>
        </div>
        <button
          onClick={handleShowMore}
          className="cursor-pointer rounded-[10px] bg-bubblegum-blush px-4 py-3 text-sm font-bold text-deep-forest transition hover:bg-pale-canvas active:scale-95 whitespace-nowrap"
        >
          Show more →
        </button>
      </div>

      <div className="relative flex items-center gap-3 rounded-[20px] bg-ash-whisper p-3">
        {/* Left button */}
        <button
          onClick={scrollLeft}
          className="hidden h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-full bg-pale-canvas text-deep-forest transition hover:bg-bubblegum-blush sm:flex"
        >
          <ChevronLeft className="h-[22px] w-[22px]" />
        </button>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex flex-1 snap-x gap-3 overflow-x-auto scroll-smooth no-scrollbar md:gap-4"
        >
          {trendingEvents.map((event, index) => (
            <TrendingCardHorizontal
              key={event.id}
              ref={index === 0 ? cardRef : null}
              id={event.id}
              name={event.name}
              location={
                event.address
                  ? `${event.address.district}, ${event.address.province}`
                  : "N/A"
              }
              date={formatDateTime(event.startTime, { withTime: false })}
              thumbnail={event.imageUrl}
              post={event.postGrowth || 0}
              comment={event.commentGrowth || 0}
            />
          ))}
        </div>

        {/* Right button */}
        <button
          onClick={scrollRight}
          className="hidden h-[44px] w-[44px] flex-shrink-0 items-center justify-center rounded-full bg-pale-canvas text-deep-forest transition hover:bg-bubblegum-blush sm:flex"
        >
          <ChevronRight className="h-[22px] w-[22px]" />
        </button>
      </div>
    </div>
  );
}
