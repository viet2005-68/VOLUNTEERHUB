import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import CommentInput from "./CommentInput";
import CommentList from "./CommentList";
import ImageLightbox from "./ImageLightbox";
import ReactionBar from "./ReactionBar";
import { X } from "lucide-react";
import { IoMdArrowRoundBack } from "react-icons/io";
import {
  useComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "../../hook/useCommunity";
import { useAuth } from "../../hook/useAuth";

export default function PostModal({
  open,
  post,
  initialOpenComments = false,
  onClose,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onReact,
  onShare,
  startImageIndex,
  postId,
  eventId,
  readOnly = false,
}) {
  const [text, setText] = useState("");
  const [avatarFailed, setAvatarFailed] = useState(false);

  const commentsRef = useRef(null);
  const inputRef = useRef(null);
  const [lightboxIndex, setLightboxIndex] = useState(startImageIndex ?? 0);
  const [showMore, setShowMore] = useState(false);
  const { user } = useAuth();
  const toggleShowMore = () => {
    setShowMore(!showMore);
  };
  const focusComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  };

  // Fetch comments from API and normalize
  const { data: comments = [], isLoading: isLoadingComments } = useComments(
    eventId,
    postId
  );
  const { mutate: createComment } = useCreateComment(eventId, postId);
  const { mutate: deleteComment } = useDeleteComment(eventId, postId);
  const { mutate: updateComment } = useUpdateComment(eventId, postId);

  useEffect(() => {
    if (open) {
      setLightboxIndex(startImageIndex ?? 0);
      setAvatarFailed(false);
    }
  }, [startImageIndex, open]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  useEffect(() => {
    if (open && initialOpenComments) {
      setTimeout(() => {
        commentsRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, initialOpenComments]);

  if (!post) return null;

  function submit(e) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    createComment(
      { content, parentId: null },
      {
        onSuccess: () => setText(""),
      }
    );
  }

  const handleAddReply = (pid, newReply) => {
    createComment({ content: newReply.content, parentId: newReply.parentId });
  };

  const handleEditComment = (pid, commentId, newContent) => {
    const content = (newContent || "").trim();
    if (!content) return;
    const target = comments.find((c) => c.id === commentId);
    const parentId = target?.parentId ?? null;
    updateComment({ commentId, content, parentId });
  };

  const handleDeleteComment = (pid, commentId) => {
    deleteComment(commentId);
  };

  return (
    <div className="min-w-[95vw] min-h-[95vh] max-md:min-w-[100vw] max-md:min-h-[100vh] max-sm:flex max-sm:justify-start relative">
      <Modal open={true} onClose={onClose}>
        <div className="flex flex-col md:grid md:grid-cols-8 w-full h-full gap-1 md:overflow-hidden max-md:gap-0 max-md:px-1 max-md:overflow-y-auto">
          <div className="md:col-span-6 order-1 flex justify-center items-center bg-black md:rounded-l-lg">
            <div className="w-full h-full max-sm:hidden">
              <ImageLightbox
                images={post.images}
                onIndexChange={(i) => setLightboxIndex(i)}
                startIndex={lightboxIndex}
                currentIndex={lightboxIndex}
                className=""
              />
            </div>
          </div>
          <div className="md:col-span-2 order-2 flex flex-col bg-pale-canvas md:rounded-r-lg md:overflow-hidden relative">
            {/* Close button  */}
            <button
              type="button"
              aria-label="Close"
              title="Close"
              onClick={onClose}
              className="max-sm:hidden absolute top-3 right-3 p-2 rounded-full border border-ash-whisper bg-pale-canvas/90 text-deep-forest hover:bg-ash-whisper shadow-md transition-colors duration-150"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="md:flex-1 md:overflow-y-auto px-6 py-4 pr-4 max-sm:pr-1 max-md:px-3 max-md:py-0 max-md:pb-24">
              <div className="flex flex-col gap-2 lg:mt-10 max-md:mt-4">
                <div
                  className="flex justify-start items-center p-0 border-b-1 border-ash-whisper pb-2 lg:hidden"
                  onClick={onClose}
                >
                  <IoMdArrowRoundBack className="text-white bg-black rounded-full p-0 h-5 w-5" />
                </div>
                <div className="flex items-center gap-2 flex-row">
                  <div className="flex items-center gap-2 flex-row">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-bubblegum-blush bg-ash-whisper flex items-center justify-center text-deep-forest font-bold">
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
                  </div>
                  <div className="text-lg font-bold text-deep-forest">
                    <p>{post.author.name}</p>
                    <p className="text-xs font-medium text-deep-forest/60">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="max-sm:flex align-middle justify-center hidden max-sm:bg-black">
                  <ImageLightbox
                    images={post.images}
                    startIndex={lightboxIndex}
                    className=""
                    onIndexChange={(i) => setLightboxIndex(i)}
                  />
                </div>
                <div className="">
                  <p
                    className={`text-start line-clamp-5 max-sm:text-sm max-sm:pt-4 ${
                      showMore ? "line-clamp-none" : ""
                    }`}
                  >
                    {post.text}
                  </p>
                  <span
                    className="text-foudre-pink font-bold cursor-pointer"
                    onClick={toggleShowMore}
                  >
                    {showMore ? "Show less" : "Show more"}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <ReactionBar
                  post={post}
                  onReact={onReact}
                  onShare={onShare}
                  onCommentClick={focusComments}
                  commentLength={comments.length}
                  eventId={eventId}
                  readOnly={readOnly}
                />
              </div>

              <div ref={commentsRef} className="flex-1 flex-col flex px-0 py-4">
                <h4 className="font-semibold mb-4">
                  Comments ({comments.length})
                </h4>
                {isLoadingComments ? (
                  <div className="text-sm text-deep-forest/60">
                    ...Loading comments
                  </div>
                ) : (
                  <CommentList
                    comments={comments}
                    postId={post.id}
                    onEditComment={handleEditComment}
                    onDeleteComment={handleDeleteComment}
                    onReplyComment={handleAddReply}
                    currentUserId={user?.id}
                    currentUserName={
                      user?.name || user?.fullName || user?.username || "You"
                    }
                    readOnly={readOnly}
                  />
                )}
              </div>
            </div>
            {!readOnly && (
              <div className="border-t border-ash-whisper bg-pale-canvas md:sticky md:-bottom-4 md:px-0 max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:z-50">
                <CommentInput
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onSubmit={submit}
                  inputRef={inputRef}
                />
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* <ImageLightbox
        images={post.images}
        open={lightboxOpen}
        startIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      /> */}
    </div>
  );
}
