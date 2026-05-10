import axiosClient from "./axiosClient";

const AnalysisService = {
    // ==================== MANAGER ANALYTICS ====================

    // Analytic tỉ lệ apply (manager)
    getApplicationRate: async () => {
        try {
            const response = await axiosClient.get("/v1/analytics/application-rate");
            return response;
        } catch (error) {
            console.error("Error fetching application rate:", error);
            throw error;
        }
    },

    // Analytic tỉ lệ approved (manager)
    getApprovalRate: async () => {
        try {
            const response = await axiosClient.get("/v1/analytics/approval-rate");
            return response;
        } catch (error) {
            console.error("Error fetching approval rate:", error);
            throw error;
        }
    },

    // Count events mới (user)
    getMyParticipatedEvents: async () => {
        try {
            const response = await axiosClient.get("/v1/analytics/my-stats/participated-events");
            return response;
        } catch (error) {
            console.error("Error fetching participated events:", error);
            throw error;
        }
    },

    // Lấy thống kê status events của user (approved, completed, pending)
    getMyStatusEvents: async () => {
        try {
            const response = await axiosClient.get("/v1/registrations/my-stats/status-events");
            return response;
        } catch (error) {
            console.error("Error fetching my status events:", error);
            throw error;
        }
    },

    // ==================== ADMIN ANALYTICS ====================

    // Số users (admin ms dc xem)
    getTotalUsers: async () => {
        try {
            const response = await axiosClient.get("/v1/analytics/total-users");
            return response;
        } catch (error) {
            console.error("Error fetching total users:", error);
            throw error;
        }
    },

    // Số managers (admin ms dc xem)
    getTotalManagers: async () => {
        try {
            const response = await axiosClient.get("/v1/analytics/total-managers");
            return response;
        } catch (error) {
            console.error("Error fetching total managers:", error);
            throw error;
        }
    },

    // Số event mới manager
    getTotalEvents: async () => {
        try {
            const response = await axiosClient.get("/v1/analytics/total_events");
            return response;
        } catch (error) {
            console.error("Error fetching total events:", error);
            throw error;
        }
    },

    // Số active event mới manager
    getTotalActiveEvents: async () => {
        try {
            const response = await axiosClient.get("/v1/analytics/total-active-events");
            return response;
        } catch (error) {
            console.error("Error fetching total active events:", error);
            throw error;
        }
    },

    // Thống kê tổng số events (cho admin)
    getEventStatsCount: async () => {
        try {
            const response = await axiosClient.get("/v1/events/stats/count");
            return response;
        } catch (error) {
            console.error("Error fetching event stats count:", error);
            throw error;
        }
    },

    // ==================== EXPORT PARTICIPANTS ====================

    // Export participants của một event (JSON format)
    getEventParticipantsJson: async (eventId) => {
        try {
            const response = await axiosClient.get(
                `/v1/aggregated/registrations/export/participants?eventId=${eventId}&format=json`
            );
            return response;
        } catch (error) {
            console.error("Error fetching event participants (JSON):", error);
            throw error;
        }
    },

    // Export participants của một event (CSV format)
    getEventParticipantsCsv: async (eventId) => {
        console.log("eventId", eventId);
        try {
            const response = await axiosClient.get(
                `/v1/aggregated/registrations/export/participants?eventId=${eventId}`,
                {
                    responseType: 'blob',
                }
            );
            return response;
        } catch (error) {
            console.error("Error fetching event participants (CSV):", error);
            throw error;
        }
    },



    // Export all events (JSON format)
    exportAllEventsJson: async () => {
        try {
            const response = await axiosClient.get(
                `/v1/aggregated/events/export?format=json`
            );
            return response;
        } catch (error) {
            console.error("Error exporting all events (JSON):", error);
            throw error;
        }
    },

    // Export all events (CSV format)
    exportAllEventsCsv: async () => {
        try {
            const response = await axiosClient.get(
                `/v1/aggregated/events/export`,
                {
                    responseType: 'blob',
                }
            );
            return response;
        } catch (error) {
            console.error("Error exporting all events (CSV):", error);
            throw error;
        }
    },

    // ==================== EXPORT ALL USERS ====================

    // Export all users (JSON format)
    exportAllUsersJson: async () => {
        try {
            const response = await axiosClient.get(
                `/v1/aggregated/export/users?format=json`
            );
            return response;
        } catch (error) {
            console.error("Error exporting all users (JSON):", error);
            throw error;
        }
    },

    // Export all users (CSV format)
    exportAllUsersCsv: async () => {
        try {
            const response = await axiosClient.get(
                `/v1/aggregated/export/users`,
                {
                    responseType: 'blob',
                }
            );
            return response;
        } catch (error) {
            console.error("Error exporting all users (CSV):", error);
            throw error;
        }
    },
};

export default AnalysisService;
