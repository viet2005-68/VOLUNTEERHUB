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
}) {
  console.log("CommentItem comment:", comment);
  // Thêm vào đầu component (sau line 15)
  const [showAllReplies, setShowAllReplies] = useState(false);

  const INITIAL_REPLIES_SHOW = 0; // Số replies hiển thị ban đầu
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyToUser, setReplyToUser] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content || "");

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
          isOwnComment ? "bg-blue-50" : "bg-gray-50"
        }`}
      >
        <div className="flex gap-2">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-yellow-400/50 flex items-center justify-center text-white text-xs font-semibold">
              <img
                src={comment.avatarUrl}
                alt={comment.ownerName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Comment content */}
            <div className="bg-gray-100 rounded-2xl px-3 py-2">
              <div className="font-semibold text-sm">
                {comment.ownerName || "Unknown"}
              </div>
              {!isEditing ? (
                <div className="text-sm text-gray-800 break-words">
                  {comment.content}
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="mt-1">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-white rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                    rows={3}
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      disabled={!editText.trim()}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="mt-1 px-3 flex items-center gap-4 text-xs">
              {!isEditing && (
                <button
                  onClick={() => handleReplyClick(comment)}
                  className="text-gray-600 hover:underline font-semibold"
                >
                  Reply
                </button>
              )}
              <span className="text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
              {isOwnComment && !isEditing && (
                <>
                  <button
                    onClick={handleEditStart}
                    className="text-gray-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-gray-600 hover:underline"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>

            {showReplyInput && (
              <form
                onSubmit={handleReplySubmit}
                className="lg:mt-5 mt-2 flex gap-2 items-center relative py-0"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 absolute -left-0 top-2">
                  {(currentUserName && currentUserName[0]) || "?"}
                </div>
                <div className="flex-1 flex gap-2 bg-gray-200 rounded-xl px-2 py-2 pl-8 pr-5 pb-5">
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
                    className="flex-1 px-3 py-2 text-sm focus:outline-none   bg-gray-200 resize-none overflow-auto"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 text-sm font-semibold absolute bottom-2 right-2"
                  >
                    <Send />
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
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-semibold"
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
              depth={depth + 1}
            />
          ))}
          {showAllReplies && hasHiddenReplies && (
            <button
              onClick={() => setShowAllReplies(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-semibold"
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
