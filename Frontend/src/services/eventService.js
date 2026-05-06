import axiosClient from "./axiosClient";

/** Relative to axios baseURL `.../api` — do not prefix with `api/v1` or URL becomes `/api/api/v1/...` */
const EVENT_BASE_URL = "/v1/events";
const EVENT_AGGREGATED_BASE_URL = "/v1/aggregated/events";


export const getEvents = async (params = {}) => {
    console.log("params", params);
    const response = await axiosClient.get(EVENT_AGGREGATED_BASE_URL, { params });
    console.log('Events API response:', response);

    // Handle paginated response structure from API

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

    // Fallback for simple array response
    const data = Array.isArray(response) ? response : (response.data || []);


    return {
        data: data,
        meta: {
            totalPages: 1,
            totalElements: data.length,
            currentPage: 0,
            pageSize: data.length
        }
    };
};

export const getOwnedEvents = async (params = {}) => {
    const response = await axiosClient.get(`${EVENT_AGGREGATED_BASE_URL}/owned`, { params });
    console.log('Owned Events API response:', response);

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

    // Fallback for simple array response
    const data = Array.isArray(response) ? response : (response.data || []);
    console.log('Processed owned data:', data);

    return {
        data: data,
        meta: {
            totalPages: 1,
            totalElements: data.length,
            currentPage: 0,
            pageSize: data.length
        }
    };
};

export const getEventById = async (eventId) => {
    if (!eventId) {
        throw new Error("eventId is required to fetch event details");
    }
    const response = await axiosClient.get(`${EVENT_AGGREGATED_BASE_URL}/${eventId}`);
    return response;
};

export const createEvent = async (payload) => {
    console.log("Creating event with payload:", payload);
    const response = await axiosClient.post(EVENT_BASE_URL, payload);
    return response;
};

export const updateEvent = async (eventId, payload) => {
    if (!eventId) {
        throw new Error("eventId is required to update an event");
    }
    // If caller already built FormData, send it as-is
    if (payload instanceof FormData) {
        const response = await axiosClient.put(`${EVENT_BASE_URL}/${eventId}`, payload);
        return response;
    }

    // Otherwise build FormData similar to createEvent: eventRequest JSON + optional imageFile
    const formData = new FormData();

    // Allow callers to pass either a flat payload or an object with eventRequest
    const { imageFile, eventRequest, ...rest } = payload || {};
    const body = eventRequest || rest || {};

    formData.append(
        "eventRequest",
        new Blob([JSON.stringify(body)], { type: "application/json" })
    );

    if (imageFile) {
        const fileToSend = Array.isArray(imageFile)
            ? imageFile[0]
            : imageFile?.[0] || imageFile;
        if (fileToSend) {
            formData.append("imageFile", fileToSend);
        }
    }

    const response = await axiosClient.put(`${EVENT_BASE_URL}/${eventId}`, formData);
    return response;
};

export const deleteEvent = async (eventId) => {
    if (!eventId) {
        throw new Error("eventId is required to delete an event");
    }
    const response = await axiosClient.delete(`${EVENT_BASE_URL}/${eventId}`);
    return response;
};

export const approveEvent = async (eventId) => {
    if (!eventId) {
        throw new Error("eventId is required to approve an event");
    }
    const response = await axiosClient.put(`${EVENT_BASE_URL}/${eventId}/approve`);
    return response;
};

export const rejectEvent = async (eventId, reason) => {
    if (!eventId) {
        throw new Error("eventId is required to reject an event");
    }
    const response = await axiosClient.put(`${EVENT_BASE_URL}/${eventId}/reject`, {
        reason: reason || "No reason provided"
    });
    return response;
}

export const searchEventByName = async (params = {}) => {
    const { keyword, pageNum = 0, pageSize = 6, status } = params;
    const response = await axiosClient.get(`${EVENT_AGGREGATED_BASE_URL}/search`, {
        params: { keyword, pageNum, pageSize, status }
    });
    console.log('Search API response:', response);

    // API trả về: { content, totalElements, totalPages, number, size }
    // Transform thành format thống nhất với getEvents
    if (response.content !== undefined) {
        return {
            data: response.content,
            meta: {
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0,
                currentPage: response.number || 0,
                pageSize: response.size || pageSize
            }
        };
    }

    return {
        data: [],
        meta: { totalPages: 0, totalElements: 0, currentPage: 0, pageSize }
    };
};

export const searchEventByNameForManager = async (params = {}) => {
    const { keyword, pageNum = 0, pageSize = 6 } = params;
    const response = await axiosClient.get(`/v1/aggregated/events/owned/search`, {
        params: { keyword, pageNum, pageSize }
    });
    console.log('Search API response:', response);

    // API trả về: { content, totalElements, totalPages, number, size }
    // Transform thành format thống nhất với getEvents
    if (response.content !== undefined) {
        return {
            data: response.content,
            meta: {
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0,
                currentPage: response.number || 0,
                pageSize: response.size || pageSize
            }
        };
    }

    return {
        data: [],
        meta: { totalPages: 0, totalElements: 0, currentPage: 0, pageSize }
    };
};

export const cancelEventRegistration = async (eventId) => {
    if (!eventId) {
        throw new Error("eventId is required to cancel event registration");
    }

    // Set registration deadline to 1 minute before current time
    // Format as LocalDateTime (yyyy-MM-ddTHH:mm) without timezone and seconds
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Format to yyyy-MM-ddTHH:mm (LocalDateTime format for Java - no seconds)
    const year = oneMinuteAgo.getFullYear();
    const month = String(oneMinuteAgo.getMonth() + 1).padStart(2, '0');
    const day = String(oneMinuteAgo.getDate()).padStart(2, '0');
    const hours = String(oneMinuteAgo.getHours()).padStart(2, '0');
    const minutes = String(oneMinuteAgo.getMinutes()).padStart(2, '0');

    const registrationDeadline = `${year}-${month}-${day}T${hours}:${minutes}`;

    const payload = {
        registrationDeadline
    };

    const formData = new FormData();
    formData.append(
        "eventRequest",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
    );

    const response = await axiosClient.put(`${EVENT_BASE_URL}/${eventId}`, formData);
    return response;
};

export const getTrendingEvents = async (params = {}) => {
    const { days = 30, pageNum = 0, pageSize = 10 } = params;
    const response = await axiosClient.get(`${EVENT_AGGREGATED_BASE_URL}/trending`, {
        params: { days, pageNum, pageSize }
    });
    console.log('Trending Events API response:', response);

    // Handle paginated response structure
    if (response.content !== undefined) {
        return {
            data: response.content,
            meta: {
                totalPages: response.totalPages || 0,
                totalElements: response.totalElements || 0,
                currentPage: response.number || 0,
                pageSize: response.size || pageSize
            }
        };
    }

    // Fallback for simple array response
    const data = Array.isArray(response) ? response : (response.data || []);

    return {
        data: data,
        meta: {
            totalPages: 1,
            totalElements: data.length,
            currentPage: 0,
            pageSize: data.length
        }
    };
};