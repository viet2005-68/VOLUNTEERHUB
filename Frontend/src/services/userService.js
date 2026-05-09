import axiosClient from "./axiosClient";

/** Paths use `/v1/...` because axios `baseURL` is `.../api` (avoid `/api/api/v1/...`). */

const createUserProfile = async (data) => {
    try {
        // Use axiosClient instead of useApi to get Bearer token from interceptor
        const payload = {
            authProvider: "local", // Required field
            fullName: data.name,
            username: data.email,
            email: data.email,

            // Các trường optional có thể thêm sau
            bio: data.bio || "",
            avatarUrl: data.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (data.username || data.email),
        }
        console.log("Creating user profile with data hh:", payload);
        const res = await axiosClient.post("/v1/users/users", payload);

        return res.data;
    } catch (error) {
        console.error("Error creating user profile:", error);
        const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Cannot create user profile. Please try again later.';
        throw new Error(errorMessage);
    }
}

const getUserInfo = async () => {
    try {
        const user = await axiosClient.get("/v1/users/users/me");
        return user;
    } catch (error) {
        console.error("Error fetching user info:", error);
        throw error;
    }
};

const updateUserInfo = async (userData) => {
    try {
        const user = await axiosClient.put("/v1/users/users/me", userData);
        console.log("DONE updating user info:", user);
        return user;
    } catch (error) {
        console.error("Error updating user info:", error);
        throw error;
    }
};

const getProfileCompleteness = async () => {
    try {
        const completeness = await axiosClient.get("/v1/users/users/me/validate-profile");
        return completeness;
    } catch (error) {
        console.error("Error fetching profile completeness:", error);
        // If user profile doesn't exist yet (404), return incomplete status
        if (error.response?.status === 404) {
            return {
                isComplete: false,
                missingFields: ["fullName", "phoneNumber", "dateOfBirth", "address"],
                message: "Profile not found"
            };
        }
        throw error;
    }
};

const getAllUsers = async () => {
    try {
        const users = await axiosClient.get("/v1/users/admin/users/all");
        return users;
    } catch (error) {
        console.error("Error fetching all users:", error);
        throw error;
    }
};

const banUser = async (userId) => {
    try {
        const response = await axiosClient.put(`/v1/users/admin/${userId}/ban`);
        return response;
    } catch (error) {
        console.error("Error banning user:", error);
        throw error;
    }
};

const unbanUser = async (userId) => {
    try {
        const response = await axiosClient.put(`/v1/users/admin/${userId}/unban`);
        return response;
    } catch (error) {
        console.error("Error unbanning user:", error);
        throw error;
    }
};

export { createUserProfile, getUserInfo, updateUserInfo, getProfileCompleteness, getAllUsers, banUser, unbanUser };
