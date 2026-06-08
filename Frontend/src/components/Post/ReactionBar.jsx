// ReactionBar.jsx
import React, { useEffect, useState } from "react";
import ReactionButton from "./ReactionButton";
import { Loader2, X } from "lucide-react";
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
  useReactionList,
  useReactions,
} from "../../hook/useCommunity";

const REACTION_ORDER = ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"];

const REACTION_ICONS = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

const REACTION_LABELS = {
  LIKE: "Like",
  LOVE: "Love",
  HAHA: "Haha",
  WOW: "Wow",
  SAD: "Sad",
  ANGRY: "Angry",
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

const displayUserName = (user, fallback) =>
  user?.fullName || user?.username || user?.email || fallback || "Unknown user";

const initialsFor = (name) => {
  const parts = String(name || "?").trim().split(/\s+/).filter(Boolean);
  return (parts.length ? parts : ["?"])
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

function ReactionListDialog({
  open,
  onClose,
  eventId,
  postId,
  counts = {},
  initialType = null,
}) {
  const [selectedType, setSelectedType] = useState(initialType);

  useEffect(() => {
    if (open) {
      setSelectedType(initialType || null);
    }
  }, [initialType, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  const totalCount = REACTION_ORDER.reduce(
    (sum, type) => sum + Number(counts?.[type] || 0),
    0
  );
  const tabs = [
    { type: null, label: "All", count: totalCount },
    ...REACTION_ORDER.filter((type) => Number(counts?.[type] || 0) > 0).map(
      (type) => ({
        type,
        label: REACTION_LABELS[type],
        count: Number(counts[type] || 0),
      })
    ),
  ];

  const { data, isLoading, isFetching } = useReactionList(
    eventId,
    postId,
    { type: selectedType || undefined, pageNum: 0, pageSize: 50 },
    { enabled: open }
  );
  const reactionRows = data?.content || [];

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Post reactions"
      className="fixed inset-0 z-[1000] flex min-h-dvh flex-col bg-pale-canvas text-deep-forest"
    >
      <div className="flex items-center justify-between border-b border-ash-whisper px-5 py-4 sm:px-8">
        <h3 className="text-2xl font-bold leading-tight text-deep-forest sm:text-3xl">
          Reactions
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-ash-whisper bg-pale-canvas text-deep-forest shadow-sm transition-colors hover:bg-ash-whisper"
          aria-label="Close reactions"
          title="Close"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="border-b border-ash-whisper px-5 sm:px-8">
        <div className="flex min-h-[58px] items-end gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = selectedType === tab.type;
            const tabKey = tab.type || "ALL";
            const iconKey = tab.type ? toKeyType(tab.type) : null;

            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => setSelectedType(tab.type)}
                className={`flex min-h-[48px] shrink-0 items-center gap-2 border-b-4 px-3 text-sm font-bold transition-colors ${
                  isActive
                    ? "border-deep-forest text-deep-forest"
                    : "border-transparent text-deep-forest/55 hover:text-deep-forest"
                }`}
              >
                {iconKey && (
                  <span className="text-lg leading-none">
                    {REACTION_ICONS[iconKey]}
                  </span>
                )}
                <span>{tab.label}</span>
                <span>{tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-8">
        {isLoading ? (
          <div className="flex min-h-[220px] items-center justify-center text-deep-forest/60">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : reactionRows.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center text-sm font-semibold text-deep-forest/55">
            No reactions yet
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-[720px] flex-col">
            {reactionRows.map((item) => {
              const reaction = item.reaction || item;
              const owner = item.owner || {};
              const name = displayUserName(owner, reaction.ownerId);
              const iconKey = toKeyType(reaction.type);

              return (
                <div
                  key={reaction.id || `${reaction.ownerId}-${reaction.type}`}
                  className="flex min-h-[72px] items-center gap-3 border-b border-ash-whisper/80 py-3"
                >
                  <div className="relative h-12 w-12 shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-ash-whisper text-sm font-black text-deep-forest">
                      {owner.avatarUrl ? (
                        <img
                          src={owner.avatarUrl}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{initialsFor(name)}</span>
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-pale-canvas text-base leading-none shadow">
                      {REACTION_ICONS[iconKey] || "👍"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-deep-forest">
                      {name}
                    </p>
                    <p className="text-sm font-semibold text-deep-forest/55">
                      {REACTION_LABELS[reaction.type] || reaction.type}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {isFetching && !isLoading && (
          <div className="py-3 text-center text-sm font-semibold text-deep-forest/45">
            Updating...
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [showReactionList, setShowReactionList] = useState(false);
  const [reactionListType, setReactionListType] = useState(null);

  useEffect(() => {
    if (!showShareMenu) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowShareMenu(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showShareMenu]);

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
        .filter(([key, count]) => key && count > 0) // Only show reactions with count > 0
    : [];
  const totalReactionCount = resolvedReactionCounts
    ? REACTION_ORDER.reduce(
        (sum, type) => sum + Number(resolvedReactionCounts[type] || 0),
        0
      )
    : 0;

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

  const openReactionList = (type = null) => {
    setReactionListType(type);
    setShowReactionList(true);
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
          <button
            type="button"
            onClick={() => openReactionList(null)}
            className="flex min-h-[48px] flex-wrap items-center gap-2.5 rounded-[10px] border border-ash-whisper bg-ash-whisper/70 px-4 py-2 text-left transition-colors hover:bg-ash-whisper"
            aria-label={`View ${totalReactionCount} reactions`}
          >
            {reactionEntries.map(([key, count]) => (
              <span
                key={key}
                onClick={(event) => {
                  event.stopPropagation();
                  openReactionList(toEnumType(key));
                }}
                className="inline-flex items-center gap-1.5 rounded-full text-sm font-bold text-deep-forest"
              >
                <span className="text-lg leading-none">
                  {REACTION_ICONS[key] ?? "👍"}
                </span>
                <span>{count}</span>
              </span>
            ))}
          </button>
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
        <div>
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
              role="dialog"
              aria-modal="true"
              aria-label="Share post"
              className="fixed inset-0 z-[1000] flex min-h-dvh flex-col bg-pale-canvas text-deep-forest"
            >
              <div className="flex items-center justify-between border-b border-ash-whisper px-5 py-4 sm:px-8">
                <div>
                  <p className="text-xs font-bold uppercase text-deep-forest/55">
                    Share to
                  </p>
                  <h3 className="mt-1 text-2xl font-bold leading-tight text-deep-forest sm:text-3xl">
                    Chia sẻ bài viết
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShareMenu(false)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-ash-whisper bg-pale-canvas text-deep-forest shadow-sm transition-colors hover:bg-ash-whisper"
                  aria-label="Close share dialog"
                  title="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex flex-1 items-center justify-center overflow-y-auto px-5 py-8 sm:px-8">
                <div className="w-full max-w-[760px]">
                  <div className="mb-6 rounded-[16px] border border-ash-whisper bg-ash-whisper/35 px-4 py-3 text-sm font-semibold leading-relaxed text-deep-forest/70">
                    {post.text?.trim()
                      ? post.text.trim().slice(0, 180)
                      : "VolunteerHub post"}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {SHARE_TARGETS.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleShareOption(key)}
                        className="flex min-h-[72px] items-center gap-4 rounded-[14px] border border-ash-whisper bg-pale-canvas px-5 py-4 text-left text-lg font-bold text-deep-forest shadow-sm transition-colors hover:bg-ash-whisper"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-deep-forest text-pale-canvas">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <ReactionListDialog
        open={showReactionList}
        onClose={() => setShowReactionList(false)}
        eventId={eventId}
        postId={post?.id}
        counts={resolvedReactionCounts}
        initialType={reactionListType}
      />
    </div>
  );
}
