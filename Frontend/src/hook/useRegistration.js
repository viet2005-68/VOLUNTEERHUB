import {
    approveRegistration,
    checkUserParticipation,
    getAggregatedRegistrations,
    listUserAllEventManagement,
    listUserOfAnEvent,
    listUserOfAnEventAprovedAndCompleted,
    numberOfEventRegistrations,
    registerEventList,
    registerForEvent,
    removeParticipant,
    reviewRegistration,
    unregisterFromEvent,
    UserApprovedList,
} from "../services/registrationService";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const REGISTRAION_QUERY_KEY = ["registrations"];

export const useEventRegistrations = (params) => {
    const queryClient = useQueryClient();
    const { pageNum = 0, pageSize = 10, status } = params || {};
    const query = useQuery({
        queryKey: [...REGISTRAION_QUERY_KEY, { pageNum, pageSize, status }],
        queryFn: async () => {
            const result = await registerEventList({ pageNum, pageSize, status });
            return result || { data: [], meta: { totalPages: 0, totalElements: 0 } };
        },
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        const nextPage = pageNum + 1;
        if (query.data?.meta?.totalPages > nextPage) {
            queryClient.prefetchQuery({
                queryKey: [...REGISTRAION_QUERY_KEY, { pageNum: nextPage, pageSize, status }],
                queryFn: async () => {
                    const result = await registerEventList({ pageNum: nextPage, pageSize, status });
                    return result || { data: [], meta: { totalPages: 0, totalElements: 0 } };
                },
            });
        }
    }, [query.data, pageNum, pageSize, status, queryClient]);
    return query;
};

export const useAggregatedRegistrations = (params) => {
    const queryClient = useQueryClient();
    const { pageNum = 0, pageSize = 10, status, eventName } = params || {};
    const query = useQuery({
        queryKey: [...REGISTRAION_QUERY_KEY, "aggregated", { pageNum, pageSize, status, eventName }],
        queryFn: async () => {
            const result = await getAggregatedRegistrations({ pageNum, pageSize, status, eventName });
            return result || { data: [], meta: { totalPages: 0, totalElements: 0 } };
        },
        placeholderData: keepPreviousData,
        staleTime: 1000 * 30,
        refetchInterval: 1000 * 5,
        refetchIntervalInBackground: true,
    });

    useEffect(() => {
        const nextPage = pageNum + 1;
        if (query.data?.meta?.totalPages > nextPage) {
            queryClient.prefetchQuery({
                queryKey: [...REGISTRAION_QUERY_KEY, "aggregated", { pageNum: nextPage, pageSize, status, eventName }],
                queryFn: async () => {
                    const result = await getAggregatedRegistrations({ pageNum: nextPage, pageSize, status, eventName });
                    return result || { data: [], meta: { totalPages: 0, totalElements: 0 } };
                },
            });
        }
    }, [query.data, pageNum, pageSize, status, eventName, queryClient]);
    return query;
};

export const useCheckUserParticipation = (eventId, options = {}) => {
    return useQuery({
        queryKey: [...REGISTRAION_QUERY_KEY, "participation", eventId],
        queryFn: () => checkUserParticipation(eventId),

        enabled: !!eventId,
        refetchOnMount: false, // Don't refetch on component mount if data exists
        refetchOnWindowFocus: false, // Don't refetch on window focus
        refetchOnReconnect: false, // Don't refetch on reconnect
        retry: 1, // Only retry once on failure
        ...options, // Allow overriding options
    });
};

export const useRegisterForEvent = (options = {}) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (eventId) => registerForEvent(eventId),
        onSuccess: (data, eventId, context) => {
            toast.success("Registered successfully.");
            queryClient.invalidateQueries(REGISTRAION_QUERY_KEY);
            queryClient.invalidateQueries([...REGISTRAION_QUERY_KEY, "participation", eventId]);
            options.onSuccess?.(data, eventId, context);
        },
        onError: (error, variables, context) => {
            const message = error?.response?.data?.message || error.message || "Failed to register";
            toast.error(message);
            options.onError?.(error, variables, context);
        },
        onSettled: options.onSettled,
    });
};

export const useUnregisterFromEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (eventId) => unregisterFromEvent(eventId),
        onMutate: async (eventId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: REGISTRAION_QUERY_KEY });

            // Snapshot the previous value
            const previousData = queryClient.getQueriesData({ queryKey: REGISTRAION_QUERY_KEY });

            // Optimistically update - remove the registration from all queries
            queryClient.setQueriesData({ queryKey: REGISTRAION_QUERY_KEY }, (old) => {
                if (!old) return old;

                // Handle paginated data structure
                if (old.data && Array.isArray(old.data)) {
                    return {
                        ...old,
                        data: old.data.filter((item) => {
                            const itemEventId = item.event?.id || item.eventId;
                            return itemEventId !== eventId;
                        }),
                        meta: {
                            ...old.meta,
                            totalElements: Math.max(0, (old.meta?.totalElements || 0) - 1),
                        },
                    };
                }

                // Handle simple array structure
                if (Array.isArray(old)) {
                    return old.filter((item) => {
                        const itemEventId = item.event?.id || item.eventId;
                        return itemEventId !== eventId;
                    });
                }

                return old;
            });

            return { previousData };
        },
        onSuccess: (_, eventId) => {
            toast.success("Registration cancelled successfully.");
            // Invalidate to ensure fresh data
            queryClient.invalidateQueries({ queryKey: REGISTRAION_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: [...REGISTRAION_QUERY_KEY, "participation", eventId] });
        },
        onError: (error, eventId, context) => {
            // Rollback on error
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            const message = error?.response?.data?.message || error.message || "Failed to cancel registration";
            toast.error(message);
        },
        onSettled: () => {
            // Always refetch after mutation
            queryClient.invalidateQueries({ queryKey: REGISTRAION_QUERY_KEY });
        },
    });
};

export const useApproveRegistration = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (eventId) => approveRegistration(eventId),
        onSuccess: (_, eventId) => {
            toast.success("Approved successfully.");
            queryClient.invalidateQueries(REGISTRAION_QUERY_KEY);
            queryClient.invalidateQueries([...REGISTRAION_QUERY_KEY, "participation", eventId]);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || error.message || "Failed to approve";
            toast.error(message);
        },
    });
};

export const useUserIdList = (eventIid) => {
    return useQuery({
        queryKey: [...REGISTRAION_QUERY_KEY, "userList", eventIid],
        queryFn: () => listUserOfAnEvent(eventIid),
        staleTime: 5 * 60 * 1000,
        enabled: !!eventIid,
    });
};

export const useListUserOfAnEvent = (eventId, params) => {
    return useQuery({
        queryKey: [...REGISTRAION_QUERY_KEY, "users", eventId, JSON.stringify(params)],
        queryFn: async () => {
            const result = await listUserOfAnEvent(eventId, params);
            return result || { data: [], meta: { totalPages: 0, totalElements: 0 } };
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!eventId,
        placeholderData: keepPreviousData,
        retry: false,
    });
};

export const useListUserOfAnEventApproveAndCompleted = (eventId, params) => {
    return useQuery({
        queryKey: [...REGISTRAION_QUERY_KEY, "usersApproveAndCompleted", eventId, JSON.stringify(params)],
        queryFn: async () => {
            const result = await listUserOfAnEventAprovedAndCompleted(eventId, params);
            return result || { data: [], meta: { totalPages: 0, totalElements: 0 } };
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!eventId,
        placeholderData: keepPreviousData,
        retry: false,
    });
};

export const useNumberOfEventRegistrations = (eventId) => {
    return useQuery({
        queryKey: [...REGISTRAION_QUERY_KEY, "numberOfRegistrations", eventId],
        queryFn: () => numberOfEventRegistrations(eventId),
        staleTime: 5 * 60 * 1000,
        enabled: !!eventId,
    });
};

export const useReviewRegistration = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ eventId, participantId, status, note }) =>
            reviewRegistration(eventId, participantId, status, note),
        onSuccess: (data, variables) => {
            // If status is provided, show status-specific message
            // Otherwise, show generic update message (for note-only updates)
            const statusText = variables.status
                ? variables.status === "APPROVED" ? "approved" :
                    variables.status === "REJECTED" ? "rejected" :
                        variables.status === "COMPLETED" ? "completed" : "updated"
                : "note updated";
            toast.success(`Registration ${statusText} successfully.`);
            queryClient.invalidateQueries(REGISTRAION_QUERY_KEY);
            queryClient.invalidateQueries([...REGISTRAION_QUERY_KEY, "manager"]);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || error.message || "Failed to review registration";
            toast.error(message);
        },
    });
};

export const useRemoveParticipant = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ eventId, participantId }) =>
            removeParticipant(eventId, participantId),
        onSuccess: () => {
            toast.success("Participant removed successfully.");
            queryClient.invalidateQueries(REGISTRAION_QUERY_KEY);
        },
        onError: (error) => {
            const message = error?.response?.data?.message || error.message || "Failed to remove participant";
            toast.error(message);
        },
    });
};

export const useConstUserApprovedList = (eventId) => {
    return useQuery({
        queryKey: [...REGISTRAION_QUERY_KEY, "constUserApprovedList", eventId],
        queryFn: () => UserApprovedList(eventId),
        staleTime: 5 * 60 * 1000,
        enabled: !!eventId,
    });
};

export const useAllRegistrationForManager = ({
    page = 1,
    pageSize = 10,
    search = "",
    status = "all",
    event = "all",
} = {}) => {
    const normalizedStatus = status?.toUpperCase() || "ALL";
    const normalizedSearch = search?.toLowerCase() || "";
    const normalizedEvent = event?.toLowerCase() || "all";

    const query = useQuery({
        queryKey: [...REGISTRAION_QUERY_KEY, "manager"],
        queryFn: async () => {
            const response = await listUserAllEventManagement();
            return Array.isArray(response) ? response : [];
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    const paginatedData = useMemo(() => {
        const allRegistrations = Array.isArray(query.data) ? query.data : [];

        const filtered = allRegistrations.filter((registration) => {
            const matchesStatus =
                normalizedStatus === "ALL" ||
                registration.status?.toUpperCase() === normalizedStatus;

            const matchesEvent =
                normalizedEvent === "all" ||
                registration.eventName?.toLowerCase() === normalizedEvent ||
                String(registration.eventId) === normalizedEvent;

            const matchesSearch =
                !normalizedSearch ||
                registration.fullName?.toLowerCase().includes(normalizedSearch) ||
                registration.email?.toLowerCase().includes(normalizedSearch) ||
                registration.username?.toLowerCase().includes(normalizedSearch) ||
                registration.eventName?.toLowerCase().includes(normalizedSearch);

            return matchesStatus && matchesEvent && matchesSearch;
        });

        const totalItems = filtered.length;
        const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 0;
        const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
        const start = (safePage - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize).map((item) => ({
            ...item,
            userId: item.id || item.userId,
            registrationId: item.registrationId || item.id,
            registrationStatus: item.status,
        }));

        const eventOptions = allRegistrations
            .map((item) => item.eventName)
            .filter(Boolean);

        return {
            items,
            totalItems,
            totalPages,
            page: safePage,
            pageSize,
            eventOptions: Array.from(new Set(eventOptions)),
        };
    }, [query.data, normalizedEvent, normalizedSearch, normalizedStatus, page, pageSize]);

    return { ...query, data: paginatedData, rawData: query.data };
};

export const useUpcomingApprovedRegistrations = ({ pageSize = 3, status = "APPROVED", eventName, sortedBy = "date", order = "desc" } = {}) => {
    return useQuery({
        queryKey: [...REGISTRAION_QUERY_KEY, "aggregated", "upcomingApproved", { pageNum: 0, pageSize, status, eventName, sortedBy, order }],
        queryFn: async () => {
            const result = await getAggregatedRegistrations({ pageNum: 0, pageSize, status, eventName, sortedBy, order });
            return result || { data: [], meta: { totalPages: 0, totalElements: 0 } };
        },
        placeholderData: keepPreviousData,
        retry: false,
        staleTime: 1000 * 30,
        refetchIntervalInBackground: true,
    });
};

export const useRecentPendingRegistrations = (params = {}) => {
    const { pageSize = 3, sortedBy = "date", order = "desc" } = params;

    return useQuery({
        queryKey: [...REGISTRAION_QUERY_KEY, "aggregated", "pending", { pageNum: 0, pageSize, status: "PENDING", sortedBy, order }],
        queryFn: async () => {
            const result = await getAggregatedRegistrations({ pageNum: 0, pageSize, status: "PENDING", sortedBy, order });
            return result || { data: [], meta: { totalPages: 0, totalElements: 0 } };
        },
        placeholderData: keepPreviousData,
        retry: false,
        staleTime: 1000 * 30,
        refetchIntervalInBackground: true,
    });
};

export const usePendingRegistrationsTop3ByNameAsc = ({ event = "all" } = {}) => {
    const query = useQuery({
        queryKey: [...REGISTRAION_QUERY_KEY, "manager", "pendingTop3ByNameAsc", { event }],
        queryFn: async () => {
            const response = await listUserAllEventManagement();
            return Array.isArray(response) ? response : [];
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
        refetchInterval: 1000 * 60 * 5,
        retry: false,
        refetchIntervalInBackground: true,
    });

    const computed = useMemo(() => {
        const source = Array.isArray(query.data) ? query.data : [];

        const filtered = source.filter((registration) => {
            const matchesStatus = registration.status?.toUpperCase() === "PENDING";
            const normalizedEvent = event?.toLowerCase() || "all";
            const matchesEvent =
                normalizedEvent === "all" ||
                registration.eventName?.toLowerCase() === normalizedEvent ||
                String(registration.eventId) === normalizedEvent;
            return matchesStatus && matchesEvent;
        });

        const sortKey = (r) =>
            (r.fullName?.toLowerCase()) ||
            (r.username?.toLowerCase()) ||
            (r.eventName?.toLowerCase()) || "";
        const sorted = filtered.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));

        const items = sorted.slice(0, 3).map((item) => ({
            ...item,
            userId: item.id || item.userId,
            registrationId: item.registrationId || item.id,
            registrationStatus: item.status,
        }));

        return {
            items,
            totalItems: filtered.length,
            totalPages: 1,
            page: 1,
            pageSize: 3,
        };
    }, [query.data, event]);

    return { ...query, data: computed, rawData: query.data };
};
