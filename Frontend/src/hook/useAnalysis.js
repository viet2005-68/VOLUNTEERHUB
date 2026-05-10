import { useQuery } from "@tanstack/react-query";
import AnalysisService from "../services/analysisService";

const ANALYTICS_QUERY_KEY = ["analytics"];

// ==================== MANAGER ANALYTICS HOOKS ====================

/**
 * Hook để lấy analytics cho Manager (3 APIs)
 * - Application Rate
 * - Approval Rate
 * - My Participated Events
 */
export const useManagerAnalytics = () => {
    const applicationRateQuery = useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "applicationRate"],
        queryFn: AnalysisService.getApplicationRate,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const approvalRateQuery = useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "approvalRate"],
        queryFn: AnalysisService.getApprovalRate,
        staleTime: 5 * 60 * 1000,
    });

    const participatedEventsQuery = useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "participatedEvents"],
        queryFn: AnalysisService.getMyParticipatedEvents,
        staleTime: 5 * 60 * 1000,
    });

    return {
        applicationRate: {
            data: applicationRateQuery.data,
            isLoading: applicationRateQuery.isLoading,
            isError: applicationRateQuery.isError,
            error: applicationRateQuery.error,
        },
        approvalRate: {
            data: approvalRateQuery.data,
            isLoading: approvalRateQuery.isLoading,
            isError: approvalRateQuery.isError,
            error: approvalRateQuery.error,
        },
        participatedEvents: {
            data: participatedEventsQuery.data,
            isLoading: participatedEventsQuery.isLoading,
            isError: participatedEventsQuery.isError,
            error: participatedEventsQuery.error,
        },
        // Combined loading state
        isLoading: applicationRateQuery.isLoading || approvalRateQuery.isLoading || participatedEventsQuery.isLoading,
        // All queries successful
        isSuccess: applicationRateQuery.isSuccess && approvalRateQuery.isSuccess && participatedEventsQuery.isSuccess,
    };
};

// ==================== ADMIN ANALYTICS HOOKS ====================

/**
 * Hook để lấy analytics cho Admin (3 APIs)
 * - Total Users
 * - Total Managers
 * - Total Events
 */
export const useAdminAnalytics = () => {
    const totalUsersQuery = useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "totalUsers"],
        queryFn: AnalysisService.getTotalUsers,
        staleTime: 5 * 60 * 1000,
    });

    const totalManagersQuery = useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "totalManagers"],
        queryFn: AnalysisService.getTotalManagers,
        staleTime: 5 * 60 * 1000,
    });

    const totalEventsQuery = useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "totalEvents"],
        queryFn: AnalysisService.getTotalEvents,
        staleTime: 5 * 60 * 1000,
    });

    return {
        totalUsers: {
            data: totalUsersQuery.data,
            isLoading: totalUsersQuery.isLoading,
            isError: totalUsersQuery.isError,
            error: totalUsersQuery.error,
        },
        totalManagers: {
            data: totalManagersQuery.data,
            isLoading: totalManagersQuery.isLoading,
            isError: totalManagersQuery.isError,
            error: totalManagersQuery.error,
        },
        totalEvents: {
            data: totalEventsQuery.data,
            isLoading: totalEventsQuery.isLoading,
            isError: totalEventsQuery.isError,
            error: totalEventsQuery.error,
        },
        // Combined loading state
        isLoading: totalUsersQuery.isLoading || totalManagersQuery.isLoading || totalEventsQuery.isLoading,
        // All queries successful
        isSuccess: totalUsersQuery.isSuccess && totalManagersQuery.isSuccess && totalEventsQuery.isSuccess,
    };
};

// ==================== INDIVIDUAL HOOKS (nếu cần dùng riêng lẻ) ====================

export const useApplicationRate = () => {
    return useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "applicationRate"],
        queryFn: AnalysisService.getApplicationRate,
        staleTime: 5 * 60 * 1000,
    });
};

export const useApprovalRate = () => {
    return useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "approvalRate"],
        queryFn: AnalysisService.getApprovalRate,
        staleTime: 5 * 60 * 1000,
    });
};

export const useMyParticipatedEvents = () => {
    return useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "participatedEvents"],
        queryFn: AnalysisService.getMyParticipatedEvents,
        staleTime: 5 * 60 * 1000,
    });
};

export const useMyStatusEvents = () => {
    return useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "myStatusEvents"],
        queryFn: AnalysisService.getMyStatusEvents,
        staleTime: 5 * 60 * 1000,
    });
};

export const useTotalUsers = () => {
    return useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "totalUsers"],
        queryFn: AnalysisService.getTotalUsers,
        staleTime: 5 * 60 * 1000,
    });
};

export const useTotalManagers = () => {
    return useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "totalManagers"],
        queryFn: AnalysisService.getTotalManagers,
        staleTime: 5 * 60 * 1000,
    });
};

export const useTotalEvents = () => {
    return useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "totalEvents"],
        queryFn: AnalysisService.getTotalEvents,
        staleTime: 5 * 60 * 1000,
    });
};

export const useTotalActiveEvents = () => {
    return useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "totalActiveEvents"],
        queryFn: AnalysisService.getTotalActiveEvents,
        staleTime: 5 * 60 * 1000,
    });
};

export const useEventStatsCount = () => {
    return useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "eventStatsCount"],
        queryFn: AnalysisService.getEventStatsCount,
        staleTime: 5 * 60 * 1000,
    });
};

// ==================== EXPORT PARTICIPANTS HOOKS ====================

/**
 * Hook để lấy danh sách participants của một event (JSON format)
 */
export const useEventParticipantsJson = (eventId, options = {}) => {
    return useQuery({
        queryKey: [...ANALYTICS_QUERY_KEY, "eventParticipants", eventId, "json"],
        queryFn: () => AnalysisService.getEventParticipantsJson(eventId),
        enabled: !!eventId && (options.enabled !== false),
        staleTime: 2 * 60 * 1000, // 2 minutes
        ...options,
    });
};
