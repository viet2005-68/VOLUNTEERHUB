import React from "react";
import {
  Bell,
  Calendar,
  Check,
  CheckLine,
  Tag,
  Trash,
  View,
  MessageCircle,
  Heart,
  UserCheck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  useMarkAsRead,
  useDeleteNotification,
} from "../../hook/useNotification";
import {
  confirmDelete,
  showSuccess,
  showError,
} from "../../utils/confirmDialog";

function NotificationCard({ noti }) {
  console.log("Rendering NotificationCard for:", noti);

  const navigate = useNavigate();
  const markAsReadMutation = useMarkAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // Format time from array [year, month, day, hour, minute]
  const formatTime = (timeArray) => {
    if (!timeArray || !Array.isArray(timeArray)) return "";
    const [year, month, day, hour, minute] = timeArray;
    const date = new Date(year, month - 1, day, hour, minute);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsReadMutation.mutateAsync(id);
      toast.success("Marked as read");
    } catch (error) {
      toast.error("Failed to mark as read");
      console.error("Error marking as read:", error);
    }
  };

  const handleDelete = async (id) => {
    const result = await confirmDelete(
      "this notification",
      "This action cannot be undone."
    );

    if (result.isConfirmed) {
      try {
        await deleteNotificationMutation.mutateAsync(id);
        showSuccess("Deleted!", "Notification has been deleted successfully.");
      } catch (error) {
        showError("Error!", "Failed to delete notification. Please try again.");
        console.error("Error deleting notification:", error);
      }
    }
  };

  // Format created at timestamp
  const formatCreatedAt = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get navigation path based on notification type
  const getNavigationPath = () => {
    const { type, contextId, id } = noti;

    switch (type) {
      case "EVENT_REQUESTED":
        // For EVENT_REQUESTED, contextId is the event ID
        return `/dashboard/eventAdminManager`;

      case "EVENT_REJECTED":
        return `/dashboard/eventmanager`;
      case "EVENT_APPROVED":
      case "EVENT_UPDATED":
        return `/opportunities/overview/${contextId}`;
      case "USER_EVENT_APPROVED":
      case "USER_EVENT_REJECTED":
      case "USER_EVENT_COMPLETED":
        return `/opportunities/overview/${contextId}`;

      case "USER_EVENT_REQUESTED":
        return `/dashboard/eventmanager/${id}/verify-registration`;

      case "POST_CREATED":
      case "POST_UPDATED":
      case "COMMENT":
      case "REACTION":
        return null;

      case "USER_ACTIVE":
      case "USER_BANNED":
        return `/Setting`;

      default:
        return null;
    }
  };

  // Generate notification message based on type and payload
  const getNotificationMessage = () => {
    const { type, payload } = noti;

    switch (type) {
      case "EVENT_REQUESTED":
        return {
          title: "New Event Request",
          content: `"${payload?.name}" in ${payload?.category} category`,
          detail: `${formatTime(payload?.start_time)} - ${formatTime(
            payload?.end_time
          )}`,
          icon: AlertCircle,
          iconColor: "bg-orange-500",
        };

      case "EVENT_APPROVED":
        return {
          title: "Event Approved",
          content: `Your event "${payload?.name}" has been approved`,
          detail: payload?.approved_time
            ? `Approved at ${formatTime(payload.approved_time)}`
            : null,
          icon: CheckCircle,
          iconColor: "bg-green-500",
        };

      case "EVENT_REJECTED":
        return {
          title: "Event Rejected",
          content: `Your event "${payload?.name}" was rejected`,
          detail: null,
          icon: AlertCircle,
          iconColor: "bg-red-500",
        };

      case "EVENT_UPDATED":
        return {
          title: "Event Updated",
          content: `Event has been updated`,
          detail: payload?.updated_fields?.name
            ? `"${payload.updated_fields.name}"`
            : null,
          icon: Bell,
          iconColor: "bg-blue-500",
        };

      case "EVENT_DELETED":
        return {
          title: "Event Deleted",
          content: `An event has been deleted`,
          detail: null,
          icon: Trash,
          iconColor: "bg-red-500",
        };

      case "USER_EVENT_APPROVED":
        return {
          title: "Registration Approved",
          content: `Your registration has been approved`,
          detail: payload?.reviewed_at
            ? `Reviewed at ${formatTime(payload.reviewed_at)}`
            : null,
          icon: CheckCircle,
          iconColor: "bg-green-500",
        };

      case "USER_EVENT_REJECTED":
        return {
          title: "Registration Rejected",
          content: `Your registration has been rejected`,
          detail: null,
          icon: AlertCircle,
          iconColor: "bg-red-500",
        };

      case "USER_EVENT_COMPLETED":
        return {
          title: "Event Completed",
          content: `You have completed an event`,
          detail: null,
          icon: CheckCircle,
          iconColor: "bg-green-500",
        };

      case "USER_EVENT_REQUESTED":
        return {
          title: "New Registration Request",
          content: `Someone requested to join your event`,
          detail: payload?.requested_at
            ? `Requested at ${formatTime(payload.requested_at)}`
            : null,
          icon: UserCheck,
          iconColor: "bg-blue-500",
        };

      case "COMMENT":
        return {
          title: "New Comment",
          content: payload?.content || "Someone commented on a post",
          detail: null,
          icon: MessageCircle,
          iconColor: "bg-purple-500",
        };

      case "REACTION":
        return {
          title: "New Reaction",
          content: "Someone reacted to your post",
          detail: null,
          icon: Heart,
          iconColor: "bg-pink-500",
        };

      case "POST_CREATED":
        return {
          title: "New Post",
          content: "A new post has been created",
          detail: null,
          icon: Bell,
          iconColor: "bg-blue-500",
        };

      case "POST_UPDATED":
        return {
          title: "Post Updated",
          content: "A post has been updated",
          detail: null,
          icon: Bell,
          iconColor: "bg-blue-500",
        };

      case "USER_ACTIVE":
        return {
          title: "Account Activated",
          content: "Your account has been activated",
          detail: null,
          icon: CheckCircle,
          iconColor: "bg-green-500",
        };

      case "USER_BANNED":
        return {
          title: "Account Suspended",
          content: "Your account has been suspended",
          detail: null,
          icon: AlertCircle,
          iconColor: "bg-red-500",
        };

      default:
        return {
          title: type || "Notification",
          content: "You have a new notification",
          detail: null,
          icon: Bell,
          iconColor: "bg-gray-500",
        };
    }
  };

  // Handle card click to navigate
  const handleCardClick = () => {
    const path = getNavigationPath();
    if (path) {
      // Mark as read when clicking
      if (!noti?.isRead) {
        handleMarkAsRead(noti?.id);
      }
      navigate(path);
    }
  };

  const message = getNotificationMessage();
  console.log("Notification message:", message);

  const IconComponent = message.icon || Bell;

  return (
    <div
      onClick={handleCardClick}
      className={`w-full px-4 py-5 max-sm:py-2 rounded-xl mb-4 border-gray-200 border shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] cursor-pointer ${
        !noti?.isRead ? "bg-blue-50 border-blue-200" : "bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            !noti?.isRead ? message.iconColor : "bg-gray-300"
          }`}
        >
          <IconComponent className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title & Badge */}
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-gray-900">
              {message.title}
            </h4>
            {!noti?.isRead && (
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            )}
          </div>

          {/* Content */}
          <p className="text-sm text-gray-600 mb-2">{message.content}</p>

          {/* Detail */}
          {message.detail && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <Calendar className="w-3 h-3" />
              <span>{message.detail}</span>
            </div>
          )}

          {/* Category */}
          {noti?.payload?.category && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <Tag className="w-3 h-3" />
              <span className="capitalize">{noti.payload.category}</span>
            </div>
          )}

          {/* Timestamp */}
          <p className="text-xs text-gray-400">
            {formatCreatedAt(noti?.createdAt)}
          </p>
        </div>
        {/* Actions */}
        <div className="flex flex-col items-start min-w-[80px]">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              handleMarkAsRead(noti?.id);
            }}
            disabled={markAsReadMutation.isPending}
            className={`${
              noti?.isRead ? "hidden" : "text-white"
            } flex items-center gap-2 mb-2 bg-blue-400 hover:bg-blue-500 transition duration-300 border px-2 py-1 rounded-lg w-full disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="w-4">
              <Check />
            </span>
            <span>{markAsReadMutation.isPending ? "..." : "Mark read"}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              handleDelete(noti?.id);
            }}
            disabled={deleteNotificationMutation.isPending}
            className="text-white bg-red-500 hover:bg-red-600 transition duration-300 flex items-center gap-2 border px-4 py-1 rounded-lg w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>
              <Trash className="w-4" />
            </span>{" "}
            <span>
              {deleteNotificationMutation.isPending ? "..." : "Delete"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationCard;
