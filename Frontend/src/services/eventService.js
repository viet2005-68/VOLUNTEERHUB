import axiosClient from "./axiosClient";

/** Relative to axios baseURL `.../api` — do not prefix with `api/v1` or URL becomes `/api/api/v1/...` */
const EVENT_BASE_URL = "/v1/events";
const EVENT_AGGREGATED_BASE_URL = "/v1/aggregated/events";

const getNumber = (...values) => {
    for (const value of values) {
        if (value === null || value === undefined || value === "") continue;
        const numberValue = Number(value);
        if (Number.isFinite(numberValue)) return numberValue;
    }

    return undefined;
};

const getBoolean = (...values) => {
    for (const value of values) {
        if (typeof value === "boolean") return value;
    }

    return undefined;
};

const normalizePaginatedResponse = (response, params = {}) => {
    const payload = response?.data?.content !== undefined ? response.data : response;
    const pageMeta = payload?.page || payload?.meta || {};
    const content = Array.isArray(payload?.content)
        ? payload.content
        : Array.isArray(payload?.data?.content)
            ? payload.data.content
            : Array.isArray(payload)
                ? payload
                : Array.isArray(payload?.data)
                    ? payload.data
                    : [];
    const isSimpleArrayResponse =
        Array.isArray(payload) ||
        (Array.isArray(payload?.data) &&
            payload?.content === undefined &&
            payload?.page === undefined &&
            payload?.meta === undefined);

    const pageSize =
        getNumber(
            payload?.size,
            payload?.pageSize,
            payload?.pageable?.pageSize,
            pageMeta?.size,
            pageMeta?.pageSize,
            params.pageSize,
            content.length,
            10
        ) || 10;
    const currentPage =
        getNumber(
            payload?.number,
            payload?.pageNum,
            payload?.currentPage,
            payload?.pageable?.pageNumber,
            pageMeta?.number,
            pageMeta?.pageNum,
            pageMeta?.currentPage,
            params.pageNum,
            0
        ) || 0;
    const rawTotalElements = getNumber(
        payload?.totalElements,
        payload?.totalElement,
        payload?.totalItems,
        payload?.total,
        pageMeta?.totalElements,
        pageMeta?.totalItems,
        pageMeta?.total,
        isSimpleArrayResponse ? content.length : undefined
    );
    const rawTotalPages = getNumber(
        payload?.totalPages,
        payload?.totalPage,
        pageMeta?.totalPages,
        pageMeta?.totalPage,
        isSimpleArrayResponse ? (content.length > 0 ? 1 : 0) : undefined
    );
    const last = getBoolean(payload?.last, pageMeta?.last);
    const hasNext = getBoolean(payload?.hasNext, pageMeta?.hasNext);
    const minSeenElements = currentPage * pageSize + content.length;
    const hasExactTotal =
        rawTotalElements !== undefined &&
        !(rawTotalElements === 0 && content.length > 0);

    let totalElements = hasExactTotal ? rawTotalElements : minSeenElements;
    let totalPages;

    if (rawTotalPages && rawTotalPages > 0) {
        totalPages = rawTotalPages;
    } else if (content.length === 0) {
        totalPages = currentPage === 0 ? 0 : currentPage;
    } else if (last === true || content.length < pageSize) {
        totalPages = currentPage + 1;
    } else if (hasNext === true || last === false || content.length === pageSize) {
        totalPages = currentPage + 2;
    } else {
        totalPages = Math.ceil(totalElements / pageSize);
    }

    if (content.length > 0) {
        totalElements = Math.max(totalElements, minSeenElements);
        totalPages = Math.max(totalPages, currentPage + 1);
    }

    return {
        data: content,
        meta: {
            totalPages,
            totalElements,
            currentPage,
            pageSize,
            hasExactTotal,
        },
    };
};


export const getEvents = async (params = {}) => {
    console.log("params", params);
    const response = await axiosClient.get(EVENT_AGGREGATED_BASE_URL, { params });
    console.log('Events API response:', response);

    return normalizePaginatedResponse(response, params);
};

export const getOwnedEvents = async (params = {}) => {
    const response = await axiosClient.get(`${EVENT_AGGREGATED_BASE_URL}/owned`, { params });
    console.log('Owned Events API response:', response);

    return normalizePaginatedResponse(response, params);
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

    return normalizePaginatedResponse(response, { ...params, pageNum, pageSize });
};

export const searchEventByNameForManager = async (params = {}) => {
    const { keyword, pageNum = 0, pageSize = 6 } = params;
    const response = await axiosClient.get(`/v1/aggregated/events/owned/search`, {
        params: { keyword, pageNum, pageSize }
    });
    console.log('Search API response:', response);

    return normalizePaginatedResponse(response, { ...params, pageNum, pageSize });
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

    return normalizePaginatedResponse(response, { ...params, pageNum, pageSize });
};
