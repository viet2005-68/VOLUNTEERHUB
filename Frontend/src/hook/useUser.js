import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfileCompleteness, getUserInfo, updateUserInfo, getAllUsers, banUser, unbanUser } from "../services/userService";
import { useMemo } from "react";
import toast from "react-hot-toast";

export const useProfile = () => {
    return useQuery({
        queryKey: ["userProfile"],
        queryFn: getUserInfo,
    });
};

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateUserInfo,
        onSuccess: (data) => {
            console.log("Profile updated successfully:", data);
            toast.success("Profile updated successfully!");
            queryClient.invalidateQueries(["userProfile"]);
        },
        onError: (error) => {
            console.error("Failed to update profile:", error);
            const message = error?.response?.data?.message || error?.message || "Failed to update profile.";
            toast.error(message);
        },
    });
};

export const useProfileCompleteness = () => {
    return useQuery({
        queryKey: ["profileCompleteness"],
        queryFn: getProfileCompleteness,
        refetchOnWindowFocus: false,
        retry: false, // Don't retry on failure
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        // Return default incomplete status on error
        placeholderData: {
            isComplete: false,
            missingFields: [],
            message: "Checking profile..."
        },
    });
};

// Hook for fetching all users with client-side pagination and filtering
export const useAllUsers = ({ page = 1, pageSize = 6, search = "", status = "all" } = {}) => {
    const { data: allUsers, isLoading, isError, error, isFetching } = useQuery({
        queryKey: ["allUsers"],
        queryFn: getAllUsers,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    // Client-side filtering and pagination
    const paginatedData = useMemo(() => {
        if (!allUsers || !Array.isArray(allUsers)) {
            return {
                items: [],
                totalItems: 0,
                totalPages: 1,
                currentPage: page,
            };
        }

        // Filter by search term
        let filtered = allUsers.filter((user) => {
            const searchLower = search.toLowerCase();
            const matchesSearch =
                user.fullName?.toLowerCase().includes(searchLower) ||
                user.email?.toLowerCase().includes(searchLower) ||
                user.role?.toLowerCase().includes(searchLower);

            // Filter by status
            const matchesStatus = status === "all" || user.status?.toLowerCase() === status.toLowerCase();

            return matchesSearch && matchesStatus;
        });

        const totalItems = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const start = (page - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize);

        return {
            items,
            totalItems,
            totalPages,
            currentPage: page,
        };
    }, [allUsers, page, pageSize, search, status]);

    return {
        data: paginatedData,
        isLoading,
        isError,
        error,
        isFetching,
    };
};

// Hook for banning a user
export const useBanUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId) => banUser(userId),
        onMutate: async (userId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["allUsers"] });

            // Snapshot the previous value
            const previousUsers = queryClient.getQueryData(["allUsers"]);

            // Optimistically update to the new value
            queryClient.setQueryData(["allUsers"], (old) => {
                if (!old || !Array.isArray(old)) return old;
                return old.map((user) =>
                    user.id === userId
                        ? { ...user, status: "BANNED" }
                        : user
                );
            });

            return { previousUsers };
        },
        onSuccess: () => {
            toast.success("User banned successfully");
            queryClient.invalidateQueries({ queryKey: ["allUsers"] });
        },
        onError: (error, _userId, context) => {
            // Rollback on error
            if (context?.previousUsers) {
                queryClient.setQueryData(["allUsers"], context.previousUsers);
            }
            const message = error?.response?.data?.message || error.message || "Failed to ban user";
            toast.error(message);
        },
    });
};

// Hook for unbanning a user
export const useUnbanUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId) => unbanUser(userId),
        onMutate: async (userId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["allUsers"] });

            // Snapshot the previous value
            const previousUsers = queryClient.getQueryData(["allUsers"]);

            // Optimistically update to the new value
            queryClient.setQueryData(["allUsers"], (old) => {
                if (!old || !Array.isArray(old)) return old;
                return old.map((user) =>
                    user.id === userId
                        ? { ...user, status: "ACTIVE" }
                        : user
                );
            });

            return { previousUsers };
        },
        onSuccess: () => {
            toast.success("User unbanned successfully");
            queryClient.invalidateQueries({ queryKey: ["allUsers"] });
        },
        onError: (error, _userId, context) => {
            // Rollback on error
            if (context?.previousUsers) {
                queryClient.setQueryData(["allUsers"], context.previousUsers);
            }
            const message = error?.response?.data?.message || error.message || "Failed to unban user";
            toast.error(message);
        },
    });
};