import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";
import { ROLES } from "../constant/role";

export function useOverviewData() {
    const { user } = useAuth();
    const role = user?.role;

    // Stats data - mỗi role có API riêng
    const statsQuery = useQuery({
        queryKey: ["dashboard-stats", role],
        queryFn: () => fetch(`/api/dashboard/${role}/stats`),
        enabled: !!role,
    });

    // Events data - chỉ call API phù hợp
    const eventsQuery = useQuery({
        queryKey: ["dashboard-events", role],
        queryFn: () => {
            if (role === ROLES.ORG) {
                return fetch("/api/dashboard/org/new-events");
            }
            return fetch("/api/dashboard/user/upcoming-events");
        },
        enabled: !!role && role !== ROLES.ADMIN, // ADMIN có thể không cần events
    });

    // Activity data - chung cho mọi role
    const activityQuery = useQuery({
        queryKey: ["dashboard-activity", role],
        queryFn: () => fetch(`/api/dashboard/${role}/activity`),
        enabled: !!role,
    });

    // Quick actions - có thể khác nhau theo role
    const actionsQuery = useQuery({
        queryKey: ["dashboard-actions", role],
        queryFn: () => fetch(`/api/dashboard/${role}/actions`),
        enabled: !!role,
    });

    return {
        stats: statsQuery.data,
        events: eventsQuery.data,
        activity: activityQuery.data,
        actions: actionsQuery.data,

        isLoading: statsQuery.isLoading || eventsQuery.isLoading ||
            activityQuery.isLoading || actionsQuery.isLoading,

        isError: statsQuery.isError || eventsQuery.isError ||
            activityQuery.isError || actionsQuery.isError,
    };
}