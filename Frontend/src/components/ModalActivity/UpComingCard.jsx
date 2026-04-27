import React from "react";
import Card from "../Card/Card";
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
    APPROVED: "bg-green-600 text-white",
    PENDING: "bg-yellow-200 text-yellow-800",
    REJECTED: "bg-red-100 text-red-800",
    COMPLETED: "bg-blue-600 text-white",
    CONFIRMED: "bg-gray-900 text-white",
    VERIFY: "bg-gray-900 text-white",
    DEFAULT: "bg-gray-200 text-gray-800",
  };
  const statusClass = statusClassMap[statusKey] || statusClassMap.DEFAULT;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/opportunities/overview/${eventId || id}`);
      }}
    >
      <Card>
        <div className="flex justify-between gap-3 p-0">
          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Title with ping indicator */}
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 shrink-0">
                <span
                  className={`absolute inline-flex h-2 w-2 rounded-full ${statusClass} opacity-75 animate-ping`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${statusClass}`}
                ></span>
              </span>
              <p className="font-semibold text-gray-900 text-base line-clamp-2">
                {title}
              </p>
            </div>

            {/* Category pill */}
            {subtile && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-gray-900 text-white rounded-full w-fit max-w-[140px] truncate">
                {subtile}
              </span>
            )}

            {/* Date and Time */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
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
              <div className="flex items-start gap-1 text-xs text-gray-600">
                <TfiLocationPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{location}</span>
              </div>
            )}

            {/* Status badge */}
            <div
              className={`${statusClass} w-fit rounded-full px-2.5 py-1 text-xs font-medium`}
            >
              {status}
            </div>
          </div>

          {/* Image */}
          <div className="shrink-0 w-28 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
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
