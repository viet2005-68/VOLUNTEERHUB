import React, { useMemo, useState } from "react";
import { UserPlus, X } from "lucide-react";
import { useReviewRegistration } from "../../hook/useRegistration";

const RequestCard = ({ data }) => {
  const reviewMutation = useReviewRegistration();
  const [note, setNote] = useState("");
  const isSubmitting = reviewMutation.isPending || reviewMutation.isLoading;

  const shortUserLabel = useMemo(() => {
    if (typeof data?.userId === "string" && data.userId.length > 6) {
      return `User ${data.userId.slice(0, 6)}…`;
    }
    if (data?.userId) {
      return `User ${String(data.userId)}`;
    }
    return "Unknown User";
  }, [data?.userId]);

  const displayName =
    data?.user?.name || data?.fullName || data?.username || shortUserLabel;

  const avatar = data?.avatarUrl || "";

  const eventName = data?.event?.name || data?.eventName || "Sự kiện";
  const address = useMemo(() => {
    const addr = data?.event?.address;
    if (!addr) return null;
    const { street, district, province } = addr;
    return [street, district, province].filter(Boolean).join(", ");
  }, [data?.event?.address]);

  const startTime = data?.event?.startTime;
  const endTime = data?.event?.endTime;
  const timeRange = useMemo(() => {
    if (!startTime) return null;
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : null;
    const fmt = (d) => d.toLocaleString(undefined, { hour12: false });
    return end ? `${fmt(start)} - ${fmt(end)}` : fmt(start);
  }, [startTime, endTime]);

  const handleApprove = () => {
    reviewMutation.mutate(
      {
        eventId: data?.eventId ?? data?.event?.id,
        participantId: data?.userId,
        status: "APPROVED",
        note: note.trim() || null,
      },
      {
        onSuccess: () => {
          setNote("");
        },
      }
    );
  };

  const handleReject = () => {
    reviewMutation.mutate(
      {
        eventId: data?.eventId ?? data?.event?.id,
        participantId: data?.userId,
        status: "REJECTED",
        note: note.trim() || null,
      },
      {
        onSuccess: () => {
          setNote("");
        },
      }
    );
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-pale-canvas border border-deep-forest/15 rounded-2xl mb-3 gap-4 text-deep-forest">
      <div className="flex items-center gap-3">
        <img
          src={avatar}
          alt={displayName}
          className="w-10 h-10 rounded-full bg-ash-whisper object-cover"
        />
        <div className="flex gap-2 flex-col">
          <h4 className="font-bold text-deep-forest">{displayName}</h4>
          <p className="text-sm text-deep-forest/65">Event: {eventName}</p>
          {address && <p className="text-xs text-deep-forest/50">{address}</p>}
          {timeRange && <p className="text-xs text-deep-forest/50">{timeRange}</p>}
          {data?.status && (
            <p className="text-xs mt-1">
              Status: <span className="font-medium">{data.status}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-row sm:flex-row items-stretch sm:items-center gap-5 sm:gap-3">
        <button
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-deep-forest text-pale-canvas rounded-lg text-sm font-bold hover:bg-foudre-pink transition-colors disabled:opacity-60"
          onClick={handleApprove}
          disabled={
            isSubmitting || !data?.userId || !(data?.eventId || data?.event?.id)
          }
        >
          <UserPlus size={16} />
          Approve
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-foudre-pink text-pale-canvas border border-foudre-pink rounded-lg text-sm font-bold transition-transform hover:scale-105 duration-150 disabled:opacity-60"
          onClick={handleReject}
          disabled={
            isSubmitting || !data?.userId || !(data?.eventId || data?.event?.id)
          }
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default RequestCard;
