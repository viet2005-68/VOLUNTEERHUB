import React from "react";
import {
  Bell,
  Calendar,
  Check,
  Tag,
  Trash,
  MessageCircle,
  Heart,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
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
  const navigate = useNavigate();
  const markAsReadMutation = useMarkAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  const getNotificationImage = () => {
    const payload = noti?.payload || {};
    const imageCandidates = [
      payload.imageUrl,
      payload.image_url,
      payload.thumbnail,
      payload.thumbnailUrl,
      payload.eventImageUrl,
      payload.coverImage,
      payload.avatarUrl,
      payload.updated_fields?.imageUrl,
      payload.updated_fields?.image_url,
      Array.isArray(payload.imageUrls) ? payload.imageUrls[0] : null,
    ];

    return imageCandidates.find((value) => typeof value === "string" && value.trim());
  };

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
          iconColor: "bg-foudre-pink",
        };

      case "EVENT_APPROVED":
        return {
          title: "Event Approved",
          content: `Your event "${payload?.name}" has been approved`,
          detail: payload?.approved_time
            ? `Approved at ${formatTime(payload.approved_time)}`
            : null,
          icon: CheckCircle,
          iconColor: "bg-deep-forest",
        };

      case "EVENT_REJECTED":
        return {
          title: "Event Rejected",
          content: `Your event "${payload?.name}" was rejected`,
          detail: null,
          icon: AlertCircle,
          iconColor: "bg-foudre-pink",
        };

      case "EVENT_UPDATED":
        return {
          title: "Event Updated",
          content: `Event has been updated`,
          detail: payload?.updated_fields?.name
            ? `"${payload.updated_fields.name}"`
            : null,
          icon: Bell,
          iconColor: "bg-deep-forest",
        };

      case "EVENT_DELETED":
        return {
          title: "Event Deleted",
          content: `An event has been deleted`,
          detail: null,
          icon: Trash,
          iconColor: "bg-foudre-pink",
        };

      case "USER_EVENT_APPROVED":
        return {
          title: "Registration Approved",
          content: `Your registration has been approved`,
          detail: payload?.reviewed_at
            ? `Reviewed at ${formatTime(payload.reviewed_at)}`
            : null,
          icon: CheckCircle,
          iconColor: "bg-deep-forest",
        };

      case "USER_EVENT_REJECTED":
        return {
          title: "Registration Rejected",
          content: `Your registration has been rejected`,
          detail: null,
          icon: AlertCircle,
          iconColor: "bg-foudre-pink",
        };

      case "USER_EVENT_COMPLETED":
        return {
          title: "Event Completed",
          content: `You have completed an event`,
          detail: null,
          icon: CheckCircle,
          iconColor: "bg-deep-forest",
        };

      case "USER_EVENT_REQUESTED":
        return {
          title: "New Registration Request",
          content: `Someone requested to join your event`,
          detail: payload?.requested_at
            ? `Requested at ${formatTime(payload.requested_at)}`
            : null,
          icon: UserCheck,
          iconColor: "bg-deep-forest",
        };

      case "COMMENT":
        return {
          title: "New Comment",
          content: payload?.content || "Someone commented on a post",
          detail: null,
          icon: MessageCircle,
          iconColor: "bg-foudre-pink",
        };

      case "REACTION":
        return {
          title: "New Reaction",
          content: "Someone reacted to your post",
          detail: null,
          icon: Heart,
          iconColor: "bg-foudre-pink",
        };

      case "POST_CREATED":
        return {
          title: "New Post",
          content: "A new post has been created",
          detail: null,
          icon: Bell,
          iconColor: "bg-deep-forest",
        };

      case "POST_UPDATED":
        return {
          title: "Post Updated",
          content: "A post has been updated",
          detail: null,
          icon: Bell,
          iconColor: "bg-deep-forest",
        };

      case "USER_ACTIVE":
        return {
          title: "Account Activated",
          content: "Your account has been activated",
          detail: null,
          icon: CheckCircle,
          iconColor: "bg-deep-forest",
        };

      case "USER_BANNED":
        return {
          title: "Account Suspended",
          content: "Your account has been suspended",
          detail: null,
          icon: AlertCircle,
          iconColor: "bg-foudre-pink",
        };

      default:
        return {
          title: type || "Notification",
          content: "You have a new notification",
          detail: null,
          icon: Bell,
          iconColor: "bg-deep-forest",
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
  const IconComponent = message.icon || Bell;
  const notificationImage = getNotificationImage();

  return (
    <div
      onClick={handleCardClick}
      className={`mb-3 w-full cursor-pointer rounded-[16px] border p-3 text-deep-forest transition-colors duration-200 hover:border-bubblegum-blush hover:bg-ash-whisper/45 sm:p-4 ${
        !noti?.isRead
          ? "border-foudre-pink/35 bg-ash-whisper/70"
          : "border-deep-forest/12 bg-pale-canvas"
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="relative h-[72px] w-[96px] shrink-0 overflow-hidden rounded-[12px] border border-deep-forest/12 bg-ash-whisper">
          {notificationImage ? (
            <img
              src={notificationImage}
              alt={noti?.payload?.name || message.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${message.iconColor}`}>
              <IconComponent className="h-6 w-6 text-pale-canvas" />
            </div>
          )}
          {!notificationImage && (
            <ImageIcon className="absolute bottom-2 right-2 h-4 w-4 text-pale-canvas/75" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <h4 className="line-clamp-1 text-sm font-bold text-deep-forest sm:text-base">
              {message.title}
            </h4>
            {!noti?.isRead && (
              <div className="h-2 w-2 shrink-0 rounded-full bg-foudre-pink" />
            )}
          </div>

          <p className="mb-2 line-clamp-2 text-sm font-medium leading-[1.25] text-deep-forest/70">
            {message.content}
          </p>

          {message.detail && (
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-deep-forest/55">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{message.detail}</span>
            </div>
          )}

          {noti?.payload?.category && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-deep-forest/8 px-2.5 py-1 text-xs font-bold text-deep-forest/70">
              <Tag className="h-3.5 w-3.5" />
              <span className="capitalize">{noti.payload.category}</span>
            </div>
          )}

          <p className="text-xs font-medium text-deep-forest/45">
            {formatCreatedAt(noti?.createdAt)}
          </p>
        </div>

        <div className="flex min-w-[44px] shrink-0 flex-col items-end gap-2 sm:min-w-[96px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead(noti?.id);
            }}
            disabled={markAsReadMutation.isPending}
            className={`${
              noti?.isRead ? "hidden" : "text-pale-canvas"
            } inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-deep-forest bg-deep-forest font-bold transition-colors hover:bg-foudre-pink disabled:cursor-not-allowed disabled:opacity-50 sm:w-full sm:gap-2 sm:px-3`}
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">
              {markAsReadMutation.isPending ? "..." : "Read"}
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(noti?.id);
            }}
            disabled={deleteNotificationMutation.isPending}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-deep-forest/25 bg-pale-canvas font-bold text-deep-forest transition-colors hover:border-deep-forest hover:bg-deep-forest hover:text-pale-canvas disabled:cursor-not-allowed disabled:opacity-50 sm:w-full sm:gap-2 sm:px-3"
            title="Delete"
          >
            <Trash className="h-4 w-4" />
            <span className="hidden sm:inline">
              {deleteNotificationMutation.isPending ? "..." : "Delete"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationCard;
