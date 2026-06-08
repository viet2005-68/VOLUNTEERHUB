import React from "react";
import Card from "../Card.jsx/Card";
import { formatDateTime } from "../../utils/date";
import { FiCalendar } from "react-icons/fi";
import { FiClock } from "react-icons/fi";
import { TfiLocationPin } from "react-icons/tfi";
import { useNavigate } from "react-router-dom";
function UpComingCard({
  id,
  eventId,
  title,
  subtile,
  date,
  starttime,
  endtime,
  location,
  status,
  urlImg = "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=200&fit=crop",
}) {
  const navigate = useNavigate();
  const dateNorm = formatDateTime(date, {
    separator: "-",
    customFormat: "DD{sep}MM{sep}YYYY",
  });
  const startNorm = formatDateTime(starttime, {
    customFormat: "hh:mm A",
    use12Hour: true,
  });
  const endNorm = formatDateTime(endtime, {
    customFormat: "hh:mm A",
    use12Hour: true,
  });
  const startNormClean = startNorm.replace(/\s+/g, " ");
  const endNormClean = endNorm.replace(/\s+/g, " ");

  // Status color mapping for better visual cues
  const statusKey = String(status || "").toUpperCase();
  const statusClassMap = {
    APPROVED: "bg-deep-forest text-pale-canvas",
    PENDING: "border border-foudre-pink/20 bg-ash-whisper text-foudre-pink",
    REJECTED: "border border-foudre-pink/20 bg-foudre-pink/10 text-foudre-pink",
    COMPLETED: "bg-deep-forest text-pale-canvas",
    CONFIRMED: "bg-deep-forest text-pale-canvas",
    VERIFY: "bg-deep-forest text-pale-canvas",
    DEFAULT: "border border-deep-forest/15 bg-ash-whisper text-deep-forest",
  };
  const statusDotClassMap = {
    APPROVED: "bg-deep-forest",
    PENDING: "bg-foudre-pink",
    REJECTED: "bg-foudre-pink",
    COMPLETED: "bg-deep-forest",
    CONFIRMED: "bg-deep-forest",
    VERIFY: "bg-deep-forest",
    DEFAULT: "bg-deep-forest",
  };
  const statusClass = statusClassMap[statusKey] || statusClassMap.DEFAULT;
  const statusDotClass =
    statusDotClassMap[statusKey] || statusDotClassMap.DEFAULT;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/opportunities/overview/${eventId || id}`);
      }}
    >
      <Card className="border-2 border-ash-whisper bg-pale-canvas shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-bubblegum-blush hover:shadow-md">
        <div className="flex justify-between gap-3 p-0">
          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Title with ping indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 shrink-0">
                <span
                  className={`absolute inline-flex h-2 w-2 rounded-full ${statusDotClass} opacity-75 animate-ping`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${statusDotClass}`}
                ></span>
              </span>
              <p className="text-base font-bold leading-[1.15] text-deep-forest line-clamp-2">
                {title}
              </p>
            </div>

            {/* Category pill */}
            {subtile && (
              <span className="inline-flex w-fit max-w-[140px] items-center justify-center truncate rounded-full bg-deep-forest px-2 py-0.5 text-xs font-bold text-pale-canvas">
                {subtile}
              </span>
            )}

            {/* Date and Time */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-deep-forest/70">
              <div className="flex items-center gap-1">
                <FiCalendar className="w-3.5 h-3.5" />
                <span>{dateNorm}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiClock className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">
                  {startNormClean} - {endNormClean}
                </span>
              </div>
            </div>

            {/* Location */}
            {location && (
              <div className="flex items-start gap-1 text-xs font-medium text-deep-forest/70">
                <TfiLocationPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{location}</span>
              </div>
            )}

            {/* Status badge */}
            <div
              className={`${statusClass} w-fit rounded-full px-2.5 py-1 text-xs font-bold`}
            >
              {status}
            </div>
          </div>

          {/* Image */}
          <div className="h-[112px] w-[112px] shrink-0 overflow-hidden rounded-xl border border-ash-whisper shadow-sm">
            <img
              src={urlImg}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default UpComingCard;
