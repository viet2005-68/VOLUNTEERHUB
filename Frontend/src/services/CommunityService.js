import axiosClient from "./axiosClient";

const CommunityService = {
    // ==================== POST APIs ====================
    getAllPosts: (eventId, pageNum, pageSize) => {
        const params = {};
        if (pageNum !== undefined) params.pageNum = pageNum;
        if (pageSize !== undefined) params.pageSize = pageSize;

        return axiosClient.get(`/v1/aggregated/events/${eventId}/posts`, { params });
    },


    getPostById: (eventId, postId) => {
        return axiosClient.get(`/v1/events/${eventId}/posts/${postId}`);
    },


    createPost: (eventId, postData) => {
        return axiosClient.post(`/v1/events/${eventId}/posts`, postData);
    },


    updatePost: (eventId, postId, postData) => {
        return axiosClient.put(`/v1/events/${eventId}/posts/${postId}`, postData);
    },


    deletePost: (eventId, postId) => {
        return axiosClient.delete(`/v1/events/${eventId}/posts/${postId}`);
    },

    // ==================== COMMENT APIs ====================

    getAllComments: (eventId, postId) => {
        return axiosClient.get(`/v1/aggregated/events/${eventId}/posts/${postId}/comments`);
    },


    createComment: (eventId, postId, commentData) => {
        return axiosClient.post(`/v1/events/${eventId}/posts/${postId}/comments`, commentData);
    },


    updateComment: (eventId, postId, commentId, commentData) => {
        return axiosClient.put(`/v1/events/${eventId}/posts/${postId}/comments/${commentId}`, commentData);
    },

    deleteComment: (eventId, postId, commentId) => {
        return axiosClient.delete(`/v1/events/${eventId}/posts/${postId}/comments/${commentId}`);
    },

    // ==================== REACTION APIs ====================
    // Get reaction counts for a post
    getAllReactions: (eventId, postId) => {
        return axiosClient.get(`/v1/events/${eventId}/posts/${postId}/reactions/count`);
    },

    // Get current user's reaction for a post
    getMyReaction: (eventId, postId) => {
        return axiosClient.get(`/v1/events/${eventId}/posts/${postId}/reactions`);
    },

    // PUT to create/update reaction (upsert)
    createReaction: (eventId, postId, reactionData) => {
        console.log("=== Creating/Updating Reaction ===");
        console.log("Event ID:", eventId);
        console.log("Post ID:", postId);
        console.log("Reaction Data:", reactionData);
        return axiosClient.put(`/v1/events/${eventId}/posts/${postId}/reactions`, reactionData);
    },

    updateReaction: (eventId, postId, reactionId, reactionData) => {
        return axiosClient.put(`/v1/events/${eventId}/posts/${postId}/reactions/${reactionId}`, reactionData);
    },

    deleteReaction: (eventId, postId, reactionId) => {
        return axiosClient.delete(`/v1/events/${eventId}/posts/${postId}/reactions/${reactionId}`);
    },
};

export default CommunityService;

export const REACTION_TYPE = Object.freeze({
    LIKE: "LIKE",
    LOVE: "LOVE",
    HAHA: "HAHA",
    WOW: "WOW",
    SAD: "SAD",
    ANGRY: "ANGRY",
});

export const reactionKeyToEnum = (key) => {
    const k = (key || "").toLowerCase();
    const map = { like: REACTION_TYPE.LIKE, love: REACTION_TYPE.LOVE, haha: REACTION_TYPE.HAHA, wow: REACTION_TYPE.WOW, sad: REACTION_TYPE.SAD, angry: REACTION_TYPE.ANGRY };
    return map[k] || REACTION_TYPE.LIKE;
};

