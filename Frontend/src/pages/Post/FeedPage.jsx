import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import CreatePost from "../../components/Post/CreatPost";
import PostCard from "../../components/Post/PostCard";
import PostModal from "../../components/Post/PostModal";
import EditPostModal from "../../components/Post/EditPostModal";
import "../../index.css";
import { useInfinitePosts, useDeletePost } from "../../hook/useCommunity";
import { useNavbar } from "../../hook/useNavbar";
import { useAuth } from "../../hook/useAuth";
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

  // Map dữ liệu API

  const mapApiPost = (p) => ({
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
    reactions: {},
    userReaction: null,
    ownerId: p?.owner?.id,
  });

  useEffect(() => {
    if (!data) return;
    console.log(data);
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
    const _minimal = {
      id: newPost.id ?? Date.now(),
      content: newPost.content ?? "",
      text: newPost.text ?? newPost.content ?? "",
      images: Array.isArray(newPost.images) ? newPost.images : [],
      author: newPost.author ?? { name: currentUser.name },
      createdAt: newPost.createdAt ?? new Date().toISOString(),
    };
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

  // Local reactions (UI-only)
  const reactTo = (postId, type) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const already = p.userReaction === type;
        const newReactions = { ...(p.reactions || {}) };
        let newUserReaction = p.userReaction;
        if (already) {
          // remove
          newReactions[type] = Math.max(0, (newReactions[type] || 0) - 1);
          newUserReaction = null;
        } else {
          // switch or add
          if (p.userReaction) {
            newReactions[p.userReaction] = Math.max(
              0,
              (newReactions[p.userReaction] || 0) - 1
            );
          }
          newReactions[type] = (newReactions[type] || 0) + 1;
          newUserReaction = type;
        }
        return { ...p, reactions: newReactions, userReaction: newUserReaction };
      })
    );

    // also update activePost if it's the same
    setActivePost((ap) => {
      if (!ap || ap.id !== postId) return ap;
      const p = posts.find((x) => x.id === postId) || ap;
      const already = p.userReaction === type;
      let newReactions = { ...(p.reactions || {}) };
      let newUserReaction = p.userReaction;
      if (already) {
        newReactions[type] = Math.max(0, (newReactions[type] || 0) - 1);
        newUserReaction = null;
      } else {
        if (p.userReaction)
          newReactions[p.userReaction] = Math.max(
            0,
            (newReactions[p.userReaction] || 0) - 1
          );
        newReactions[type] = (newReactions[type] || 0) + 1;
        newUserReaction = type;
      }
      return { ...ap, reactions: newReactions, userReaction: newUserReaction };
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
    <div className="py-4 text-center text-sm text-gray-500">
      {isFetchingNextPage
        ? "Loading..."
        : hasNextPage
        ? "Scroll to load more..."
        : items.length > 0
        ? "No more posts"
        : null}
    </div>
  );
  console.log("post", posts);

  return (
    <div className="min-h-screen py-4">
      <div className="max-w-3xl mx-auto mb-6 px-2 sm:px-0 mt-2 sm:mt-4 space-y-4">
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

        {status === "loading" && (
          <div className="text-center text-gray-500 mt-4">Loading...</div>
        )}
        {status === "error" && (
          <div className="text-center text-red-500 mt-4">Can't load posts.</div>
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
              canEdit={post?.ownerId === user?.id}
              postId={post.id}
              hiddenComment={hiddenComment}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
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
        postId={activePost?.id}
        eventId={id}
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
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Delete Post</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
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
