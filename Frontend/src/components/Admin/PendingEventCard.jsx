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
      <div className="overflow-hidden rounded-[20px] border-2 border-ash-whisper bg-pale-canvas transition-colors hover:border-bubblegum-blush">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch">
          {urlImg && (
            <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-[20px] bg-ash-whisper sm:w-32">
              <img
                src={urlImg}
                alt={title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-base font-bold leading-[1.2] text-deep-forest">
                  {title}
                </p>
                {category && (
                  <span className="mt-1 inline-flex rounded-[10px] bg-ash-whisper px-3 py-1 text-xs font-bold leading-[0.85] text-foudre-pink">
                    {category}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs font-medium leading-[1.2] text-deep-forest/70">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-foudre-pink" />
                  {formatDate(starttime || date)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-foudre-pink" />
                  {formatTime(starttime)} - {formatTime(endtime)}
                </span>
              </div>
              {location && (
                <div className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foudre-pink" />
                  <span className="line-clamp-1">{location}</span>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold leading-[1.2] text-deep-forest">
                <Users className="h-3.5 w-3.5 text-foudre-pink" />
                {joined}/{capacity}
              </div>
              <div className="h-2 w-24 rounded-full bg-ash-whisper">
                <div
                  className="h-2 rounded-full bg-deep-forest transition-all"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-row gap-2 sm:w-28 sm:flex-col sm:justify-center">
            <button
              onClick={handleApprove}
              disabled={approveEventMutation.isPending}
              className="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] bg-deep-forest px-4 py-3 text-xs font-bold leading-[0.85] text-pale-canvas transition-colors hover:bg-foudre-pink disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{approveEventMutation.isPending ? "..." : "Approve"}</span>
            </button>
            <button
              onClick={handleReject}
              disabled={rejectEventMutation.isPending}
              className="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border-2 border-foudre-pink bg-transparent px-4 py-3 text-xs font-bold leading-[0.85] text-foudre-pink transition-colors hover:bg-foudre-pink hover:text-pale-canvas disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Ban className="h-3.5 w-3.5" />
              <span>{rejectEventMutation.isPending ? "..." : "Reject"}</span>
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
