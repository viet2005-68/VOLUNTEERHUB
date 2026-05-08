// ReactionBar.jsx
import React from "react";
import ReactionButton from "./ReactionButton";
import { FaCommentAlt, FaShare } from "react-icons/fa";
import {
  useCreateReaction,
  useMyReaction,
  useReactions,
} from "../../hook/useCommunity";

const REACTION_ICONS = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

export default function ReactionBar({
  post,
  onReact,
  onCommentClick,
  onShare,
  compact = false,
  commentLength = 0,
  hiddenComment = false,
  eventId,
}) {
  // Fetch current user's reaction

  const { data: myReaction } = useMyReaction(eventId, post?.id);

  // Fetch reaction counts from API
  const { data: reactionCounts } = useReactions(eventId, post?.id);

  // Map ENUM
  const toKeyType = (enumType) => {
    const map = {
      LIKE: "like",
      LOVE: "love",
      HAHA: "haha",
      WOW: "wow",
      SAD: "sad",
      ANGRY: "angry",
    };
    return map[enumType] || null;
  };

  const toEnumType = (key) => {
    const map = {
      like: "LIKE",
      love: "LOVE",
      haha: "HAHA",
      wow: "WOW",
      sad: "SAD",
      angry: "ANGRY",
    };
    return map[key] || "LIKE";
  };

  const currentReactionKey = myReaction?.type
    ? toKeyType(myReaction.type)
    : null;

  // Hook for background API call
  const { mutate: createReaction, isPending } = useCreateReaction(
    eventId,
    post?.id,
    myReaction
  );

  if (!post) return null;

  // Convert ENUM keys to lowercase for display
  const reactionEntries = reactionCounts
    ? Object.entries(reactionCounts)
        .map(([enumKey, count]) => [toKeyType(enumKey), count])
        .filter(([, count]) => count > 0) // Only show reactions with count > 0
    : [];

  return (
    <div className="flex flex-wrap items-center gap-3 text-gray-700">
      <div className="flex flex-row gap-2 items-stretch">
        <ReactionButton
          initialReaction={currentReactionKey}
          onReact={(r) => {
            onReact?.(post.id, r);


            // Skip if mutation is already pending to avoid race condition
            if (isPending) {
              console.log("=== MUTATION PENDING ===");
              console.log(
                "Skipping API call - previous request still in progress"
              );
              console.log("=======================");
              return;
            }

            if (eventId && post?.id) {
              if (r === null) {
                // User wants to remove reaction

                if (currentReactionKey) {
                  const enumType = toEnumType(currentReactionKey);

                  createReaction(enumType);
                }
              } else {
                // User selected a reaction → create/update
                const enumType = toEnumType(r);

                if (currentReactionKey && currentReactionKey !== r) {
                  console.log(
                    "Expected: BE will UPDATE from",
                    currentReactionKey.toUpperCase(),
                    "to",
                    enumType
                  );
                } else if (currentReactionKey === r) {
                  console.log("Expected: BE will TOGGLE OFF (same reaction)");
                }

                createReaction(enumType);
              }
            }
          }}
          small={compact}
        />
        {!compact && reactionEntries.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
            {reactionEntries.map(([key, count]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700"
              >
                <span className="text-lg leading-none">
                  {REACTION_ICONS[key] ?? "👍"}
                </span>
                <span>{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {hiddenComment && (
        <button
          onClick={() => onCommentClick?.(post.id)}
          className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-blue-600 font-semibold`}
        >
          <FaCommentAlt className="w-5 h-5" />
          {commentLength > 0 ? (
            <span>{`Comments (${commentLength})`}</span>
          ) : (
            "Comments"
          )}
        </button>
      )}

      {onShare && (
        <button
          onClick={() => onShare?.(post.id)}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-blue-600 font-semibold"
        >
          <FaShare className="w-5 h-5" />
          <span>{compact ? "" : "Chia sẻ"}</span>
        </button>
      )}
    </div>
  );
}
