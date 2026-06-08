import { Send } from "lucide-react";
import React, { useState } from "react";

export default function CommentItem({
  comment,
  postId,
  onEdit,
  onDelete,
  onReply,
  replies = [],
  currentUserId = "10",
  currentUserName = "You",
  depth = 0,
  readOnly = false,
}) {
  // Thêm vào đầu component (sau line 15)
  const [showAllReplies, setShowAllReplies] = useState(false);

  const INITIAL_REPLIES_SHOW = 0; // Số replies hiển thị ban đầu
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyToUser, setReplyToUser] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content || "");
  const [avatarFailed, setAvatarFailed] = useState(false);

  // Check if this comment belongs to current user
  const isOwnComment = String(comment.ownerId) === String(currentUserId);
  const hasReplies = replies.length > 0;
  const isReply = depth > 0; // If depth > 0, this is a reply

  const visibleReplies = showAllReplies
    ? replies
    : replies.slice(0, INITIAL_REPLIES_SHOW);

  const hiddenRepliesCount = replies.length;
  const hasHiddenReplies = hiddenRepliesCount > 0;

  const handleEditStart = () => {
    setIsEditing(true);
    setEditText(comment.content || "");
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    onEdit(postId, comment.id, editText.trim());
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditText(comment.content || "");
  };

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      onDelete(postId, comment.id);
    }
  };

  const handleReplyClick = (targetComment) => {
    setShowReplyInput(true);
    setReplyToUser({
      id: targetComment.ownerId,
      name: targetComment.ownerName || String(targetComment.ownerId),
    });
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    // Always use the root comment's ID as parentId
    // If this is already a reply (depth > 0), find the root parent
    const rootParentId = isReply ? comment.parentId || comment.id : comment.id;

    // Add mention if replying to a reply
    const content = replyToUser
      ? `@${replyToUser.name} ${replyText}`
      : replyText;

    const newReply = {
      id: Date.now(),
      ownerId: currentUserId,
      postId: postId,
      parentId: rootParentId,
      content: content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replyToUserId: replyToUser ? replyToUser.id : null,
    };

    onReply(postId, newReply);
    setReplyText("");
    setShowReplyInput(false);
    setReplyToUser(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className={`${isReply ? "ml-8 mt-2" : ""}`}>
      <div
        className={`p-3 rounded-lg ${
          isOwnComment ? "bg-ash-whisper/70" : "bg-pale-canvas"
        }`}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div
              className={`overflow-hidden rounded-full bg-ash-whisper border-2 border-bubblegum-blush flex items-center justify-center text-deep-forest font-semibold ${
                isReply
                  ? "h-[38px] w-[38px] text-sm"
                  : "h-[46px] w-[46px] text-base"
              }`}
            >
              {comment.avatarUrl && !avatarFailed ? (
                <img
                  src={comment.avatarUrl}
                  alt={comment.ownerName}
                  className="block h-full w-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <span>{comment.ownerName?.charAt(0)?.toUpperCase() || "U"}</span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Comment content */}
            <div className="bg-ash-whisper/70 rounded-2xl px-3 py-2">
              <div className="font-semibold text-sm text-deep-forest">
                {comment.ownerName || "Unknown"}
              </div>
              {!isEditing ? (
                <div className="text-sm text-deep-forest break-words">
                  {comment.content}
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="mt-1">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-pale-canvas rounded-md border border-ash-whisper px-3 py-2 text-sm text-deep-forest outline-none focus:ring-2 focus:ring-bubblegum-blush"
                    rows={3}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1 text-sm rounded-md bg-deep-forest text-white hover:bg-foudre-pink"
                      disabled={!editText.trim()}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm rounded-md bg-ash-whisper text-deep-forest hover:bg-bubblegum-blush/40"
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="mt-1 px-3 flex items-center gap-4 text-xs">
              {!readOnly && !isEditing && (
                <button
                  onClick={() => handleReplyClick(comment)}
                  className="text-deep-forest/70 hover:text-deep-forest hover:underline font-semibold"
                >
                  Reply
                </button>
              )}
              <span className="text-deep-forest/55">
                {formatDate(comment.createdAt)}
              </span>
              {!readOnly && isOwnComment && !isEditing && (
                <>
                  <button
                    onClick={handleEditStart}
                    className="text-deep-forest/70 hover:text-deep-forest hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-deep-forest/70 hover:text-deep-forest hover:underline"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>

            {showReplyInput && (
              <form
                onSubmit={handleReplySubmit}
                className="mt-3 flex items-start gap-3"
              >
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-deep-forest text-sm font-semibold text-pale-canvas">
                  {(currentUserName && currentUserName[0]) || "?"}
                </div>
                <div className="flex min-w-0 flex-1 items-end gap-2 rounded-2xl border border-ash-whisper bg-ash-whisper/55 px-4 py-2">
                  <textarea
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onInput={(e) => {
                      const el = e.target;
                      el.style.height = "auto";
                      el.style.height = el.scrollHeight + "px";
                    }}
                    placeholder={
                      replyToUser
                        ? `Reply to ${replyToUser.name}...`
                        : "Write a reply..."
                    }
                    className="min-h-[36px] max-h-[120px] flex-1 resize-none overflow-auto bg-transparent px-0 py-2 text-sm leading-5 text-deep-forest placeholder:text-deep-forest/45"
                    style={{
                      outline: "none",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-deep-forest text-pale-canvas transition-colors hover:bg-foudre-pink disabled:bg-deep-forest/25 disabled:text-pale-canvas"
                    aria-label="Send reply"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {!isReply && hasReplies && (
        <div className="mt-1">
          {!showAllReplies && hasHiddenReplies && (
            <button
              onClick={() => setShowAllReplies(true)}
              className="flex items-center gap-2 text-sm text-deep-forest/60 hover:text-deep-forest font-semibold"
            >
              <span className="text-lg">⤷</span>
              <span>View more {hiddenRepliesCount}</span>
            </button>
          )}
          {visibleReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={(postId, newReply) => onReply(postId, newReply)}
              replies={[]}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              readOnly={readOnly}
              depth={depth + 1}
            />
          ))}
          {showAllReplies && hasHiddenReplies && (
            <button
              onClick={() => setShowAllReplies(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-deep-forest/70 hover:text-deep-forest font-semibold"
            >
              <span className="text-lg">⤴</span>
              <span>Hide replies</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
