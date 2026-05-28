import React from "react";
import Card from "../Card.jsx/Card";
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
    imageUrl,
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

  const fallbackInitial = name?.charAt(0)?.toUpperCase() || "E";

  return (
    <div className="rounded-2xl">
      <Card className="group border-2 border-ash-whisper bg-pale-canvas shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-bubblegum-blush hover:shadow-md">
        <div className="grid items-center gap-4 md:grid-cols-[112px_minmax(0,1fr)_56px]">
          <div className="h-[80px] w-full overflow-hidden rounded-2xl border border-ash-whisper bg-ash-whisper max-md:h-[160px]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={name}
                className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-ash-whisper text-xl font-bold text-deep-forest">
                {fallbackInitial}
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-row justify-between gap-3 items-start">
              <div className="min-w-0">
                <p className="text-base font-bold leading-[1.15] text-deep-forest line-clamp-2">
                  {name}
                </p>
                <div className="mt-1 text-sm font-bold leading-[1.15] text-deep-forest/60">
                  {category?.name || "Uncategorized"}
                </div>
              </div>
              {trendPercentage > 0 && (
                <div className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-deep-forest px-3 py-1.5 text-xs font-bold text-pale-canvas shadow-sm">
                  <FaArrowTrendUp />
                  <span>+{trendPercentage}%</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4 mt-1">
              <div className="min-w-0 rounded-xl bg-ash-whisper/70 px-3 py-2 text-deep-forest">
                <div className="flex items-center gap-1.5 mb-1 text-deep-forest/65">
                  <Users className="h-3.5 w-3.5" />
                  <p className="truncate">Participants</p>
                </div>
                <p className="text-deep-forest font-bold">
                  {participantCount}/{capacity || "∞"}
                  {participantGrowth > 0 && (
                    <span className="text-emerald-600 text-xs ml-1">
                      +{participantGrowth}
                    </span>
                  )}
                </p>
              </div>
              <div className="min-w-0 rounded-xl bg-ash-whisper/70 px-3 py-2 text-deep-forest">
                <div className="flex items-center gap-1.5 mb-1 text-deep-forest/65">
                  <FileText className="h-3.5 w-3.5" />
                  <p className="truncate">Posts</p>
                </div>
                <p className="text-deep-forest font-bold">
                  {postGrowth > 0 ? `+${postGrowth}` : postGrowth}
                </p>
              </div>
              <div className="min-w-0 rounded-xl bg-ash-whisper/70 px-3 py-2 text-deep-forest">
                <div className="flex items-center gap-1.5 mb-1 text-deep-forest/65">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <p className="truncate">Reactions</p>
                </div>
                <p className="text-deep-forest font-bold">
                  {reactionGrowth > 0 ? `+${reactionGrowth}` : reactionGrowth}
                </p>
              </div>
              <div className="min-w-0 rounded-xl bg-ash-whisper/70 px-3 py-2 text-deep-forest">
                <div className="flex items-center gap-1.5 mb-1 text-deep-forest/65">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <p className="truncate">Comments</p>
                </div>
                <p className="text-deep-forest font-bold">
                  {commentGrowth > 0 ? `+${commentGrowth}` : commentGrowth}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleViewClick}
            className="flex h-[56px] w-[56px] items-center justify-center rounded-xl border border-ash-whisper bg-ash-whisper/70 hover:bg-bubblegum-blush transition cursor-pointer max-md:justify-self-end"
            aria-label={`View ${name}`}
          >
            <Eye className="w-5 h-5 text-deep-forest" />
          </button>
        </div>
      </Card>
    </div>
  );
}

export default TrendingCard;
