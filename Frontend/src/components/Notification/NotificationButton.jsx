import React, { useState, useEffect } from "react";
import { Bell, ShieldCheck } from "lucide-react";

const NotificationButton = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";

  useEffect(() => {
    // Kiểm tra xem trình duyệt đã đăng ký Push chưa
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.pushManager.getSubscription().then((sub) => {
            setIsSubscribed(!!sub);
          });
        })
        .catch((err) => {
          console.error("Service Worker not ready:", err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Logic Đăng ký Web Push (Kết nối với WebPushController.java)
  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // Kiểm tra hỗ trợ Service Worker và Push API
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Worker is not supported in this browser");
      }
      if (!("PushManager" in window)) {
        throw new Error("Push API is not supported in this browser");
      }

      // Lấy Public Key từ Backend
      const keyRes = await fetch(
        `${API_BASE_URL}/v1/notifications/web-push/public-key`
      );
      if (!keyRes.ok) {
        throw new Error(`Failed to fetch public key: ${keyRes.status}`);
      }
      const publicKey = await keyRes.text();
      console.log("Public key received:", publicKey.substring(0, 20) + "...");

      // Đăng ký Service Worker
      const register = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      console.log("Service Worker registered successfully");

      // Yêu cầu quyền thông báo
      const permission = await Notification.requestPermission();
      console.log("Notification permission:", permission);

      if (permission === "granted") {
        // Đăng ký Push subscription
        const subscription = await register.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        console.log("Push subscription created:", subscription);

        // Lưu subscription vào DB qua Backend
        const response = await fetch(
          `${API_BASE_URL}/v1/notifications/web-push/subscribe`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(subscription),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to save subscription: ${response.status}`);
        }

        setIsSubscribed(true);
        alert("Đã bật thông báo thành công!");
      } else {
        alert("Bạn cần cấp quyền thông báo để sử dụng tính năng này");
      }
    } catch (error) {
      console.error("Push registration failed:", error);
      alert(`Lỗi khi đăng ký thông báo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Convert VAPID key
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
  }

  return (
    <div>
      {/* Nút bật/tắt Web Push trong Settings */}
      <button
        onClick={handleSubscribe}
        disabled={isSubscribed || loading}
        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
          isSubscribed
            ? "bg-emerald-50 text-emerald-600 cursor-default"
            : "bg-deep-forest text-white hover:bg-deep-forest/90 shadow-md shadow-deep-forest/20"
        }`}
      >
        {loading ? (
          "Processing..."
        ) : isSubscribed ? (
          <>
            <ShieldCheck className="h-4 w-4" /> Push Notifications Enabled
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" /> Enable Browser Notifications
          </>
        )}
      </button>
    </div>
  );
};

export default NotificationButton;
