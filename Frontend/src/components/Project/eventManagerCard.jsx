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
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Event Name & Category */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{title}</span>
          <span className="text-sm text-gray-500">
            {category?.name || "N/A"}
          </span>
        </div>
      </td>

      {/* Date & Time */}
      <td className="px-6 py-4">
        <div className="flex flex-col text-sm">
          <div className="flex items-center gap-1 text-gray-700">
            <i className="ri-calendar-line"></i>
            <span>{formatDate(startTime)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <i className="ri-time-line"></i>
            <span>
              {formatTime(startTime)} - {formatTime(endTime)}
            </span>
          </div>
        </div>
      </td>

      {/* Location */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <i className="ri-map-pin-fill text-gray-400"></i>
          <span className="max-w-[150px] truncate">
            {address
              ? `${address.street}, ${address.district}, ${address.province}`
              : "N/A"}
          </span>
        </div>
      </td>

      {/* Volunteers */}
      <td className="px-6 py-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700">
              {participantCount}/{capacity}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                participantCount === capacity
                  ? "bg-red-500"
                  : participantCount >= capacity * 0.8
                  ? "bg-orange-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${getStatusColor(
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
              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative"
              title="Cancel this event"
            >
              {isCancelling ? (
                <svg
                  className="animate-spin h-4 w-4 text-red-600"
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
                <X className="w-4 h-4 text-red-600 group-hover:text-red-700" />
              )}
            </button>
          ) : (
            currentStatus === EVENT_STATUS.PENDING && (
              <span
                className="text-xs text-gray-400 italic"
                title="Event must be approved before it can be cancelled"
              >
                (Waiting approval)
              </span>
            )
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onView?.(id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={handleDeleteEvent}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete"
            disabled={deleteEventMutation.isPending}
          >
            {deleteEventMutation.isPending ? (
              <svg
                className="animate-spin h-4 w-4 text-red-500"
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
              <Trash2 className="w-4 h-4 text-red-500" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default EventManagerCard;
