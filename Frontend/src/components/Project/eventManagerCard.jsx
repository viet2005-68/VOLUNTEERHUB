import React, { useEffect, useState } from "react";
import { Edit, Eye, Trash2, X } from "lucide-react";
import {
  getStatusColor,
  STATUS_CONFIG,
  EVENT_STATUS,
  canCancelEvent,
} from "../../constant/eventStatus";
import { useDeleteEvent } from "../../hook/useEvent";
import {
  confirmCancel,
  confirmDelete,
  showError,
} from "../../utils/confirmDialog";
function EventManagerCard({ data, onCancelEvent, onEdit, onView }) {
  // Map API data to component props
  const {
    id,
    name: title,
    category,
    address,
    startTime,
    endTime,
    status,
    capacity,
    participantCount,
  } = data;
  const deleteEventMutation = useDeleteEvent();

  const registered = Math.floor((participantCount * capacity * 1.0) / 100);

  const [currentStatus, setCurrentStatus] = useState(status);
  const [isCancelling, setIsCancelling] = useState(false);

  // Keep the local status in sync with the latest server payload so the row updates after admin actions
  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const handleCancelEvent = async () => {
    if (!canCancelEvent(currentStatus)) {
      await showError(
        "Cannot Cancel Event",
        "Only approved events can be cancelled"
      );
      return;
    }

    // Confirmation
    const confirmed = await confirmCancel(
      title,
      `This will notify all ${registered} registered volunteers.`
    );

    if (!confirmed) return;

    const previousStatus = currentStatus;

    // Optimistic update
    setCurrentStatus(EVENT_STATUS.CANCELLED);
    setIsCancelling(true);

    try {
      // Call parent's handler (should return a promise)
      await onCancelEvent?.(id);

      // Success
      console.log(`Event cancelled successfully`);
      // TODO: Show success toast
    } catch (error) {
      // Error - rollback
      console.error("Failed to cancel event:", error);
      setCurrentStatus(previousStatus);
      await showError(
        "Failed to Cancel Event",
        error.message || "Unknown error occurred. Please try again."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const getProgressPercentage = () => {
    return Math.round((participantCount / capacity) * 100);
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
    <tr className="border-b-2 border-ash-whisper transition-colors hover:bg-ash-whisper/30">
      {/* Event Name & Category */}
      <td className="px-6 py-5">
        <div className="flex flex-col gap-1">
          <span className="text-base font-bold leading-[1.2] text-deep-forest">
            {title}
          </span>
          <span className="text-sm font-medium leading-[1.2] text-deep-forest/60">
            {category?.name || "N/A"}
          </span>
        </div>
      </td>

      {/* Date & Time */}
      <td className="px-6 py-5">
        <div className="flex flex-col gap-1 text-sm font-medium leading-[1.2]">
          <div className="flex items-center gap-1.5 text-deep-forest">
            <i className="ri-calendar-line"></i>
            <span>{formatDate(startTime)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-deep-forest/65">
            <i className="ri-time-line"></i>
            <span>
              {formatTime(startTime)} - {formatTime(endTime)}
            </span>
          </div>
        </div>
      </td>

      {/* Location */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2 text-sm font-medium leading-[1.2] text-deep-forest/75">
          <i className="ri-map-pin-fill text-foudre-pink"></i>
          <span className="max-w-[150px] truncate">
            {address
              ? `${address.street}, ${address.district}, ${address.province}`
              : "N/A"}
          </span>
        </div>
      </td>

      {/* Volunteers */}
      <td className="px-6 py-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold leading-[1.2] text-deep-forest">
              {participantCount}/{capacity}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-ash-whisper">
            <div
              className="h-2 rounded-full bg-deep-forest transition-all"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className={`rounded-[10px] px-3 py-2 text-sm font-bold capitalize leading-[0.85] ${getStatusColor(
              currentStatus
            )}`}
            title={STATUS_CONFIG[currentStatus]?.description}
          >
            {STATUS_CONFIG[currentStatus]?.label || currentStatus}
          </span>

          {/* Cancel Button (only for approved events) */}
          {canCancelEvent(currentStatus) ? (
            <button
              onClick={handleCancelEvent}
              disabled={isCancelling}
              className="group relative rounded-[10px] p-2 text-foudre-pink transition-colors hover:bg-ash-whisper disabled:cursor-not-allowed disabled:opacity-50"
              title="Cancel this event"
            >
              {isCancelling ? (
                <svg
                  className="h-4 w-4 animate-spin text-foudre-pink"
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
                <X className="h-4 w-4" />
              )}
            </button>
          ) : (
            currentStatus === EVENT_STATUS.PENDING && (
              <span
                className="text-xs font-medium italic leading-[1.2] text-deep-forest/45"
                title="Event must be approved before it can be cancelled"
              >
                (Waiting approval)
              </span>
            )
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(id)}
            className="rounded-[10px] p-2 text-deep-forest transition-colors hover:bg-ash-whisper"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onView?.(id)}
            className="rounded-[10px] p-2 text-deep-forest transition-colors hover:bg-ash-whisper"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={handleDeleteEvent}
            className="rounded-[10px] p-2 text-foudre-pink transition-colors hover:bg-ash-whisper disabled:cursor-not-allowed disabled:opacity-50"
            title="Delete"
            disabled={deleteEventMutation.isPending}
          >
            {deleteEventMutation.isPending ? (
              <svg
                className="h-4 w-4 animate-spin text-foudre-pink"
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
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default EventManagerCard;
