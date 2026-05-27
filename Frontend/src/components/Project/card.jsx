import React from "react";
import { formatDateTime } from "../../utils/date";
import { useNavigate } from "react-router-dom";

function ProjectCard({
  id,
  name,
  description,
  imageUrl,
  category,
  address,
  startTime,
  endTime,
  capacity,
  participantCount,
  status,
  ...restProps // Get all other props
}) {
  const navigate = useNavigate();
  
  // Map API data to component variables
  const title = name;
  const date = startTime;
  const location = address
    ? `${address.street}, ${address.district}, ${address.province}`
    : "N/A";
  const registered = participantCountt || 0;
  const availableSlots = capacity - registered;
  const categoryName = category?.name || "N/A";

  // Use default image if not provided
  const displayImage =
    imageUrl ||
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800";

  // Check if event is approved
  const isApproved = status === "APPROVED";

  const getPercentage = (registered, capacity) => {
    return capacity > 0 ? (registered / capacity) * 100 : 0;
  };

  // Handle navigation with event data
  const handleViewDetails = () => {
    navigate(`/opportunities/overview/${id}`);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-[20px] border border-deep-forest/15 bg-pale-canvas font-clash-grotesk font-bold text-deep-forest transition-colors duration-300 hover:border-foudre-pink/45">
      <div className="block w-full aspect-[16/9] overflow-hidden rounded-t-[20px] relative pt-0">
        <img
          src={displayImage}
          className={`${
            !isApproved || registered === capacity ? "grayscale" : ""
          } object-cover w-full h-full hover:scale-105 transition-all duration-300 ease-in-out`}
        />
        {categoryName && (
          <p className="absolute top-3 right-3 rounded-[10px] bg-foudre-pink px-3 py-2 text-xs font-bold capitalize text-pale-canvas">
            {categoryName}
          </p>
        )}
        {!isApproved && (
          <p className="absolute top-3 left-3 rounded-[10px] bg-deep-forest/80 px-3 py-2 text-xs font-bold text-pale-canvas">
            {status}
          </p>
        )}
      </div>
      <div className="flex flex-grow flex-col justify-between gap-2 p-4">
        <div className="line-clamp-2 text-lg font-bold leading-[1.1] text-deep-forest sm:text-xl">
          {title}
        </div>
        <div className="flex flex-row gap-2 items-center text-deep-forest/60 ">
          <i className="ri-calendar-line"></i>
          <p className="font-normal text-sm">{formatDateTime(date)}</p>
        </div>
        <div className="flex flex-row gap-2 items-center text-deep-forest/60">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              location
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex flex-row gap-2 items-center text-deep-forest/60 hover:text-foudre-pink transition-colors"
          >
            <i class="ri-map-pin-fill"></i>
            <p className="font-normal text-sm">{location}</p>
          </a>
        </div>
        <div className="flex flex-row gap-2 items-center justify-between mb-2 text-deep-forest/50 font-medium text-sm">
          <div className="flex flex-row gap-2 items-center justify-center">
            <i class="ri-user-3-line"></i>
            {registered}/{capacity}
          </div>
          <p>Available {availableSlots}</p>
        </div>
        <div className="mb-5 h-3 w-full rounded-full bg-ash-whisper">
          <div
            className={`${
              !isApproved || registered === capacity
                ? "bg-deep-forest/35"
                : "bg-deep-forest"
            } h-3 rounded-full transition-all duration-300`}
            style={{
              width: `${getPercentage(registered, capacity)}%`,
            }}
          ></div>
        </div>

        <div className="w-full">
          <button
            className={`w-full ${
              !isApproved || registered === capacity
                ? "cursor-not-allowed bg-deep-forest/35"
                : "cursor-pointer bg-deep-forest hover:bg-foudre-pink"
            } rounded-[10px] py-3 text-sm font-bold leading-[1] text-pale-canvas transition-colors duration-200 font-clash-grotesk border-none active:scale-95`}
            onClick={handleViewDetails}
            disabled={!isApproved}
          >
            {!isApproved
              ? status
              : registered === capacity
              ? "Full Slot"
              : "View Details"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
