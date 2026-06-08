import React from "react";
import { formatDateTime } from "../../utils/date";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  FileText,
  Flame,
  MapPin,
  MessageSquare,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";

function TrendingEventCard({
  id,
  name,
  imageUrl,
  category,
  address,
  startTime,
  capacity,
  registrationCount = 0,
  participantCount = 0,
  registrationGrowth = 0,
  participantGrowth = 0,
  commentGrowth = 0,
  reactionGrowth = 0,
  postGrowth = 0,
  status,
}) {
  const navigate = useNavigate();

  // Calculate overall trend percentage
  const maxGrowth = Math.max(
    registrationGrowth,
    participantGrowth,
    commentGrowth,
    reactionGrowth,
    postGrowth
  );
  const trendPercentage = Math.round(maxGrowth);

  const title = name;
  const date = startTime;
  const location = address
    ? `${address.street}, ${address.district}, ${address.province}`
    : "N/A";
  const registered = participantCount || registrationCount || 0;
  const capacityValue = Number(capacity) || 0;
  const availableSlots = capacityValue
    ? Math.max(capacityValue - registered, 0)
    : "∞";
  const categoryName = category?.name || "N/A";

  const displayImage =
    imageUrl ||
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800";

  const isApproved = status === "APPROVED";
  const isFull = capacityValue > 0 && registered >= capacityValue;

  const getPercentage = (registered, capacity) => {
    if (!capacity || capacity <= 0) return 0;
    return Math.min((registered / capacity) * 100, 100);
  };

  const handleViewDetails = () => {
    navigate(`/opportunities/overview/${id}`);
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border-2 border-ash-whisper bg-pale-canvas text-deep-forest shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-bubblegum-blush hover:shadow-md">
      {/* Trending Badge */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-[10px] bg-deep-forest px-3 py-2 text-xs font-bold text-pale-canvas shadow-sm">
        <Flame className="h-4 w-4" />
        <span>Trending</span>
      </div>

      {/* Trend Percentage Badge */}
      {trendPercentage > 0 && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-[10px] bg-foudre-pink px-3 py-2 text-xs font-bold text-pale-canvas shadow-sm">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>+{trendPercentage}%</span>
        </div>
      )}

      <div className="relative block aspect-[16/10] w-full overflow-hidden bg-ash-whisper">
        <img
          src={displayImage}
          alt={title}
          className={`${
            !isApproved || isFull ? "grayscale" : ""
          } h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105`}
        />
        {categoryName && (
          <p className="absolute bottom-4 right-4 rounded-[10px] bg-ash-whisper px-3 py-2 text-xs font-bold capitalize text-deep-forest shadow-sm">
            {categoryName}
          </p>
        )}
        {!isApproved && (
          <p className="absolute bottom-4 left-4 rounded-[10px] bg-deep-forest/75 px-3 py-2 text-xs font-bold text-pale-canvas backdrop-blur-sm">
            {status}
          </p>
        )}
      </div>

      <div className="flex flex-grow flex-col gap-4 p-5">
        <div className="line-clamp-2 text-xl font-bold leading-[1.08] text-deep-forest transition-colors group-hover:text-foudre-pink max-sm:text-lg">
          {title}
        </div>

        <div className="flex flex-row items-center gap-2 text-sm font-medium text-deep-forest/65">
          <Calendar className="h-4 w-4 shrink-0 text-deep-forest" />
          <p>{formatDateTime(date)}</p>
        </div>

        <div className="flex flex-row items-center gap-2 text-sm font-medium text-deep-forest/65">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              location
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex min-w-0 flex-row items-center gap-2 transition-colors hover:text-foudre-pink"
          >
            <MapPin className="h-4 w-4 shrink-0 text-foudre-pink" />
            <p className="line-clamp-1">{location}</p>
          </a>
        </div>

        {/* Growth Stats */}
        <div className="grid grid-cols-2 gap-3 border-t border-deep-forest/10 pt-4">
          <div className="flex items-center gap-2 rounded-[10px] bg-ash-whisper/60 px-3 py-2 text-xs">
            <Users className="h-4 w-4 shrink-0 text-deep-forest/65" />
            <div>
              <p className="font-bold text-deep-forest/60">Participants</p>
              <p className="font-bold text-deep-forest">
                {participantCount}
                {participantGrowth > 0 && (
                  <span className="ml-1 text-foudre-pink">
                    +{participantGrowth}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-[10px] bg-ash-whisper/60 px-3 py-2 text-xs">
            <FileText className="h-4 w-4 shrink-0 text-deep-forest/65" />
            <div>
              <p className="font-bold text-deep-forest/60">Posts</p>
              <p className="font-bold text-deep-forest">
                {postGrowth > 0 ? `+${postGrowth}` : postGrowth}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-[10px] bg-ash-whisper/60 px-3 py-2 text-xs">
            <ThumbsUp className="h-4 w-4 shrink-0 text-deep-forest/65" />
            <div>
              <p className="font-bold text-deep-forest/60">Reactions</p>
              <p className="font-bold text-deep-forest">
                {reactionGrowth > 0 ? `+${reactionGrowth}` : reactionGrowth}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-[10px] bg-ash-whisper/60 px-3 py-2 text-xs">
            <MessageSquare className="h-4 w-4 shrink-0 text-deep-forest/65" />
            <div>
              <p className="font-bold text-deep-forest/60">Comments</p>
              <p className="font-bold text-deep-forest">
                {commentGrowth > 0 ? `+${commentGrowth}` : commentGrowth}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-2 border-t border-deep-forest/10 pt-4 text-sm font-bold text-deep-forest/55">
          <div className="flex flex-row items-center justify-center gap-2">
            <i className="ri-user-3-line"></i>
            {registered}/{capacityValue || "∞"}
          </div>
          <p>Available {availableSlots}</p>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-ash-whisper">
          <div
            className={`${
              !isApproved || isFull ? "bg-deep-forest/35" : "bg-foudre-pink"
            } h-3 rounded-full transition-all duration-300`}
            style={{
              width: `${getPercentage(registered, capacityValue)}%`,
            }}
          ></div>
        </div>

        <div className="mt-auto w-full">
          <button
            className={`w-full ${
              !isApproved || isFull
                ? "cursor-not-allowed bg-deep-forest/35"
                : "cursor-pointer bg-deep-forest hover:bg-foudre-pink"
            } rounded-[10px] border-none py-3 text-sm font-bold text-pale-canvas shadow-sm transition-colors active:scale-95`}
            onClick={handleViewDetails}
            disabled={!isApproved}
          >
            {!isApproved
              ? status
              : isFull
              ? "Full Slot"
              : "View Details"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrendingEventCard;
