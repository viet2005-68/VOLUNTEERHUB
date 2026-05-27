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
  const embeddedCounts = post?.reactionCounts || post?.reactions;
  const hasEmbeddedCounts =
    embeddedCounts && typeof embeddedCounts === "object";
  const embeddedMyReaction =
    post?.myReaction ||
    (post?.myReactionType ? { type: post.myReactionType } : null);
  const hasEmbeddedMyReaction =
    Object.prototype.hasOwnProperty.call(post || {}, "myReaction") ||
    Object.prototype.hasOwnProperty.call(post || {}, "myReactionType");

  const { data: myReaction } = useMyReaction(eventId, post?.id, {
    initialData: embeddedMyReaction,
    enabled: !hasEmbeddedMyReaction,
  });

  const { data: reactionCounts } = useReactions(eventId, post?.id, undefined, {
    initialData: embeddedCounts,
    enabled: !hasEmbeddedCounts,
  });

  const resolvedMyReaction = hasEmbeddedMyReaction ? embeddedMyReaction : myReaction;
  const resolvedReactionCounts = hasEmbeddedCounts ? embeddedCounts : reactionCounts;

  const currentReactionKey = resolvedMyReaction?.type
    ? toKeyType(resolvedMyReaction.type)
    : null;

  // Hook for background API call
  const { mutate: createReaction, isPending } = useCreateReaction(
    eventId,
    post?.id,
    resolvedMyReaction
  );

  if (!post) return null;

  // Convert ENUM keys to lowercase for display
  const reactionEntries = resolvedReactionCounts
    ? Object.entries(resolvedReactionCounts)
        .map(([enumKey, count]) => [toKeyType(enumKey), count])
        .filter(([, count]) => count > 0) // Only show reactions with count > 0
    : [];

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-deep-forest">
      <div className="flex flex-row gap-3 items-stretch">
        <ReactionButton
          initialReaction={currentReactionKey}
          onReact={(r) => {
            onReact?.(post.id, r);


            // Skip if mutation is already pending to avoid race condition
            if (isPending) {
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
                createReaction(enumType);
              }
            }
          }}
          small={compact}
        />
        {!compact && reactionEntries.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 px-4 py-2 bg-ash-whisper/70 rounded-lg border border-ash-whisper">
            {reactionEntries.map(([key, count]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-deep-forest"
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
          className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-ash-whisper transition-colors text-deep-forest font-bold"
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
          className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-ash-whisper transition-colors text-deep-forest font-bold"
        >
          <FaShare className="w-5 h-5" />
          {!compact && (
            <span>
              {post.shareCount > 0 ? `Chia sẻ (${post.shareCount})` : "Chia sẻ"}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
