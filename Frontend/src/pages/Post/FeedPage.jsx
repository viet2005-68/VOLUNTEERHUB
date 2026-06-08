import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import CreatePost from "../../components/Post/CreatPost";
import PostCard from "../../components/Post/PostCard";
import PostModal from "../../components/Post/PostModal";
import EditPostModal from "../../components/Post/EditPostModal";
import "../../index.css";
import {
  useInfinitePosts,
  useDeletePost,
  useSharePost,
} from "../../hook/useCommunity";
import { useNavbar } from "../../hook/useNavbar";
import { useAuth } from "../../hook/useAuth";
import { ROLES } from "../../constant/role";
import toast from "react-hot-toast";

/**
 * FeedPage: danh sách bài viết với infinite scroll 
 * - Bài viết mới tạo sẽ hiển thị ở đầu danh sách
 ư
 */
export default function FeedPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const { setShowNavbar } = useNavbar();
  const currentUser = { name: "Bạn" };
  const isAdmin = user?.role === ROLES.ADMIN;

  const [posts, setPosts] = useState([]);
  const [activePost, setActivePost] = useState(null);
  const [modalOptions, setModalOptions] = useState({
    startImageIndex: 0,
    openComments: false,
  });
  const [hiddenComment, setHiddenComment] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfinitePosts(id, {
    pageSize: 3,
    initialPageNum: 0,
    zeroBased: false,
  });

  // Delete mutation
  const { mutate: deletePost } = useDeletePost(id, showDeleteConfirm?.id);
  const { mutate: sharePost } = useSharePost(id);

  // Map dữ liệu API
  const normalizeReactionCounts = (counts = {}) => ({
    LIKE: Number(counts.LIKE || 0),
    LOVE: Number(counts.LOVE || 0),
    HAHA: Number(counts.HAHA || 0),
    WOW: Number(counts.WOW || 0),
    SAD: Number(counts.SAD || 0),
    ANGRY: Number(counts.ANGRY || 0),
  });

  const reactionEnumToKey = (type) => {
    const map = {
      LIKE: "like",
      LOVE: "love",
      HAHA: "haha",
      WOW: "wow",
      SAD: "sad",
      ANGRY: "angry",
    };
    return map[type] || null;
  };

  const reactionKeyToEnum = (type) => {
    const map = {
      like: "LIKE",
      love: "LOVE",
      haha: "HAHA",
      wow: "WOW",
      sad: "SAD",
      angry: "ANGRY",
    };
    return map[type] || null;
  };

  const mapApiPost = (p) => {
    const myReactionType = p?.myReactionType || p?.myReaction?.type || null;
    const reactionCounts = normalizeReactionCounts(p?.reactionCounts);

    return {
      id: p?.id,
      eventId: id, // Add eventId from URL params
      author: {
        name: p?.owner?.fullName ?? "Unknown",
        avatarUrl: p?.owner?.avatarUrl,
      },
      text: p?.content ?? "",
      images: Array.isArray(p?.imageUrls) ? p.imageUrls : [],
      createdAt: p?.createdAt,
      comments: [],
      commentCount: Number(p?.commentCount || 0),
      reactionCount: Number(p?.reactionCount || 0),
      reactionCounts,
      reactions: reactionCounts,
      myReaction: p?.myReaction || null,
      myReactionType,
      userReaction: reactionEnumToKey(myReactionType),
      shareCount: Number(p?.shareCount || 0),
      ownerId: p?.owner?.id,
    };
  };

  useEffect(() => {
    if (!data) return;
    const mapped = data.pages.flatMap((page) =>
      Array.isArray(page?.content) ? page.content.map(mapApiPost) : []
    );
    setPosts((prev) => {
      const created = prev.filter((p) => p._localCreated);
      return [...created, ...mapped];
    });
  }, [data]);

  // Tạo bài viết mới
  const handleCreate = (newPost) => {
    const created = mapApiPost({
      ...newPost,
      owner: newPost?.owner ?? {
        id: user?.id,
        fullName: user?.fullName || user?.name || user?.username || currentUser.name,
        avatarUrl: user?.avatarUrl,
      },
      imageUrls: newPost?.imageUrls ?? newPost?.images ?? [],
      createdAt: newPost?.createdAt ?? new Date().toISOString(),
    });
    setPosts((prev) => [{ ...created, _localCreated: true }, ...prev]);
  };

  // Modal handlers
  const openPost = (post, options = {}) => {
    setShowNavbar(false);
    setActivePost(post);
    setModalOptions({
      startImageIndex: options.startImageIndex ?? 0,
      openComments: Boolean(options.openComments),
    });
    setHiddenComment(true);
  };
  const closePost = () => {
    setShowNavbar(true);
    setActivePost(null);
    setModalOptions({ startImageIndex: 0, openComments: false });
  };

  // Edit handler
  const handleEditPost = (post) => {
    setEditingPost(post);
  };

  // Delete handler
  const handleDeletePost = (post) => {
    setShowDeleteConfirm(post);
  };

  const confirmDelete = () => {
    if (!showDeleteConfirm) return;
    deletePost(undefined, {
      onSuccess: () => {
        toast.success("Post deleted successfully");
        setShowDeleteConfirm(null);
        refetch();
      },
      onError: () => {
        toast.error("Failed to delete post");
      },
    });
  };

  // Local comment ops (UI-only)
  const addComment = (postId, comment) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const existing = Array.isArray(p.comments) ? p.comments : [];
        return { ...p, comments: [...existing, comment] };
      })
    );
    setActivePost((ap) => {
      if (!ap || ap.id !== postId) return ap;
      const existing = Array.isArray(ap.comments) ? ap.comments : [];
      return { ...ap, comments: [...existing, comment] };
    });
  };
  const editComment = (postId, commentId, newContent) => {
    const now = new Date().toISOString();
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: (p.comments || []).map((c) =>
                c.id === commentId
                  ? { ...c, content: newContent, updatedAt: now }
                  : c
              ),
            }
          : p
      )
    );
    setActivePost((ap) => {
      if (!ap || ap.id !== postId) return ap;
      const existing = Array.isArray(ap.comments) ? ap.comments : [];
      const updated = existing.map((c) =>
        c.id === commentId ? { ...c, content: newContent, updatedAt: now } : c
      );
      return { ...ap, comments: updated };
    });
  };
  const deleteComment = (postId, commentId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const existing = Array.isArray(p.comments) ? p.comments : [];
        return { ...p, comments: existing.filter((c) => c.id !== commentId) };
      })
    );
    setActivePost((ap) => {
      if (!ap || ap.id !== postId) return ap;
      const existing = Array.isArray(ap.comments) ? ap.comments : [];
      return { ...ap, comments: existing.filter((c) => c.id !== commentId) };
    });
  };

  const handleShare = (postId, options = {}) => {
    if (isAdmin) return;
    const shareUrl =
      options.url ||
      `${window.location.origin}/opportunities/discussion/${id}?postId=${postId}`;
    const platformLabel = {
      copy: "Post link copied.",
      instagram: "Post link copied for Instagram.",
    };

    if (options.platform === "copy" || options.platform === "instagram") {
      navigator.clipboard
        ?.writeText(shareUrl)
        .then(() => toast.success(platformLabel[options.platform]))
        .catch(() => toast.error("Can't copy post link."));
    }

    sharePost(postId, {
      onSuccess: (updatedPost) => {
        const nextShareCount = Number(updatedPost?.shareCount || 0);
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  shareCount: nextShareCount || Number(post.shareCount || 0) + 1,
                }
              : post
          )
        );
        setActivePost((post) =>
          post?.id === postId
            ? {
                ...post,
                shareCount: nextShareCount || Number(post.shareCount || 0) + 1,
              }
            : post
        );
      },
    });
  };

  // Local reactions (UI-only)
  const applyLocalReaction = (post, type) => {
    const previousKey = post.userReaction || reactionEnumToKey(post.myReactionType);
    const alreadySelected = previousKey === type;
    const nextKey = alreadySelected ? null : type;
    const nextCounts = normalizeReactionCounts(post.reactionCounts || post.reactions);

    if (previousKey) {
      const previousEnum = reactionKeyToEnum(previousKey);
      if (previousEnum) {
        nextCounts[previousEnum] = Math.max(0, Number(nextCounts[previousEnum] || 0) - 1);
      }
    }

    if (nextKey) {
      const nextEnum = reactionKeyToEnum(nextKey);
      if (nextEnum) {
        nextCounts[nextEnum] = Number(nextCounts[nextEnum] || 0) + 1;
      }
    }

    const nextEnumType = nextKey ? reactionKeyToEnum(nextKey) : null;

    return {
      ...post,
      reactions: nextCounts,
      reactionCounts: nextCounts,
      userReaction: nextKey,
      myReactionType: nextEnumType,
      myReaction: nextEnumType
        ? { ...(post.myReaction || {}), type: nextEnumType }
        : null,
    };
  };

  const reactTo = (postId, type) => {
    if (isAdmin) return;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? applyLocalReaction(p, type) : p))
    );

    // also update activePost if it's the same
    setActivePost((ap) => {
      if (!ap || ap.id !== postId) return ap;
      return applyLocalReaction(ap, type);
    });
  };

  // Virtuoso data & callbacks
  const items = posts;
  const loadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };
  const Footer = () => (
    <div className="py-4 text-center text-sm font-semibold text-deep-forest/60">
      {isFetchingNextPage
        ? "Loading..."
        : hasNextPage
        ? "Scroll to load more..."
        : items.length > 0
        ? "No more posts"
        : null}
    </div>
  );

  return (
    <div className="min-h-screen py-4">
      <div className="max-w-3xl mx-auto mb-6 px-2 sm:px-0 mt-2 sm:mt-4 space-y-4">
        {!isAdmin && (
          <CreatePost
            onCreate={(p) =>
              handleCreate({
                ...p,
                author: { name: currentUser.name },
                createdAt: new Date().toISOString(),
              })
            }
            eventId={id}
          />
        )}

        {status === "loading" && (
          <div className="text-center text-deep-forest/60 mt-4">Loading...</div>
        )}
        {status === "error" && (
          <div className="text-center text-foudre-pink mt-4">Can't load posts.</div>
        )}

        <Virtuoso
          useWindowScroll
          data={items}
          endReached={loadMore}
          itemContent={(index, post) => (
            <PostCard
              key={`${post.id ?? "local"}-${index}`}
              post={post}
              onOpenPost={openPost}
              onReactLocal={reactTo}
              canEdit={!isAdmin && post?.ownerId === user?.id}
              postId={post.id}
              hiddenComment={hiddenComment}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onShare={isAdmin ? undefined : handleShare}
              commentLength={post.commentCount ?? post.comments?.length ?? 0}
              readOnly={isAdmin}
            />
          )}
          components={{ Footer }}
          increaseViewportBy={{ top: 200, bottom: 400 }}
        />
      </div>

      <PostModal
        open={!!activePost}
        post={activePost}
        startImageIndex={modalOptions.startImageIndex}
        initialOpenComments={modalOptions.openComments}
        onClose={closePost}
        onAddComment={addComment}
        onEditComment={editComment}
        onDeleteComment={deleteComment}
        onReact={reactTo}
        onShare={isAdmin ? undefined : handleShare}
        postId={activePost?.id}
        eventId={id}
        readOnly={isAdmin}
      />

      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          eventId={id}
          onClose={() => setEditingPost(null)}
          onSuccess={() => {
            refetch();
            setEditingPost(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-pale-canvas rounded-2xl border-2 border-ash-whisper shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-deep-forest mb-4">Delete Post</h3>
            <p className="text-deep-forest/70 mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-ash-whisper text-deep-forest hover:bg-ash-whisper transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
