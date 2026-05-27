import React from "react";
import {
  Award,
  CheckCircle,
  Clock3,
  ClipboardList,
  Mail,
  PencilLine,
  RotateCcw,
  UserRound,
  XCircle,
} from "lucide-react";

function MarkCompletionCard({
  volunteer,
  onMarkAttended,
  onMarkAbsent,
  onEditCompletion,
  onMarkCompleted,
  onUndo,
}) {
  const {
    name = "Unknown",
    email = "",
    status,
    hoursLogged,
    feedback,
    avatar,
    eventName,
    eventId,
    registrationId,
  } = volunteer;

  const statusMeta = {
    registered: {
      label: "Registered",
      className: "border-deep-forest/15 bg-deep-forest/10 text-deep-forest",
    },
    attended: {
      label: "Attended",
      className: "border-deep-forest bg-deep-forest text-pale-canvas",
    },
    completed: {
      label: "Completed",
      className: "border-emerald-200 bg-emerald-100 text-emerald-800",
    },
    absent: {
      label: "Absent",
      className: "border-red-200 bg-red-100 text-red-700",
    },
  }[status] || {
    label: status || "Unknown",
    className: "border-deep-forest/15 bg-deep-forest/10 text-deep-forest",
  };

  const resolvedEventName = eventName || "Chưa có tên sự kiện";
  const resolvedId = eventId ?? registrationId ?? null;
  const parsedHours = Number(hoursLogged);
  const hasHours = Number.isFinite(parsedHours) && parsedHours > 0;
  const hoursText = hasHours
    ? `${Number.isInteger(parsedHours) ? parsedHours : parsedHours.toFixed(1)} hours logged`
    : null;

  const ActionButton = ({ children, icon, onClick, variant = "primary" }) => {
    const isPrimary = variant === "primary";
    return (
      <button
        onClick={() => onClick?.(volunteer)}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold leading-none transition sm:w-auto ${
          isPrimary
            ? "bg-deep-forest text-pale-canvas hover:bg-deep-forest/90"
            : "border border-deep-forest/20 bg-pale-canvas text-deep-forest hover:border-deep-forest hover:bg-deep-forest/5"
        }`}
      >
        {icon}
        <span>{children}</span>
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-deep-forest/15 bg-white/85 p-4 text-deep-forest shadow-[0_12px_28px_rgba(0,82,45,0.07)] sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-deep-forest/15 bg-deep-forest/10 text-deep-forest sm:h-[72px] sm:w-[72px]">
            {avatar ? (
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              <UserRound className="h-8 w-8" />
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-xl font-bold leading-[1.05] text-deep-forest sm:text-2xl">
                {name}
              </p>
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold uppercase leading-none ${statusMeta.className}`}
              >
                {statusMeta.label}
              </span>
            </div>

            {email && (
              <p className="flex min-w-0 items-center gap-2 text-sm font-medium text-deep-forest/65 sm:text-base">
                <Mail className="h-5 w-5 shrink-0" />
                <span className="truncate">{email}</span>
              </p>
            )}

            <div className="flex flex-wrap gap-2 text-sm font-medium text-deep-forest/70">
              <span className="inline-flex min-w-0 items-center gap-2 rounded-lg bg-deep-forest/5 px-3 py-2">
                <ClipboardList className="h-5 w-5 shrink-0 text-deep-forest" />
                <span className="min-w-0 break-words">
                  Sự kiện: <b>{resolvedEventName}</b>
                  {resolvedId ? ` • ID: ${resolvedId}` : ""}
                </span>
              </span>
              {hoursText && (
                <span className="inline-flex items-center gap-2 rounded-lg bg-deep-forest/5 px-3 py-2">
                  <Clock3 className="h-5 w-5 shrink-0 text-deep-forest" />
                  {hoursText}
                </span>
              )}
            </div>

            {feedback && (
              <p className="line-clamp-2 rounded-lg bg-deep-forest/5 px-3 py-2 text-sm font-medium italic text-deep-forest/65">
                "{feedback}"
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
          {status === "registered" && (
            <>
              <ActionButton
                variant="secondary"
                onClick={onMarkAttended}
                icon={<CheckCircle className="h-5 w-5" />}
              >
                Mark Attended
              </ActionButton>
              <ActionButton
                variant="secondary"
                onClick={onMarkAbsent}
                icon={<XCircle className="h-5 w-5" />}
              >
                Mark Absent
              </ActionButton>
            </>
          )}

          {status === "attended" && (
            <ActionButton
              onClick={onMarkCompleted}
              icon={<Award className="h-5 w-5" />}
            >
              Mark Completed
            </ActionButton>
          )}

          {status === "completed" && (
            <ActionButton
              onClick={onEditCompletion}
              icon={<PencilLine className="h-5 w-5" />}
            >
              Edit Completion
            </ActionButton>
          )}

          {status === "absent" && (
            <ActionButton
              variant="secondary"
              onClick={onUndo}
              icon={<RotateCcw className="h-5 w-5" />}
            >
              Undo
            </ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default MarkCompletionCard;
