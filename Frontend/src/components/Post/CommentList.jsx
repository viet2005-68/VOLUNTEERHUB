import React from "react";
import CommentItem from "./CommentItem";
import { useAuth } from "../../hook/useAuth";

export default function CommentList({
  comments,
  postId,
  onEditComment,
  onDeleteComment,
  onReplyComment,
  currentUserId,
  currentUserName,
}) {
  // Build nested comment
  const {user} = useAuth();
  console.log("user", user)
  const buildCommentTree = (comments) => {
    const commentMap = {};
    const rootComments = [];

    comments.forEach((comment) => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    // tree parse
    comments.forEach((comment) => {
      if (comment.parentId === null) {
        rootComments.push(commentMap[comment.id]);
      } else if (commentMap[comment.parentId]) {
        commentMap[comment.parentId].replies.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const commentTree = buildCommentTree(comments);

  if (comments.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-8">
        No comments yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-20">
      {commentTree.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          onEdit={onEditComment}
          onDelete={onDeleteComment}
          onReply={onReplyComment}
          replies={comment.replies}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          depth={0}
        />
      ))}
    </div>
  );
}
