import React, { useState, useRef } from "react";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import ReactionBar from "./ReactionBar";
import useClickOutside from "../../hook/ClickOutside";

export default function PostCard({
  post,
  onOpenPost,
  onReactLocal,
  canEdit,
  postId,
  commentLength,
  hiddenComment,
  onEdit,
  onDelete,
  onShare,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const menuRef = useClickOutside(() => setShowMenu(false));
  const openModal = (options = {}) => onOpenPost(post, options);
  const imageCount = Array.isArray(post.images) ? post.images.length : 0;

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) onEdit(post);
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (onDelete) onDelete(post);
  };

  const renderImageGrid = () => {
    if (!imageCount) return null;

    const baseWrapperClass =
      "relative overflow-hidden rounded-2xl border border-ash-whisper shadow-sm";
    const baseImageClass =
      "w-full object-cover transition-transform duration-200 hover:scale-[1.02] cursor-pointer";

    const renderWrapper = (
      src,
      idx,
      wrapperClass = "",
      imgClass = "h-full"
    ) => (
      <div
        key={`post-image-${idx}`}
        className={`${baseWrapperClass} ${wrapperClass}`}
        onClick={() => openModal({ startImageIndex: idx })}
      >
        <img
          src={src}
          alt=""
          loading="lazy"
          className={`${baseImageClass} ${imgClass}`}
        />
      </div>
    );

    if (imageCount === 1) {
      return (
        <div className="mt-6">
          {renderWrapper(
            post.images[0],
            0,
            "w-full max-h-[520px]",
            "h-auto max-h-[520px]"
          )}
        </div>
      );
    }

    if (imageCount === 2) {
      return (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 max-sm:grid-cols-1">
          {post.images.map((src, idx) =>
            renderWrapper(
              src,
              idx,
              "min-h-[220px] max-sm:min-h-[180px]",
              "h-full"
            )
          )}
        </div>
      );
    }

    if (imageCount === 3) {
      return (
        <div className="mt-6 grid gap-3 grid-cols-2 grid-rows-2">
          {renderWrapper(
            post.images[0],
            0,
            "row-span-2 min-h-[360px] max-sm:min-h-[280px]",
            "h-full"
          )}
          {post.images
            .slice(1)
            .map((src, idx) =>
              renderWrapper(
                src,
                idx + 1,
                "min-h-[150px] max-sm:min-h-[140px]",
                "h-full"
              )
            )}
        </div>
      );
    }

    if (imageCount === 4) {
      return (
        <div className="mt-6 grid gap-3 grid-cols-2 grid-rows-2">
          {post.images
            .slice(0, 4)
            .map((src, idx) =>
              renderWrapper(
                src,
                idx,
                "min-h-[200px] max-sm:min-h-[150px]",
                "h-full"
              )
            )}
        </div>
      );
    }

    const remainingCount = imageCount - 4;

    const renderOverlayTile = (wrapperClass = "", key = "post-image-more") => (
      <div
        key={key}
        className={`${baseWrapperClass} ${wrapperClass} cursor-pointer`}
        onClick={() => openModal({ startImageIndex: 3 })}
      >
        <img
          src={post.images[3]}
          alt=""
          loading="lazy"
          className={`${baseImageClass} h-full brightness-50`}
        />
        <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-semibold tracking-wide bg-black/50">
          +{remainingCount}
        </div>
      </div>
    );

    return (
      <div className="mt-6 space-y-0">
        <div className="hidden sm:grid sm:grid-cols-[1.2fr_0.8fr] sm:gap-3">
          {renderWrapper(
            post.images[0],
            0,
            "min-h-[320px] sm:h-full",
            "h-full"
          )}
          <div className="flex flex-col gap-3">
            {post.images
              .slice(1, 3)
              .map((src, idx) =>
                renderWrapper(src, idx + 1, "min-h-[150px]", "h-full")
              )}
            {renderOverlayTile("min-h-[150px]", "post-image-more-desktop")}
          </div>
        </div>

        <div className="grid gap-3 grid-cols-2 grid-rows-2 sm:hidden">
          {post.images
            .slice(0, 3)
            .map((src, idx) =>
              renderWrapper(src, idx, "min-h-[160px]", "h-full")
            )}
          {renderOverlayTile("min-h-[160px]", "post-image-more-mobile")}
        </div>
      </div>
    );
  };

  return (
    <article className="rounded-[20px] shadow-sm p-6 mb-6 bg-pale-canvas border-2 border-ash-whisper">
      <header className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="w-14 h-14 shrink-0 overflow-hidden rounded-full border-2 border-bubblegum-blush bg-ash-whisper flex items-center justify-center font-bold text-deep-forest text-lg shadow-sm">
            {post.author.avatarUrl && !avatarFailed ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="block h-full w-full object-cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <span>{post.author.name?.charAt(0)?.toUpperCase() || "U"}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-deep-forest text-lg leading-tight truncate">
              {post.author.name}
            </div>
            <div className="text-sm text-deep-forest/60 font-medium">
              {new Date(post.createdAt).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "numeric",
                month: "short",
              })}
            </div>
          </div>
        </div>
        {canEdit && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-ash-whisper transition-colors"
              aria-label="Post options"
            >
              <MoreVertical className="w-5 h-5 text-deep-forest/70" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-pale-canvas rounded-lg shadow-lg border border-ash-whisper py-1 z-10">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-deep-forest hover:bg-ash-whisper flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Post
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <p className="mt-6 text-deep-forest text-base leading-relaxed font-medium">
        {post.text}
      </p>
      {renderImageGrid()}

      <footer className="mt-8 pt-6 border-t border-ash-whisper relative">
        <ReactionBar
          post={post}
          onReact={onReactLocal}
          onCommentClick={() => openModal({ openComments: true })}
          commentLength={commentLength}
          hiddenComment={true}
          eventId={post?.eventId}
          onShare={onShare}
        />
      </footer>
    </article>
  );
}
