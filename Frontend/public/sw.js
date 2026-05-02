// Service Worker for Push Notifications
self.addEventListener("push", (event) => {
    try {
        const data = event.data ? event.data.json() : {};
        const title = data.title || "VolunteerHub";
        const options = {
            body: data.body || "You have a new notification",
            icon: "/logo192.png",
            badge: "/logo192.png",
            data: {
                contextId: data.contextId,
                type: data.type,
                url: data.url || "/",
            },
            actions: [
                {
                    action: "open",
                    title: "View",
                },
                {
                    action: "close",
                    title: "Close",
                },
            ],
            requireInteraction: false,
            vibrate: [200, 100, 200],
            tag: `notification-${data.contextId || Date.now()}`,
        };

        event.waitUntil(self.registration.showNotification(title, options));
    } catch (error) {
        console.error("Error showing notification:", error);
    }
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "close") {
        return;
    }

    const data = event.notification.data;
    let url = data.url || "/";

    // Route based on notification type
    if (data.type && data.contextId) {
        switch (data.type) {
            case "EVENT_APPROVED":
            case "EVENT_REJECTED":
            case "EVENT_DELETED":
            case "EVENT_UPDATED":
                url = `/opportunities/overview/${data.contextId}`;
                break;
            case "USER_EVENT_APPROVED":
            case "USER_EVENT_REJECTED":
            case "USER_EVENT_COMPLETED":
                url = `/dashboard`;
                break;
            case "USER_EVENT_REQUESTED":
                url = `/dashboard/eventmanager/${data.id}/verify-registration`;
                break;
            case "POST_CREATED":
            case "POST_UPDATED":
            case "COMMENT":
            case "REACTION":
                url = `/opportunities/overview/${data.contextId}`;
                break;
            case "USER_ACTIVE":
            case "USER_BANNED":
                url = `/Setting`;
                break;
            default:
                url = "/";
        }
    }

    event.waitUntil(
        clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url.includes(url) && "focus" in client) {
                        return client.focus();
                    }
                }
                // If not, open a new window
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

self.addEventListener("pushsubscriptionchange", (event) => {
    console.log("Push subscription changed, re-subscribing...");
    event.waitUntil(
        self.registration.pushManager
            .subscribe(event.oldSubscription.options)
            .then((subscription) => {
                console.log("New subscription created:", subscription);
                // Get API URL from environment or use default
                const apiUrl = self.location.origin.includes('localhost')
                    ? 'http://localhost:8080/api'
                    : '/api';

                // Send new subscription to backend
                return fetch(`${apiUrl}/v1/notifications/web-push/subscribe`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(subscription),
                });
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to update subscription: ${response.status}`);
                }
                console.log("Subscription updated successfully");
            })
            .catch((error) => {
                console.error("Error updating subscription:", error);
            })
    );
});
