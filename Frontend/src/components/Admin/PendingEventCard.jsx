import React, { useState } from "react";
import { Calendar, Clock, MapPin, Users, UserPlus, Ban } from "lucide-react";
import { useApproveEvent, useRejectEvent } from "../../hook/useEvent";
import RejectReasonModal from "../Modal/RejectReasonModal";
import { confirmApprove } from "../../utils/confirmDialog";

function PendingEventCard({
  id,
  title,
  date,
  starttime,
  endtime,
  location,
  joined,
  capacity,
  urlImg,
  category,
}) {
  const approveEventMutation = useApproveEvent();
  const rejectEventMutation = useRejectEvent();
  const [showRejectModal, setShowRejectModal] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
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

  const getProgressPercentage = () => {
    if (!capacity) return 0;
    return Math.round((joined / capacity) * 100);
  };

  const handleApprove = async (e) => {
    e.stopPropagation();
    const confirmed = await confirmApprove(title);
    if (!confirmed) return;

    try {
      await approveEventMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to approve event:", error);
    }
  };

  const handleReject = (e) => {
    e.stopPropagation();
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (reason) => {
    try {
      await rejectEventMutation.mutateAsync({ eventId: id, reason });
      setShowRejectModal(false);
    } catch (error) {
      console.error("Failed to reject event:", error);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 p-3">
          {/* Image - Small thumbnail centered vertically */}
          {urlImg && (
            <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
              <img
                src={urlImg}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title & Category */}
            <div className="mb-1">
              <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                {title}
              </p>
              {category && (
                <span className="text-xs text-gray-500">{category}</span>
              )}
            </div>

            {/* Date, Time & Location - Compact */}
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span>{formatDate(starttime || date)}</span>
                <Clock className="w-3 h-3 text-gray-400 ml-1" />
                <span>
                  {formatTime(starttime)} - {formatTime(endtime)}
                </span>
              </div>
              {location && (
                <div className="flex items-start gap-1.5 text-xs text-gray-600">
                  <MapPin className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                  <span className="line-clamp-1">{location}</span>
                </div>
              )}
            </div>

            {/* Volunteers - Inline */}
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-medium text-gray-900">
                  {joined}/{capacity}
                </span>
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-1 max-w-[80px]">
                <div
                  className={`h-1 rounded-full transition-all ${
                    joined === capacity
                      ? "bg-red-500"
                      : joined >= capacity * 0.8
                      ? "bg-orange-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Vertical on the right, centered */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              onClick={handleApprove}
              disabled={approveEventMutation.isPending}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {approveEventMutation.isPending ? "..." : "Approve"}
              </span>
            </button>
            <button
              onClick={handleReject}
              disabled={rejectEventMutation.isPending}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Ban className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {rejectEventMutation.isPending ? "..." : "Reject"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Reject Reason Modal */}
      <RejectReasonModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleConfirmReject}
        eventTitle={title}
        isLoading={rejectEventMutation.isPending}
      />
    </>
  );
}

export default PendingEventCard;
