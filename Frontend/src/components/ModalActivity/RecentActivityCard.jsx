import React from "react";
import Card from "../Card.jsx/Card";
import { FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import { ClockArrowDown, CircleCheckBig } from "lucide-react";

function RecentActivityCard({
  id,
  title,
  date,
  duration,
  status,
  imageUrl,
  category,
  location,
  icon,
}) {
  const statusIcon =
    status.toLowerCase() === "pending" ? (
      <ClockArrowDown className="text-yellow-400 size-5" />
    ) : (
      <CircleCheckBig className="text-green-500 size-5" />
    );
  const colorStatus =
    status.toLowerCase() === "pending"
      ? "bg-gray-200 text-black"
      : "bg-green-500 text-white";

  // Category badge styling
  const categoryColors = {
    environment: "bg-green-100 text-green-700",
    education: "bg-blue-100 text-blue-700",
    health: "bg-red-100 text-red-700",
    community: "bg-purple-100 text-purple-700",
    default: "bg-gray-100 text-gray-700",
  };

  const categoryColor =
    categoryColors[category?.toLowerCase()] || categoryColors.default;

  return (
    <div>
      <Card>
        <div className="flex items-start gap-4 p-4">
          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">

            <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
              {title}
            </h3>

            {/* Category Badge */}
            {category && (
              <span
                className={`inline-block px-3 py-1 rounded-md text-xs font-medium ${categoryColor}`}
              >
                {category}
              </span>
            )}

            {/* Date and Duration */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <FiCalendar className="w-4 h-4 flex-shrink-0" />
                <span>{date}</span>
              </div>
              {duration && (
                <div className="flex items-center gap-1.5">
                  <FiClock className="w-4 h-4 flex-shrink-0" />
                  <span>{duration}</span>
                </div>
              )}
            </div>

            {/* Location */}
            {location && (
              <div className="flex items-start gap-1.5 text-sm text-gray-600">
                <FiMapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-1">{location}</span>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-2">
              <span
                className={`${colorStatus} px-3 py-1.5 rounded-md text-xs font-semibold uppercase`}
              >
                {status}
              </span>
              {statusIcon}
            </div>
          </div>

          {/* Image */}
          {imageUrl && (
            <div className="flex-shrink-0">
              <img
                src={imageUrl}
                alt={title}
                className="w-32 h-32 object-cover rounded-xl"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/150?text=No+Image";
                }}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default RecentActivityCard;
