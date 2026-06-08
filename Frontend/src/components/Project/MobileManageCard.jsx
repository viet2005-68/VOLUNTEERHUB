import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Users,
  Ban,
  Eye,
} from "lucide-react";
import { useDeleteEvent } from "../../hook/useEvent";
import {
  confirmCancel,
  confirmDelete,
  showError,
} from "../../utils/confirmDialog";
import {
  EVENT_STATUS,
  getStatusColor,
  STATUS_CONFIG,
  canCancelEvent,
} from "../../constant/eventStatus";

function MobileManageCard({ data, onCancelEvent, onEdit, onView }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(data.status);
  const [isCancelling, setIsCancelling] = useState(false);
  const deleteEventMutation = useDeleteEvent();

  useEffect(() => {
    setCurrentStatus(data.status);
  }, [data.status]);

  const id = data.id;
  const title = data.name;
  const category = data.category?.name || "Unknown";
  const date = data.startTime;
  const location = `${data.address?.street || ""}, ${
    data.address?.district || ""
  }, ${data.address?.province || ""}`.trim();
  const registered = Number(
    data.participantCount ??
      data.currentRegistrations ??
      data.registrationCount ??
      data.registered ??
      0
  );
  const capacity = Number(data.capacity || 0);
  const isUpdating = data._isUpdating || false;
  const isDeleting = data._isDeleting || false;

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getProgressPercentage = () => {
    if (!capacity) return 0;
    return Math.min(100, Math.round((registered / capacity) * 100));
  };

  const handleCancelEventLocal = async () => {
    if (!canCancelEvent(currentStatus)) {
      await showError(
        "Không thể hủy sự kiện",
        "Chỉ có sự kiện đã duyệt mới có thể hủy"
      );
      return;
    }

    const confirmed = await confirmCancel(title);
    if (!confirmed) return;

    const previousStatus = currentStatus;
    setCurrentStatus(EVENT_STATUS.CANCELLED);
    setIsCancelling(true);

    try {
      await onCancelEvent?.(id);
    } catch (error) {
      setCurrentStatus(previousStatus);
      alert(`Hủy sự kiện thất bại: ${error.message || "Unknown error"}`);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDeleteEvent = async () => {
    const confirmed = await confirmDelete(title);
    if (!confirmed) return;

    try {
      await deleteEventMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete event:", error);
    }
  };

  return (
    <div className="mb-5 overflow-hidden rounded-[20px] border border-deep-forest/10 bg-pale-canvas shadow-lg shadow-deep-forest/10">
      {/* Compact Header - Always Visible */}
      <div
        className="cursor-pointer p-4 transition-colors active:bg-ash-whisper/70"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <p className="mb-1 text-base font-bold leading-tight text-deep-forest">
              {title}
            </p>

            {/* Category & Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-deep-forest/55">{category}</span>
              <span
                className={`rounded-[8px] px-2 py-1 text-xs font-bold capitalize ${
                  isDeleting
                    ? "bg-foudre-pink/10 text-foudre-pink ring-1 ring-foudre-pink/20 animate-pulse"
                    : isUpdating
                    ? "bg-ash-whisper text-foudre-pink ring-1 ring-foudre-pink/15 animate-pulse"
                    : getStatusColor(currentStatus)
                }`}
              >
                {isDeleting
                  ? "Deleting..."
                  : isUpdating
                  ? "Processing..."
                  : STATUS_CONFIG[currentStatus]?.label || currentStatus}
              </span>
            </div>
          </div>

          {/* Toggle Button */}
          <button
            className="flex-shrink-0 rounded-full p-1 text-deep-forest/45 transition-colors hover:bg-ash-whisper/80 hover:text-deep-forest"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Quick Info Preview (when collapsed) */}
        {!isExpanded && (
          <div className="mt-2 flex items-center gap-3 text-xs font-medium text-deep-forest/55">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>
                {registered}/{capacity}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-3 border-t border-deep-forest/10 px-4 pb-4">
          {/* Date & Time */}
          <div className="flex items-center gap-2 pt-3 text-sm font-medium text-deep-forest/75">
            <Calendar className="h-4 w-4 flex-shrink-0 text-deep-forest/45" />
            <span>{formatDate(date)}</span>
            <Clock className="ml-2 h-4 w-4 flex-shrink-0 text-deep-forest/45" />
            <span>{formatTime(date)}</span>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2 text-sm font-medium text-deep-forest/75">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-deep-forest/45" />
            <span className="break-words">{location}</span>
          </div>

          {/* Volunteers Progress */}
          <div className="rounded-[14px] border border-deep-forest/10 bg-ash-whisper/45 p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-deep-forest/55" />
                <span className="font-bold text-deep-forest/70">Volunteers</span>
              </div>
              <span className="font-black text-deep-forest">
                {registered}/{capacity}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-deep-forest/10">
              <div
                className={`h-2 rounded-full transition-all ${
                  registered >= capacity && capacity > 0
                    ? "bg-foudre-pink"
                    : "bg-gradient-to-r from-deep-forest to-foudre-pink"
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className="mt-1 text-xs font-bold text-deep-forest/55">
              {getProgressPercentage()}% filled
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {currentStatus === EVENT_STATUS.APPROVED && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEventLocal();
                }}
                disabled={isUpdating || isDeleting || isCancelling}
                className="col-span-4 flex items-center justify-center gap-2 rounded-[10px] border border-foudre-pink/30 bg-ash-whisper px-3 py-3 text-foudre-pink transition-colors hover:bg-foudre-pink hover:text-pale-canvas disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Ban className="h-4 w-4 text-current" />
                <span className="text-sm font-bold">
                  {isCancelling ? "Cancelling..." : "Cancel Event"}
                </span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(id);
              }}
              disabled={isUpdating || isDeleting}
              className="col-span-2 flex items-center justify-center gap-2 rounded-[10px] bg-bubblegum-blush px-3 py-3 text-deep-forest transition-colors hover:bg-foudre-pink hover:text-pale-canvas disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-sm font-bold text-current">Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView?.(id);
              }}
              disabled={isUpdating || isDeleting}
              className="col-span-1 flex items-center justify-center gap-2 rounded-[10px] bg-deep-forest px-3 py-3 text-pale-canvas transition-colors hover:bg-foudre-pink disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Eye className="h-4 w-4 text-current" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteEvent();
              }}
              disabled={
                isUpdating || isDeleting || deleteEventMutation.isPending
              }
              className="col-span-1 flex items-center justify-center rounded-[10px] bg-foudre-pink px-3 py-3 text-pale-canvas transition-colors hover:bg-deep-forest disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteEventMutation.isPending ? (
                <svg
                  className="h-4 w-4 animate-spin text-current"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <Trash2 className="h-4 w-4 text-current" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileManageCard;
