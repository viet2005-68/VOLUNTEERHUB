import { useEffect, useState } from "react";
import {
  EVENT_STATUS,
  getStatusColor,
  STATUS_CONFIG,
  canCancelEvent,
} from "../../pages/EventManager/eventManagerData";
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
  const registered = data.currentRegistrations || 0;
  const capacity = data.capacity || 0;
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
    return Math.round((registered / capacity) * 100);
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
    <div className="bg-white border-1 border-gray-200 rounded-2xl mb-5 shadow-md">
      {/* Compact Header - Always Visible */}
      <div
        className="p-4 cursor-pointer active:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <p className="font-semibold text-gray-900 text-base leading-tight mb-1">
              {title}
            </p>

            {/* Category & Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">{category}</span>
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${
                  isDeleting
                    ? "bg-red-100 text-red-700 animate-pulse"
                    : isUpdating
                    ? "bg-yellow-100 text-yellow-700 animate-pulse"
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
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Quick Info Preview (when collapsed) */}
        {!isExpanded && (
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
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
        <div className="px-4 pb-4 space-y-3 rounded-xl">
          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm pt-3">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-700">{formatDate(date)}</span>
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
            <span className="text-gray-600">{formatTime(date)}</span>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 break-words">{location}</span>
          </div>

          {/* Volunteers Progress */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Volunteers</span>
              </div>
              <span className="font-semibold text-gray-900">
                {registered}/{capacity}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  registered === capacity
                    ? "bg-red-500"
                    : registered >= capacity * 0.8
                    ? "bg-orange-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
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
                className="col-span-4 py-2.5 bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Ban className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">
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
              className="col-span-2 py-2.5 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-white text-sm font-medium">Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView?.(id);
              }}
              disabled={isUpdating || isDeleting}
              className="col-span-1 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteEvent();
              }}
              disabled={
                isUpdating || isDeleting || deleteEventMutation.isPending
              }
              className="col-span-1 py-2.5 bg-red-400 hover:bg-red-500 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteEventMutation.isPending ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                <Trash2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileManageCard;
