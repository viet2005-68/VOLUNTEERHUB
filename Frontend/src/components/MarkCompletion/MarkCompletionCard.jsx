import React from "react";
import Card from "../Card.jsx/Card";
import { CheckCircle, XCircle, Award, PencilLine } from "lucide-react";

function MarkCompletionCard({
  volunteer,
  onMarkAttended,
  onMarkAbsent,
  onEditCompletion,
  onMarkCompleted,
  onUndo,
}) {
  const { name, email, status, hoursLogged, feedback, avatar, eventName, eventId } =
    volunteer;

  // Card cho người đã Registered - hiển thị nút Mark Attended/Absent
  if (status === "registered") {
    return (
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-bubblegum-blush bg-ash-whisper flex items-center justify-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-bold text-deep-forest sm:text-lg">
                  {name.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-deep-forest sm:text-base">
                  {name}
                </p>
                <span className="rounded-[10px] border border-foudre-pink/20 bg-ash-whisper px-3 py-1 text-xs font-bold text-foudre-pink sm:text-sm">
                  Registered
                </span>
              </div>
              <p className="truncate text-xs font-medium text-deep-forest/65 sm:text-sm">
                {email}
              </p>
              <p className="text-xs font-medium text-deep-forest/75 sm:text-sm">
                Sự kiện: {eventName ?? "—"} • ID: {eventId ?? "—"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onMarkAttended(volunteer)}
              className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-deep-forest/20 bg-pale-canvas px-4 py-3 text-sm font-bold leading-[0.85] text-deep-forest transition hover:border-foudre-pink hover:bg-ash-whisper hover:text-foudre-pink sm:flex-initial"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Mark Attended</span>
            </button>
            <button
              onClick={() => onMarkAbsent(volunteer)}
              className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-deep-forest/20 bg-pale-canvas px-4 py-3 text-sm font-bold leading-[0.85] text-deep-forest transition hover:border-foudre-pink hover:bg-ash-whisper hover:text-foudre-pink sm:flex-initial"
            >
              <XCircle className="h-5 w-5" />
              <span>Mark Absent</span>
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // Card cho người đã Attended - hiển thị hours logged và nút Mark Completed
  if (status === "attended") {
    return (
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-bubblegum-blush bg-ash-whisper flex items-center justify-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-bold text-deep-forest sm:text-lg">
                  {name.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-sm font-bold text-deep-forest sm:text-base">
                  {name}
                </p>
                <span className="rounded-[10px] bg-foudre-pink px-3 py-1 text-xs font-bold text-pale-canvas sm:text-sm">
                  Attended
                </span>
              </div>
              <p className="mb-1 truncate text-xs font-medium text-deep-forest/65 sm:text-sm">
                {email}
              </p>
              <p className="text-xs font-medium text-deep-forest/75 sm:text-sm">
                Sự kiện: {eventName ?? "—"} • ID: {eventId ?? "—"}
              </p>
              <p className="text-xs font-medium text-deep-forest/75 sm:text-sm">
                {hoursLogged} hours logged
              </p>
            </div>
          </div>

          {/* Mark Completed Button */}
          <button
            onClick={() => onMarkCompleted(volunteer)}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-foudre-pink px-4 py-3 text-sm font-bold leading-[0.85] text-pale-canvas transition hover:bg-deep-forest sm:w-auto"
          >
            <Award className="h-4 w-4" />
            <span>Mark Completed</span>
          </button>
        </div>
      </Card>
    );
  }

  // Card cho người đã Completed - hiển thị thông tin và nút Edit
  if (status === "completed") {
    return (
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
            {/* Avatar */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-bubblegum-blush bg-ash-whisper flex items-center justify-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-bold text-deep-forest sm:text-lg">
                  {name.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-sm font-bold text-deep-forest sm:text-base">
                  {name}
                </p>
                <span className="rounded-[10px] border border-deep-forest/15 bg-deep-forest/10 px-3 py-1 text-xs font-bold text-deep-forest sm:text-sm">
                  Completed
                </span>
                <Award className="h-4 w-4 text-foudre-pink sm:h-5 sm:w-5" />
              </div>
              <p className="mb-2 truncate text-xs font-medium text-deep-forest/65 sm:text-sm">
                {email}
              </p>
              <p className="text-xs font-medium text-deep-forest/75 sm:text-sm">
                Sự kiện: {eventName ?? "—"} • ID: {eventId ?? "—"}
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-deep-forest/75 sm:text-sm mb-2 flex-wrap">
                <span className="font-medium">{hoursLogged} hours logged</span>
              </div>
              {feedback && (
                <p className="line-clamp-2 text-xs font-medium italic text-deep-forest/65 sm:text-sm">
                  "{feedback}"
                </p>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => onEditCompletion(volunteer)}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-foudre-pink px-4 py-3 text-sm font-bold leading-[0.85] text-pale-canvas transition hover:bg-deep-forest sm:w-auto"
          >
            <PencilLine className="h-4 w-4" />
            <span>Edit Completion</span>
          </button>
        </div>
      </Card>
    );
  }

  // Card cho người đã Absent - chỉ hiển thị nút Undo
  if (status === "absent") {
    return (
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-bubblegum-blush bg-ash-whisper flex items-center justify-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-bold text-deep-forest sm:text-lg">
                  {name.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-deep-forest sm:text-base">
                  {name}
                </p>
                <span className="rounded-[10px] border border-foudre-pink/20 bg-foudre-pink/10 px-3 py-1 text-xs font-bold text-foudre-pink sm:text-sm">
                  Absent
                </span>
              </div>
              <p className="truncate text-xs font-medium text-deep-forest/65 sm:text-sm">
                {email}
              </p>
              <p className="text-xs font-medium text-deep-forest/75 sm:text-sm">
                Sự kiện: {eventName ?? "—"} • ID: {eventId ?? "—"}
              </p>
            </div>
          </div>

          {/* Undo Button */}
          <button
            onClick={() => onUndo(volunteer)}
            className="w-full rounded-[10px] border border-deep-forest/20 bg-pale-canvas px-4 py-3 text-sm font-bold leading-[0.85] text-deep-forest transition hover:border-foudre-pink hover:bg-ash-whisper hover:text-foudre-pink sm:w-auto"
          >
            Undo
          </button>
        </div>
      </Card>
    );
  }

  return null;
}

export default MarkCompletionCard;
