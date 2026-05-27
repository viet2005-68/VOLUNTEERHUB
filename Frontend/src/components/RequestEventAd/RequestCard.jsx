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

  const avatar = data?.avatarUrl || data?.user?.avatarUrl || "";

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
    <div className="flex min-h-[142px] flex-col gap-5 rounded-2xl border-2 border-ash-whisper bg-pale-canvas p-5 text-deep-forest transition-all hover:border-bubblegum-blush hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-bubblegum-blush bg-ash-whisper text-base font-bold text-deep-forest">
          {avatar ? (
            <img
              src={avatar}
              alt={displayName}
              className="block h-full w-full object-cover"
            />
          ) : (
            <span>{displayName?.charAt(0)?.toUpperCase() || "U"}</span>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <h4 className="font-bold text-deep-forest line-clamp-1">{displayName}</h4>
          <p className="text-sm font-semibold text-deep-forest/65 line-clamp-1">
            Event: {eventName}
          </p>
          {address && <p className="text-xs text-deep-forest/50 line-clamp-1">{address}</p>}
          {timeRange && <p className="text-xs text-deep-forest/50 line-clamp-1">{timeRange}</p>}
          {data?.status && (
            <p className="text-xs">
              Status:{" "}
              <span className="inline-flex rounded-lg border border-amber-300 bg-amber-100 px-2 py-1 font-bold text-amber-800">
                {data.status}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="flex w-full flex-row items-stretch gap-3 sm:w-auto sm:min-w-[260px] sm:items-center">
        <button
          className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[10px] bg-deep-forest px-4 py-3 text-sm font-bold text-pale-canvas transition-colors hover:bg-foudre-pink disabled:opacity-60"
          onClick={handleApprove}
          disabled={
            isSubmitting || !data?.userId || !(data?.eventId || data?.event?.id)
          }
        >
          <UserPlus size={16} />
          Approve
        </button>

        <button
          className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-[10px] border border-foudre-pink bg-foudre-pink px-4 py-3 text-sm font-bold text-pale-canvas transition-colors hover:bg-deep-forest disabled:opacity-60"
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
