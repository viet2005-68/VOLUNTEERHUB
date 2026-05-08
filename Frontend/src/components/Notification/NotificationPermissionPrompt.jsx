import React, { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

const NotificationPermissionPrompt = () => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    const checkPermissionStatus = async () => {
      // Don't show if user already dismissed
      const dismissed = localStorage.getItem("notificationPromptDismissed");
      if (dismissed === "true") {
        return;
      }

      // Don't show if permission already granted or denied
      if (!("Notification" in window)) {
        return;
      }

      const permission = Notification.permission;
      if (permission !== "default") {
        return;
      }

      // Check if already subscribed
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            return;
          }
        } catch (error) {
          console.error("Error checking subscription:", error);
        }
      }

      // Show prompt after a short delay
      setTimeout(() => setShow(true), 2000);
    };

    checkPermissionStatus();
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        // Register service worker if not already registered
        let registration;
        if ("serviceWorker" in navigator) {
          registration = await navigator.serviceWorker.register("/sw.js");
          await navigator.serviceWorker.ready;
        }

        // Get public key from backend (full gateway URL — not same-origin /api/...)
        const apiBase =
          import.meta.env.VITE_API_URL || "http://localhost:8080/api";
        const keyRes = await fetch(
          `${apiBase}/v1/notifications/web-push/public-key`
        );
        const publicKey = await keyRes.text();

        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        // Save subscription to backend
        await fetch(`${apiBase}/v1/notifications/web-push/subscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(subscription),
        });

        setShow(false);
        localStorage.setItem("notificationPromptDismissed", "true");
      } else {
        // User denied permission
        setShow(false);
        localStorage.setItem("notificationPromptDismissed", "true");
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("notificationPromptDismissed", "true");
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <div className="relative rounded-2xl border border-blue-200 bg-white p-6 shadow-2xl shadow-blue-500/20 animate-in slide-in-from-bottom-5 duration-300">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-3">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">
              Stay Updated!
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Enable notifications to get instant updates about event approvals,
              new opportunities, and important messages.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleEnable}
                disabled={loading}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition hover:from-blue-600 hover:to-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Enabling..." : "Enable Notifications"}
              </button>
              <button
                onClick={handleDismiss}
                disabled={loading}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionPrompt;
