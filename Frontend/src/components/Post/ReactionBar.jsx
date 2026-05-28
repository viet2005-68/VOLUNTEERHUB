// ReactionBar.jsx
import React, { useState } from "react";
import ReactionButton from "./ReactionButton";
import {
  FaCommentAlt,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaLink,
  FaShare,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  useCreateReaction,
  useMyReaction,
  useReactions,
} from "../../hook/useCommunity";
import useClickOutside from "../../hook/ClickOutside";

const REACTION_ICONS = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

const SHARE_TARGETS = [
  { key: "facebook", label: "Facebook", icon: FaFacebookF },
  { key: "instagram", label: "Instagram", icon: FaInstagram },
  { key: "x", label: "X", icon: FaXTwitter },
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedinIn },
  { key: "copy", label: "Copy link", icon: FaLink },
];

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

const getPostShareUrl = (eventId, postId) => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/opportunities/discussion/${eventId}?postId=${postId}`;
};

const getExternalShareUrl = (platform, shareUrl, text) => {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(text || "VolunteerHub");

  const urls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    instagram: "https://www.instagram.com/",
  };

  return urls[platform];
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
  readOnly = false,
}) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useClickOutside(() => setShowShareMenu(false));

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

  const actionButtonClass =
    "inline-flex min-h-[48px] items-center gap-3 rounded-[10px] px-5 py-2.5 font-bold text-deep-forest transition-colors hover:bg-ash-whisper";

  const handleShareOption = (platform) => {
    const shareUrl = getPostShareUrl(eventId, post.id);
    const shareText = post.text?.trim()
      ? post.text.trim().slice(0, 120)
      : "VolunteerHub";

    if (platform !== "copy") {
      const externalUrl = getExternalShareUrl(platform, shareUrl, shareText);
      if (externalUrl) {
        window.open(externalUrl, "_blank", "noopener,noreferrer");
      }
    }

    onShare?.(post.id, { platform, url: shareUrl });
    setShowShareMenu(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-deep-forest">
      <div className="flex flex-row gap-3 items-stretch">
        {!readOnly && (
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
                  // User selected a reaction -> create/update
                  const enumType = toEnumType(r);
                  createReaction(enumType);
                }
              }
            }}
            small={compact}
          />
        )}
        {!compact && reactionEntries.length > 0 && (
          <div className="flex min-h-[48px] flex-wrap items-center gap-2.5 rounded-[10px] border border-ash-whisper bg-ash-whisper/70 px-4 py-2">
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
          className={actionButtonClass}
        >
          <FaCommentAlt className="w-5 h-5" />
          {commentLength > 0 ? (
            <span>{`Comments (${commentLength})`}</span>
          ) : (
            "Comments"
          )}
        </button>
      )}

      {onShare && !readOnly && (
        <div className="relative" ref={shareMenuRef}>
          <button
            type="button"
            onClick={() => setShowShareMenu((open) => !open)}
            className={actionButtonClass}
            aria-haspopup="menu"
            aria-expanded={showShareMenu}
          >
            <FaShare className="w-5 h-5" />
            {!compact && (
              <span>
                {post.shareCount > 0
                  ? `Chia sẻ (${post.shareCount})`
                  : "Chia sẻ"}
              </span>
            )}
          </button>

          {showShareMenu && (
            <div
              role="menu"
              className="absolute left-0 top-[calc(100%+10px)] z-[120] w-[260px] max-w-[calc(100vw-24px)] rounded-[14px] border border-ash-whisper bg-pale-canvas p-2 shadow-2xl sm:left-auto sm:right-0"
            >
              <div className="px-2 pb-2 pt-1 text-xs font-bold uppercase text-deep-forest/55">
                Share to
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SHARE_TARGETS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    role="menuitem"
                    onClick={() => handleShareOption(key)}
                    className="flex min-h-[46px] items-center gap-2 rounded-[10px] px-3 py-2 text-left text-sm font-bold text-deep-forest transition-colors hover:bg-ash-whisper"
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
