// src/hook/useDashboardStats.js
import { useQueries } from "@tanstack/react-query";
import axiosClient from "../services/axiosClient";
import { dashboardConfig } from "../constant/dashboardConfig";
import {
    useTotalEvents,
    useTotalActiveEvents,
    useTotalUsers,
    useTotalManagers,
    useEventStatsCount,
    useMyStatusEvents
} from "./useAnalysis";
// --- 1. ĐỊNH NGHĨA DỮ LIỆU GIẢ ---
const MOCK_API_RESPONSES = {
    // USER (paths relative to axios base …/api)
    "/v1/users/users/me": { value: 150, unit: " hrs" },
    "/v1/users/users/me/events-completed": { value: 25 },

    "/v1/users/users/me/this-month": { value: 12 },

    // MANAGER
    "/v1/users/users/me/total-events": { value: 8 },
    "/v1/users/users/me/active-events": { value: 3 },
    "/v1/users/users/me/total-volunteers": { value: 42 },
    "/v1/users/users/me/pending-applications": { value: 7 },

    // ADMIN
    "/v1/users/admin/users/all": { value: 1024 },
    "/v1/users/admin/active-organizations": { value: 45 },
    "/v1/users/admin/active-events": { value: 12 },
};

// --- 2. HÀM FETCH THÔNG MINH (Chuyển đổi giữa Mock và Real) ---
const fetchCardData = async (endpoint) => {
    const USE_MOCK = true; // <--- Đổi thành false khi có API thật

    if (USE_MOCK) {
        // Giả lập độ trễ mạng (Network Delay) 1.5 giây để test Skeleton
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = MOCK_API_RESPONSES[endpoint];

                // Giả lập lỗi ngẫu nhiên (Optional - để test Error State)
                //if (Math.random() > 0.1) reject(new Error("Lỗi mạng giả lập"));

                if (data) {
                    resolve(data);
                } else {
                    // Fallback nếu quên chưa định nghĩa mock cho endpoint nào đó
                    resolve({ value: 0 });
                }
            }, 1500);
        });
    }

    // Khi USE_MOCK = false, nó sẽ gọi axios thật
    return await axiosClient.get(endpoint);
};

// --- 3. HOOK CHÍNH ---
export const useDashboardStats = (role) => {
    const roleConfig = dashboardConfig[role?.toUpperCase()] || [];

    // Fetch analytics data - LUÔN GỌI để tránh lỗi Rules of Hooks
    // USER hooks
    const myStatusEventsQuery = useMyStatusEvents();

    // MANAGER hooks
    const totalEventsQuery = useTotalEvents();
    const totalActiveEventsQuery = useTotalActiveEvents();

    // ADMIN hooks
    const totalUsersQuery = useTotalUsers();
    const totalManagersQuery = useTotalManagers();
    const eventStatsCountQuery = useEventStatsCount();

    // Tính toán các giá trị phái sinh cho MANAGER
    const inactiveEvents =
        (totalEventsQuery.data || 0) - (totalActiveEventsQuery.data || 0);
    const totalVolunteers = (totalEventsQuery.data || 0) * 4;

    const queryResults = useQueries({
        queries: roleConfig
            .filter(card => !card.useAnalytics) // Chỉ query những card không dùng analytics
            .map((card) => ({
                queryKey: ["dashboard", role, card.endpoint],
                queryFn: () => fetchCardData(card.endpoint),
                staleTime: 5 * 60 * 1000,
                select: (data) => data?.value ?? data,
            })),
    });

    const mergedData = roleConfig.map((cardConfig) => {
        // Nếu card sử dụng analytics hooks
        if (cardConfig.useAnalytics) {
            let analyticsData = null;
            let isLoading = false;
            let isError = false;
            let error = null;

            switch (cardConfig.useAnalytics) {
                // USER analytics
                case "myStatusEvents": {
                    const statusData = myStatusEventsQuery.data || {};
                    isLoading = myStatusEventsQuery.isLoading;
                    isError = myStatusEventsQuery.isError;
                    error = myStatusEventsQuery.error;

                    // Xử lý dataKey để lấy đúng giá trị
                    if (cardConfig.dataKey === "total") {
                        // Tính tổng: approved + completed + pending
                        analyticsData = (statusData.approved || 0) + (statusData.completed || 0) + (statusData.pending || 0);
                    } else {
                        // Lấy giá trị theo dataKey (approved, completed, pending)
                        analyticsData = statusData[cardConfig.dataKey] || 0;
                    }
                    break;
                }

                // MANAGER analytics
                case "totalEvents":
                    analyticsData = totalEventsQuery.data;
                    isLoading = totalEventsQuery.isLoading;
                    isError = totalEventsQuery.isError;
                    error = totalEventsQuery.error;
                    break;
                case "totalActiveEvents":
                    analyticsData = totalActiveEventsQuery.data;
                    isLoading = totalActiveEventsQuery.isLoading;
                    isError = totalActiveEventsQuery.isError;
                    error = totalActiveEventsQuery.error;
                    break;
                case "inactiveEvents":
                    analyticsData = inactiveEvents;
                    isLoading = totalEventsQuery.isLoading || totalActiveEventsQuery.isLoading;
                    isError = totalEventsQuery.isError || totalActiveEventsQuery.isError;
                    error = totalEventsQuery.error || totalActiveEventsQuery.error;
                    break;
                case "totalVolunteers":
                    analyticsData = totalVolunteers;
                    isLoading = totalEventsQuery.isLoading;
                    isError = totalEventsQuery.isError;
                    error = totalEventsQuery.error;
                    break;

                // ADMIN analytics
                case "totalUsers":
                    analyticsData = totalUsersQuery.data;
                    isLoading = totalUsersQuery.isLoading;
                    isError = totalUsersQuery.isError;
                    error = totalUsersQuery.error;
                    break;
                case "totalManagers":
                    analyticsData = totalManagersQuery.data;
                    isLoading = totalManagersQuery.isLoading;
                    isError = totalManagersQuery.isError;
                    error = totalManagersQuery.error;
                    break;
                case "totalEventsAdmin":
                    analyticsData = totalEventsQuery.data;
                    isLoading = totalEventsQuery.isLoading;
                    isError = totalEventsQuery.isError;
                    error = totalEventsQuery.error;
                    break;
                case "eventStatsCount":
                    // API /v1/events/stats/count trả về số lượng events
                    analyticsData = eventStatsCountQuery.data;
                    isLoading = eventStatsCountQuery.isLoading;
                    isError = eventStatsCountQuery.isError;
                    error = eventStatsCountQuery.error;
                    break;

                default:
                    analyticsData = 0;
            }

            return {
                ...cardConfig,
                value: analyticsData ?? 0,
                isLoading,
                isError,
                error,
                refetch: () => {
                    // USER refetch
                    if (cardConfig.useAnalytics === "myStatusEvents") myStatusEventsQuery.refetch();

                    // MANAGER refetch
                    if (cardConfig.useAnalytics === "totalEvents") totalEventsQuery.refetch();
                    if (cardConfig.useAnalytics === "totalActiveEvents") totalActiveEventsQuery.refetch();
                    if (cardConfig.useAnalytics === "inactiveEvents") {
                        totalEventsQuery.refetch();
                        totalActiveEventsQuery.refetch();
                    }
                    if (cardConfig.useAnalytics === "totalVolunteers") {
                        totalEventsQuery.refetch();
                    }

                    // ADMIN refetch
                    if (cardConfig.useAnalytics === "totalUsers") totalUsersQuery.refetch();
                    if (cardConfig.useAnalytics === "totalManagers") totalManagersQuery.refetch();
                    if (cardConfig.useAnalytics === "totalEventsAdmin") totalEventsQuery.refetch();
                    if (cardConfig.useAnalytics === "eventStatsCount") eventStatsCountQuery.refetch();
                },
            };
        }

        // Nếu card sử dụng endpoint thông thường
        const resultIndex = roleConfig
            .filter(c => !c.useAnalytics)
            .findIndex(c => c.endpoint === cardConfig.endpoint);
        const result = queryResults[resultIndex];

        return {
            ...cardConfig,
            value: result?.data ?? 0,
            isLoading: result?.isLoading ?? false,
            isError: result?.isError ?? false,
            error: result?.error ?? null,
            refetch: result?.refetch ?? (() => { }),
        };
    });

    return mergedData;
};