import axiosClient from "./axiosClient";

const API_BASE_URL = "/v1/notifications";

// Lấy danh sách notifications với pagination
export const fetchNotifications = async ({ pageParam = 0, pageSize = 10 }) => {
    try {
        const response = await axiosClient.get(`${API_BASE_URL}`, {
            params: {
                pageNum: pageParam,
                pageSize: pageSize
            }
        });

        // Response structure: array of notifications (no meta)
        const notifications = Array.isArray(response) ? response : response.data || [];
        console.log('Fetched notifications:', notifications);

        // Since API doesn't return total count, we determine hasMore by checking if we got full page
        return {
            data: notifications,
            nextPage: notifications.length === pageSize ? pageParam + 1 : undefined,
            hasMore: notifications.length === pageSize
        };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
};

// Lấy chi tiết một notification
export const getNotificationById = async (notificationId) => {
    try {
        const response = await axiosClient.get(`${API_BASE_URL}/${notificationId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching notification:", error);
        throw error;
    }
};

// Đánh dấu đã đọc
export const markAsRead = async (notificationId) => {
    try {
        const response = await axiosClient.put(`${API_BASE_URL}/${notificationId}/mark-as-read`);
        return response.data;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
};

// Xóa notification
export const deleteNotification = async (notificationId) => {
    try {
        await axiosClient.delete(`${API_BASE_URL}/${notificationId}`);
        return true;
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
    }
};


export const markAllAsRead = async () => {
    try {
        const response = await axiosClient.put(`${API_BASE_URL}/mark-all-read`);
        return response.data;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
    }
};
