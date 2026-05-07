import React from "react";
import Card from "../Card.jsx/Card";
import { FaFire } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { Eye, Users, MessageSquare, ThumbsUp, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TrendingCard({ items }) {
  const navigate = useNavigate();

  // Destructure API data
  const {
    id,
    name,
    category,
    registrationCount = 0,
    participantCount = 0,
    registrationGrowth = 0,
    participantGrowth = 0,
    commentGrowth = 0,
    reactionGrowth = 0,
    postGrowth = 0,
    capacity = 0,
  } = items;

  // Calculate overall trend percentage (use highest growth metric)
  const maxGrowth = Math.max(
    registrationGrowth,
    participantGrowth,
    commentGrowth,
    reactionGrowth,
    postGrowth
  );
  const trendPercentage = Math.round(maxGrowth);

  const handleViewClick = () => {
    navigate(`/dashboard/event/${id}/overview`);
  };

  return (
    <div className="bg-red-100/50 rounded-xl">
      <Card>
        <div className="flex flex-row gap-4 items-center justify-between ">
          <div className="p-3 bg-red-300/20 rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-7 h-7">
              <FaFire className="text-red-500 w-full h-full object-contain animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex flex-row justify-between items-start">
              <p className="text-sm font-semibold md:text-base line-clamp-2">
                {name}
              </p>
              {trendPercentage > 0 && (
                <div className="bg-red-700 text-white px-2 py-1 rounded-sm flex items-center gap-1 text-xs md:text-sm whitespace-nowrap ml-2">
                  <FaArrowTrendUp />
                  <span>+{trendPercentage}%</span>
                </div>
              )}
            </div>
            <div className="text-xs md:text-sm text-gray-600">
              {category?.name || "Uncategorized"}
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 text-xs md:text-sm mt-1">
              <div className="text-gray-600">
                <div className="flex items-center gap-1 mb-0.5">
                  <Users className="w-3 h-3" />
                  <p className="text-gray-500">Participants</p>
                </div>
                <p className="text-black font-medium">
                  {participantCount}/{capacity || "∞"}
                  {participantGrowth > 0 && (
                    <span className="text-green-600 text-xs ml-1">
                      +{participantGrowth}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-gray-600">
                <div className="flex items-center gap-1 mb-0.5">
                  <FileText className="w-3 h-3" />
                  <p className="text-gray-500">Posts</p>
                </div>
                <p className="text-black font-medium">
                  {postGrowth > 0 ? `+${postGrowth}` : postGrowth}
                </p>
              </div>
              <div className="text-gray-600">
                <div className="flex items-center gap-1 mb-0.5">
                  <ThumbsUp className="w-3 h-3" />
                  <p className="text-gray-500">Reactions</p>
                </div>
                <p className="text-black font-medium">
                  {reactionGrowth > 0 ? `+${reactionGrowth}` : reactionGrowth}
                </p>
              </div>
              <div className="text-gray-600">
                <div className="flex items-center gap-1 mb-0.5">
                  <MessageSquare className="w-3 h-3" />
                  <p className="text-gray-500">Comments</p>
                </div>
                <p className="text-black font-medium">
                  {commentGrowth > 0 ? `+${commentGrowth}` : commentGrowth}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleViewClick}
            className="rounded-xl border-black/20 p-2 bg-white md:ml-10 hover:bg-gray-100 transition cursor-pointer"
          >
            <Eye className="w-5 h-5 text-gray-600 hover:text-gray-800" />
          </button>
        </div>
      </Card>
    </div>
  );
}

export default TrendingCard;
