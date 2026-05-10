import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification, fetchNotifications, markAllAsRead, markAsRead } from "../services/notificationService";

const NOTIFICATION_KEY = ['notifications']

// Infinite scroll hook
export const useInfiniteNotifications = (pageSize = 3) => {
    return useInfiniteQuery({
        queryKey: [...NOTIFICATION_KEY, 'infinite'],
        queryFn: ({ pageParam = 0 }) => fetchNotifications({ pageParam, pageSize }),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 1000 * 60 * 5,
        initialPageParam: 0,
    });
};

// Legacy hook (keep for backward compatibility)
export const useNotification = () => {
    return useInfiniteQuery({
        queryKey: NOTIFICATION_KEY,
        queryFn: ({ pageParam = 0 }) => fetchNotifications({ pageParam, pageSize: 10 }),
        getNextPageParam: (lastPage) => lastPage.nextPage,
        staleTime: 1000 * 60 * 5,
        initialPageParam: 0,
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAsRead,
        onSuccess: (data, notificationId) => {
            // Update infinite query cache
            queryClient.setQueryData([...NOTIFICATION_KEY, 'infinite'], (oldData) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map(page => ({
                        ...page,
                        data: page.data.map(notification =>
                            notification.id === notificationId
                                ? { ...notification, isRead: true }
                                : notification
                        )
                    }))
                };
            });

            // Also update legacy query cache
            queryClient.setQueryData(NOTIFICATION_KEY, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map(page => ({
                        ...page,
                        data: page.data.map(notification =>
                            notification.id === notificationId
                                ? { ...notification, isRead: true }
                                : notification
                        )
                    }))
                };
            });
        },
    });
};

export const useMarkAllRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            // Update infinite query cache
            queryClient.setQueryData([...NOTIFICATION_KEY, 'infinite'], (oldData) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    pages: oldData.pages.map(page => ({
                        ...page,
                        data: page.data.map(notification => ({
                            ...notification,
                            isRead: true
                        }))
                    }))
                };
            });

            // Also update legacy query cache
            queryClient.setQueryData(NOTIFICATION_KEY, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map(page => ({
                        ...page,
                        data: page.data.map(notification => ({
                            ...notification,
                            isRead: true
                        }))
                    }))
                };
            });
        },
    });
};

// const handleMarkAsRead = (notificationId) => {
//     markAsReadMutation.mutate(notificationId, {
//       onSuccess: () => {
//         console.log("Đã đánh dấu đọc");
//       },
//       onError: (error) => {
//         alert("Không thể đánh dấu đã đọc");
//       },
//     });
//   };

//   // Handler đánh dấu tất cả đã đọc
//   const handleMarkAllAsRead = () => {
//     markAllAsReadMutation.mutate(undefined, {
//       onSuccess: () => {
//         console.log("Đã đánh dấu tất cả đã đọc");
//       },
//       onError: (error) => {
//         alert("Không thể đánh dấu tất cả đã đọc");
//       },
//     });
//   };

//   // Handler xóa notification
//   const handleDelete = (notificationId) => {
//     if (window.confirm("Bạn có chắc muốn xóa thông báo này?")) {
//       deleteNotificationMutation.mutate(notificationId, {
//         onSuccess: () => {
//           console.log("Đã xóa thông báo");
//         },
//         onError: (error) => {
//           alert("Không thể xóa thông báo");
//         },
//       });
//     }
//   };

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteNotification,
        onSuccess: (data, notificationId) => {
            // Update infinite query cache
            queryClient.setQueryData([...NOTIFICATION_KEY, 'infinite'], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map(page => ({
                        ...page,
                        data: page.data.filter(notification => notification.id !== notificationId)
                    }))
                };
            }
            );
            // Also update legacy query cache
            queryClient.setQueryData(NOTIFICATION_KEY, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map(page => ({
                        ...page,
                        data: page.data.filter(notification => notification.id !== notificationId)
                    }))
                };
            }
            );
        },
    });
}