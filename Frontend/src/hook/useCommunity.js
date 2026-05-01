import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import CommunityService from "../services/CommunityService";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { data } from "react-router-dom";

const COMMUNITY_QUERY_KEY = ["community"];

export const usePosts = (eventId, params) => {
    const queryClient = useQueryClient();
    const { pageNum = 0, pageSize = 10 } = params || {};

    const query = useQuery({
        queryKey: ["community", "posts", eventId, pageNum, pageSize],
        queryFn: () => CommunityService.getAllPosts(eventId, pageNum, pageSize),
        enabled: !!eventId,
        keepPreviousData: true,
    });

    // Prefetch page tiếp theo
    useEffect(() => {
        const nextPage = pageNum + 1;

        queryClient.prefetchQuery({
            queryKey: ["community", "posts", eventId, nextPage, pageSize],
            queryFn: () => CommunityService.getAllPosts(eventId, nextPage, pageSize),
        });
    }, [eventId, pageNum, pageSize, queryClient]);

    return query;
};

export const usePostDetail = (eventId, postId) => {
    return useQuery({
        queryKey: [...COMMUNITY_QUERY_KEY, "postDetail", eventId, postId],
        queryFn: () => CommunityService.getPostById(eventId, postId),
        enabled: !!eventId && !!postId,
    });
};

export const useCreatePost = (eventId) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: ({ content = "", imageFiles = [] } = {}) => {
            const form = new FormData();
            form.append(
                "postRequest",
                new Blob([JSON.stringify({ content })], { type: "application/json" })
            );
            imageFiles.forEach((file) => {
                if (file) form.append("imageFiles", file);
            });
            return CommunityService.createPost(eventId, form);
        },
        onSuccess: () => {
            toast.success("Post created successfully.");
            queryClient.invalidateQueries(["community", "posts", eventId]);
            queryClient.invalidateQueries(["community", "postsInfinite", eventId]);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || error.message || "Failed to create post";
            toast.error(message);
        },
    });
    // Normalize loading state across react-query v4/v5
    return { ...mutation, isLoading: mutation.isLoading ?? mutation.isPending ?? false };
};

export const useUpdatePost = (eventId, postId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (postData) => CommunityService.updatePost(eventId, postId, postData),
        onSuccess: () => {
            toast.success("Post updated successfully.");
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "posts", eventId]);
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "postsInfinite", eventId]);
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "postDetail", eventId, postId]);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || error.message || "Failed to update post";
            toast.error(message);
        },
    });
};

export const useDeletePost = (eventId, postId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => CommunityService.deletePost(eventId, postId),
        onSuccess: () => {
            toast.success("Post deleted successfully.");
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "posts", eventId]);
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "postsInfinite", eventId]);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || error.message || "Failed to delete post";
            toast.error(message);
        },
    });
};

export const useInfinitePosts = (eventId, options = {}) => {
    const { pageSize = 10, initialPageNum = 0, zeroBased = true } = options;

    return useInfiniteQuery({
        queryKey: [...COMMUNITY_QUERY_KEY, "postsInfinite", eventId, pageSize, initialPageNum, zeroBased],
        queryFn: ({ pageParam = initialPageNum }) => CommunityService.getAllPosts(eventId, pageParam, pageSize),
        getNextPageParam: (lastPage) => {
            const current = Number(lastPage?.number ?? initialPageNum);
            const totalPages = Number(lastPage?.totalPages ?? 0);
            const next = current + 1;
            // If API uses 0-based indexing, continue while next < totalPages; if 1-based, continue while next <= totalPages
            const canFetchMore = zeroBased ? next < totalPages : next <= totalPages;
            return canFetchMore ? next : undefined;
        },
        initialPageParam: initialPageNum,
        enabled: !!eventId,
        keepPreviousData: true,
    });
};

// Comments: API trả về toàn bộ danh sách không phân trang, dạng [{ comment, owner, replies: [] }]
// Chuẩn hóa: chỉ giữ 2 cấp (cha + con). Mọi reply sâu hơn đều gán parentId về id của comment cha cấp 1.
export const useComments = (eventId, postId) => {
    const normalizeCommentsOneLevel = (nodes = []) => {
        console.log(data)
        const flat = [];
        nodes.forEach((node) => {
            if (!node || !node.comment) return;
            const newNode = { ...node.comment, ownerName: node.owner.fullName || "Anonymous", avatarUrl: node.owner.avatarUrl || "" }
            const parent = newNode;
            flat.push(parent);
            const flattenReplies = (replies = []) => {
                replies.forEach((r) => {
                    if (!r || !r.comment) return;
                    const newChild = { ...r.comment, ownerName: r.owner.fullName || "Anonymous", avatarUrl: r.owner.avatarUrl || "" }
                    const child = { ...newChild, parentId: parent.id };
                    flat.push(child);
                    if (Array.isArray(r.replies) && r.replies.length) {
                        // ép mọi cấp sâu hơn thành con trực tiếp của cha
                        flattenReplies(r.replies);
                    }
                });
            };
            flattenReplies(node.replies || []);
        });
        return flat;
    };

    return useQuery({
        queryKey: ["community", "comments", eventId, postId],
        queryFn: () => CommunityService.getAllComments(eventId, postId),
        enabled: !!eventId && !!postId,
        select: (data) => normalizeCommentsOneLevel(Array.isArray(data) ? data : []),
    });
};

export const useInfiniteComments = (eventId, postId, options = {}) => {
    const { pageSize = 10 } = options;

    return useInfiniteQuery({
        queryKey: [...COMMUNITY_QUERY_KEY, "commentsInfinite", eventId, postId, pageSize],
        queryFn: ({ pageParam = 0 }) => CommunityService.getAllComments(eventId, postId, pageParam, pageSize),
        getNextPageParam: (lastPage) => {
            const current = Number(lastPage?.number ?? 0);
            const totalPages = Number(lastPage?.totalPages ?? 0);
            const next = current + 1;
            return next < totalPages ? next : undefined;
        },
        initialPageParam: 0,
        enabled: !!eventId && !!postId,
        keepPreviousData: true,
    });
};

export const useCreateComment = (eventId, postId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentData) => CommunityService.createComment(eventId, postId, commentData),
        onSuccess: () => {
            toast.success("Comment created successfully.");
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "comments", eventId, postId]);
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "commentsInfinite", eventId, postId]);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || error.message || "Failed to create comment";
            toast.error(message);
        },
    });
};

export const useUpdateComment = (eventId, postId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ commentId, content, parentId }) =>
            CommunityService.updateComment(eventId, postId, commentId, { content, parentId }),
        onSuccess: () => {
            toast.success("Comment updated successfully.");
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "comments", eventId, postId]);
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "commentsInfinite", eventId, postId]);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || error.message || "Failed to update comment";
            toast.error(message);
        },
    });
};

export const useDeleteComment = (eventId, postId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (commentId) => CommunityService.deleteComment(eventId, postId, commentId),
        onSuccess: () => {
            toast.success("Comment deleted successfully.");
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "comments", eventId, postId]);
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "commentsInfinite", eventId, postId]);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || error.message || "Failed to delete comment";
            toast.error(message);
        }
    });
};

// Normalize reaction counts - ensure all 6 reactions have a count (0 if not present)
const normalizeReactionCounts = (apiResponse) => {
    const allReactions = {
        LIKE: 0,
        LOVE: 0,
        HAHA: 0,
        WOW: 0,
        SAD: 0,
        ANGRY: 0,
    };

    // Merge API response with default values
    if (apiResponse && typeof apiResponse === 'object') {
        Object.keys(allReactions).forEach(key => {
            if (apiResponse[key] !== undefined && typeof apiResponse[key] === 'number') {
                allReactions[key] = apiResponse[key];
            }
        });
    }



    return allReactions;
};

export const useReactions = (eventId, postId, params) => {
    const { pageNum = 0, pageSize = 10 } = params || {};

    return useQuery({
        queryKey: [...COMMUNITY_QUERY_KEY, "reactions", eventId, postId, pageNum, pageSize],
        queryFn: async () => {
            const result = await CommunityService.getAllReactions(eventId, postId);

            return normalizeReactionCounts(result);
        },
        enabled: !!eventId && !!postId,
        keepPreviousData: true,
    });
};

// Hook to get current user's reaction for a post
// API already returns only current user's reaction
export const useMyReaction = (eventId, postId) => {
    return useQuery({
        queryKey: [...COMMUNITY_QUERY_KEY, "myReaction", eventId, postId],
        queryFn: async () => {
            const result = await CommunityService.getMyReaction(eventId, postId);
            console.log("=== GET My Reaction ===");
            console.log("Event ID:", eventId);
            console.log("Post ID:", postId);
            console.log("API Response:", result);

            // API returns { content: [reaction], ... }
            // If user has reacted, content[0] will have the reaction
            // If user hasn't reacted, content will be empty
            const myReaction = result?.content?.[0] || null;
            console.log("My Reaction:", myReaction);
            console.log("======================");

            return myReaction;
        },
        enabled: !!eventId && !!postId,
        staleTime: 1000 * 30, // 30 seconds
    });
};

export const useCreateReaction = (eventId, postId, currentUserReaction = null) => {
    const queryClient = useQueryClient();

    const toEnumType = (key) => {
        const map = { like: "LIKE", love: "LOVE", haha: "HAHA", wow: "WOW", sad: "SAD", angry: "ANGRY" };
        return map[key] || "LIKE";
    };

    return useMutation({
        // Accept either ENUM string (LIKE, SAD) or lowercase key (like, sad)
        mutationFn: async (input) => {
            console.log("=== useCreateReaction mutationFn ===");
            console.log("Input:", input);
            console.log("Input type:", typeof input);
            console.log("Current User Reaction:", currentUserReaction);

            let reactionEnum;

            if (typeof input === "string") {
                if (input === input.toUpperCase() && ["LIKE", "LOVE", "HAHA", "WOW", "SAD", "ANGRY"].includes(input)) {
                    reactionEnum = input;
                } else {

                    reactionEnum = toEnumType(input);
                }
            } else if (input?.type) {
                reactionEnum = input.type;
            } else {
                reactionEnum = "LIKE";
            }

            console.log("Final Reaction ENUM:", reactionEnum);

            // If clicking same reaction -> delte
            const payload = { type: reactionEnum };

            console.log("Payload:", payload);
            const result = await CommunityService.createReaction(eventId, postId, payload);
            console.log("Result:", result);
            console.log("===================================");
            return result;
        },

        onMutate: async (input) => {
            // Cancel any outgoing refetches for reactions/post while we optimistically update
            await queryClient.cancelQueries({ queryKey: [...COMMUNITY_QUERY_KEY, "reactions", eventId, postId] });
            await queryClient.cancelQueries({ queryKey: [...COMMUNITY_QUERY_KEY, "myReaction", eventId, postId] });
            await queryClient.cancelQueries({ queryKey: [...COMMUNITY_QUERY_KEY, "post", eventId, postId] });
            return { input };
        },
        onSuccess: () => {


            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "reactions", eventId, postId]);
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "myReaction", eventId, postId]);
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "post", eventId, postId]);
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "posts", eventId]);
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "postsInfinite", eventId]);
        },
        onError: (error) => {
            console.log("=== Reaction Error ===");
            console.log("Error:", error);
            console.log("Error response:", error?.response);
            const message = error?.response?.data?.message || error.message || "Failed to update reaction";
            toast.error(message);
        },
    });
};

export const useUpdateReaction = (eventId, postId, reactionId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => CommunityService.updateReaction(eventId, postId, reactionId, data),
        onSuccess: () => {
            toast.success("Reaction updated");
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "reactions", eventId, postId]);
        },
        onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to update reaction"),
    });
};

export const useDeleteReaction = (eventId, postId, reactionId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => CommunityService.deleteReaction(eventId, postId, reactionId),
        onSuccess: () => {
            toast.success("Reaction removed");
            queryClient.invalidateQueries([...COMMUNITY_QUERY_KEY, "reactions", eventId, postId]);
        },
        onError: (err) => toast.error(err?.response?.data?.message ?? "Failed to remove reaction"),
    });
};