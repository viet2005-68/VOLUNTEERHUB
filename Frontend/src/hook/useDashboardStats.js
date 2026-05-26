import { dashboardConfig } from "../constant/dashboardConfig";
import { useDashboardAnalytics } from "./useAnalysis";

const resolveCardValue = (analytics, dataKey) => {
    if (!analytics || !dataKey) return 0;
    const value = analytics[dataKey];
    return value === null || value === undefined ? 0 : value;
};

export const useDashboardStats = (role) => {
    const roleConfig = dashboardConfig[role?.toUpperCase()] || [];
    const dashboardQuery = useDashboardAnalytics();

    return roleConfig.map((cardConfig) => ({
        ...cardConfig,
        value: cardConfig.useAnalytics === "dashboard"
            ? resolveCardValue(dashboardQuery.data, cardConfig.dataKey)
            : cardConfig.value,
        isLoading: dashboardQuery.isLoading,
        isError: dashboardQuery.isError,
        error: dashboardQuery.error,
        refetch: dashboardQuery.refetch,
    }));
};
