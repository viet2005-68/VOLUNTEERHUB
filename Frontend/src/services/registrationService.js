
import axiosClient from "./axiosClient";
const REGISTRATION_BASE_URL = "/v1/registrations";
const AGGREGATED_REGISTRATION_BASE_URL = "/v1/aggregated/registrations";
const AGGREGATED_EVENT_BASE_URL = "/v1/aggregated/events";
export const registerEventList = async (params) => {
    try {
        console.log('API call with params:', params);
        const response = await axiosClient.get(`${REGISTRATION_BASE_URL}`, { params });
        console.log('API response:', response);

        const data = response.data || [];
        return {
            data: data,
            meta: {
                totalElements: data.length,
                totalPages: 1,
                pageNum: params.pageNum || 0,
                pageSize: params.pageSize || data.length
            }
        };
    } catch (error) {
        console.error("Error fetching registered events:", error);
        throw error;
    }
};

export const getAggregatedRegistrations = async (params = {}) => {
    try {
        const response = await axiosClient.get(`${AGGREGATED_REGISTRATION_BASE_URL}`, { params });
        console.log("Aggregated registrations response:", response);

        // Handle paginated response: { content, totalElements, totalPages, number, size }
        if (response.content !== undefined) {
            return {
                data: response.content,
                meta: {
                    totalPages: response.totalPages || 0,
                    totalElements: response.totalElements || 0,
                    currentPage: response.number || 0,
                    pageSize: response.size || params.pageSize || 10
                }
            };
        }

        // Fallback for array response
        const data = Array.isArray(response) ? response : [];
        return {
            data: data,
            meta: {
                totalPages: 1,
                totalElements: data.length,
                currentPage: 0,
                pageSize: data.length
            }
        };
    } catch (error) {
        console.error("Error fetching aggregated registrations:", error);
        throw error;
    }
};

export const checkUserParticipation = async (eventId) => {
    try {
        const response = await axiosClient.get(`${REGISTRATION_BASE_URL}/events/${eventId}/status`);
        return response;
    } catch (error) {
        console.error("Error checking user participation:", error);
        throw error;
    }
};
// export const listUserOfAnEvent = async (eventId, params) => {
//     try {
//         const response = await axiosClient.get(`/v1/aggregated/registrations/events/${eventId}`, { params });
//         console.log("Participant list response:", response);
//         return response;
//     } catch (error) {
//         // Only log non-permission errors
//         if (error?.response?.status !== 403 && error?.response?.status !== 500) {
//             console.error("Error fetching participant list:", error);
//         }
//         throw error;
//     }
// };

export const listUserOfAnEvent = async (eventId, params = {}) => {
    try {
        const response = await axiosClient.get(`/v1/aggregated/registrations/events/${eventId}`, { params });
        console.log("Participant list response:", response);

        // Handle paginated response: { content, totalElements, totalPages, number, size }
        if (response.content !== undefined) {
            return {
                data: response.content,
                meta: {
                    totalPages: response.totalPages || 0,
                    totalElements: response.totalElements || 0,
                    currentPage: response.number || 0,
                    pageSize: response.size || params.pageSize || 10
                }
            };
        }

        // Fallback for array response
        const data = Array.isArray(response) ? response : [];
        return {
            data: data,
            meta: {
                totalPages: 1,
                totalElements: data.length,
                currentPage: 0,
                pageSize: data.length
            }
        };
    } catch (error) {
        // Only log non-permission errors
        if (error?.response?.status !== 403 && error?.response?.status !== 500) {
            console.error("Error fetching participant list:", error);
        }
        throw error;
    }
};


export const listUserOfAnEventAprovedAndCompleted = async (eventId, params = {}) => {
    try {
        const response = await axiosClient.get(`/v1/aggregated/registrations/events/${eventId}/participants`, { params });
        console.log("Participant list response:", response);

        // Handle paginated response: { content, totalElements, totalPages, number, size }
        if (response.content !== undefined) {
            return {
                data: response.content,
                meta: {
                    totalPages: response.totalPages || 0,
                    totalElements: response.totalElements || 0,
                    currentPage: response.number || 0,
                    pageSize: response.size || params.pageSize || 10
                }
            };
        }

        // Fallback for array response
        const data = Array.isArray(response) ? response : [];
        return {
            data: data,
            meta: {
                totalPages: 1,
                totalElements: data.length,
                currentPage: 0,
                pageSize: data.length
            }
        };
    } catch (error) {
        // Only log non-permission errors
        if (error?.response?.status !== 403 && error?.response?.status !== 500) {
            console.error("Error fetching participant list:", error);
        }
        throw error;
    }
};

export const numberOfEventRegistrations = async (eventId) => {
    try {
        const response = await axiosClient.get(`${REGISTRATION_BASE_URL}/event/${eventId}/current-registration`);
        return response.data;
    } catch (error) {
        console.error("Error fetching number of registrations:", error);
        throw error;
    }
};

export const registerForEvent = async (eventId) => {
    try {
        const response = await axiosClient.post(`${REGISTRATION_BASE_URL}/events/${eventId}`);
        return response.data;
    } catch (error) {
        console.error("Error registering for event:", error);
        throw error;
    }
};
export const unregisterFromEvent = async (eventId) => {
    try {
        const response = await axiosClient.delete(`${REGISTRATION_BASE_URL}/events/${eventId}`);
        return response.data;
    } catch (error) {
        console.error("Error unregistering from event:", error);
        throw error;
    }
};

export const approveRegistration = async (eventId) => {
    try {
        const response = await axiosClient.post(`${REGISTRATION_BASE_URL}/events/${eventId}`);
        return response.data;
    } catch (error) {
        console.error("Error approving registration for event:", error);
        throw error;
    }
};

export const reviewRegistration = async (eventId, participantId, status, note = null) => {
    try {
        const response = await axiosClient.put(
            `${REGISTRATION_BASE_URL}/events/${eventId}/participants/${participantId}`,
            { status, note }
        );
        return response.data;
    } catch (error) {
        console.error("Error reviewing registration:", error);
        throw error;
    }
};

export const removeParticipant = async (eventId, participantId) => {
    try {
        const response = await axiosClient.delete(
            `${REGISTRATION_BASE_URL}/events/${eventId}/participants/${participantId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error removing participant:", error);
        throw error;
    }
};

export const constUserIdList = async (eventId) => {
    try {
        const response = await axiosClient.get(`${REGISTRATION_BASE_URL}/events/${eventId}/participant-ids`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user IDs for event:", error);
        throw error;
    }
};

export const UserApprovedList = async (eventId) => {
    try {
        const response = await axiosClient.get(`${AGGREGATED_EVENT_BASE_URL}/${eventId}/users`);
        return response;
    } catch (error) {
        console.error("Error fetching approved users for event:", error);
        throw error;
    }
};


export const listUserAllEventManagement = async (params) => {
    try {
        console.log('API call with params:', params);
        const response = await axiosClient.get(`/v1/aggregated/manager/registrations`, { params });
        console.log('API response:', response);
        const data = response?.data ?? response;
        if (data?.content) {
            return data.content;
        }
        if (Array.isArray(data)) {
            return data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching all event management registrations:", error);
        throw error;
    }
};