import React from "react";
import { formatDateTime } from "../../utils/date";
import { useNavigate } from "react-router-dom";
import {
  FaFire,
  FaUsers,
  FaComments,
  FaThumbsUp,
  FaFileAlt,
  FaArrowUp,
} from "react-icons/fa";
import { Calendar, MapPin, TrendingUp } from "lucide-react";

function TrendingEventCard({
  id,
  name,
  description,
  imageUrl,
  category,
  address,
  startTime,
  endTime,
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
  const availableSlots = capacity - registered;
  const categoryName = category?.name || "N/A";

  const displayImage =
    imageUrl ||
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800";

  const isApproved = status === "APPROVED";

  const getPercentage = (registered, capacity) => {
    return capacity > 0 ? (registered / capacity) * 100 : 0;
  };

  const handleViewDetails = () => {
    navigate(`/opportunities/overview/${id}`);
  };

  return (
    <div className="bg-white text-black flex flex-col font-roboto rounded-2xl font-bold hover:shadow-2xl hover:shadow-red-200/50 duration-300 ease-in-out border border-red-300/30 overflow-hidden group relative">
      {/* Trending Badge */}
      <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-2 shadow-lg animate-pulse">
        <FaFire className="w-4 h-4" />
        <span>TRENDING</span>
      </div>

      {/* Trend Percentage Badge */}
      {trendPercentage > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-red-700 text-white rounded-lg px-3 py-1.5 text-xs font-bold flex items-center gap-1 shadow-lg">
          <TrendingUp className="w-3 h-3" />
          <span>+{trendPercentage}%</span>
        </div>
      )}

      <div className="block w-full aspect-[16/9] overflow-hidden rounded-t-2xl relative pt-0">
        <img
          src={displayImage}
          alt={title}
          className={`${
            !isApproved || registered === capacity ? "grayscale" : ""
          } object-cover w-full h-full group-hover:scale-110 transition-all duration-500 ease-in-out`}
        />
        {categoryName && (
          <p className="absolute bottom-3 right-3 text-white rounded-xl px-3 py-1 text-xs bg-blue-500/90 backdrop-blur-sm capitalize font-semibold">
            {categoryName}
          </p>
        )}
        {!isApproved && (
          <p className="absolute bottom-3 left-3 text-white rounded-xl px-3 py-1 text-xs bg-gray-500/90 backdrop-blur-sm">
            {status}
          </p>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-grow justify-between">
        <div className="text-xl max-sm:text-lg font-bold line-clamp-2 group-hover:text-red-600 transition-colors">
          {title}
        </div>

        <div className="flex flex-row gap-2 items-center text-slate-500">
          <Calendar className="w-4 h-4 text-red-500" />
          <p className="font-normal text-sm">{formatDateTime(date)}</p>
        </div>

        <div className="flex flex-row gap-2 items-center text-slate-500">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              location
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex flex-row gap-2 items-center text-slate-500 hover:text-red-400 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <p className="font-normal text-sm line-clamp-1">{location}</p>
          </a>
        </div>

        {/* Growth Stats */}
        <div className="grid grid-cols-2 gap-2 py-2 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs">
            <FaUsers className="w-3 h-3 text-blue-600" />
            <div>
              <p className="text-gray-500">Participants</p>
              <p className="text-black font-semibold">
                {participantCount}
                {participantGrowth > 0 && (
                  <span className="text-green-600 ml-1">
                    +{participantGrowth}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <FaFileAlt className="w-3 h-3 text-purple-600" />
            <div>
              <p className="text-gray-500">Posts</p>
              <p className="text-black font-semibold">
                {postGrowth > 0 ? `+${postGrowth}` : postGrowth}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <FaThumbsUp className="w-3 h-3 text-pink-600" />
            <div>
              <p className="text-gray-500">Reactions</p>
              <p className="text-black font-semibold">
                {reactionGrowth > 0 ? `+${reactionGrowth}` : reactionGrowth}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <FaComments className="w-3 h-3 text-orange-600" />
            <div>
              <p className="text-gray-500">Comments</p>
              <p className="text-black font-semibold">
                {commentGrowth > 0 ? `+${commentGrowth}` : commentGrowth}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-2 items-center justify-between mb-2 text-slate-400 font-medium text-sm border-t border-gray-200 pt-3">
          <div className="flex flex-row gap-2 items-center justify-center">
            <i className="ri-user-3-line"></i>
            {registered}/{capacity}
          </div>
          <p>Available {availableSlots}</p>
        </div>

        <div className="w-full bg-red-100 rounded-full h-3 mb-4">
          <div
            className={`${
              !isApproved || registered === capacity
                ? "bg-gray-500/80"
                : "bg-gradient-to-r from-red-500 to-orange-500"
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
                ? "cursor-not-allowed bg-gray-500/80"
                : "cursor-pointer bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            } text-white rounded-xl py-2.5 font-bold text-sm transition-all duration-300 ease-in-out hover:scale-105 font-jost border-none active:scale-95 shadow-lg`}
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

export default TrendingEventCard;
