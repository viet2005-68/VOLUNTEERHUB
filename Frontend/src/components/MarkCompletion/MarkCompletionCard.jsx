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
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 text-base sm:text-lg font-semibold">
                  {name.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {name}
                </p>
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-lg font-semibold bg-blue-100 text-blue-700">
                  Registered
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {email}
              </p>
              <p className="text-xs sm:text-sm text-gray-700">
                Sự kiện: {eventName ?? "—"} • ID: {eventId ?? "—"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onMarkAttended(volunteer)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex-1 sm:flex-initial text-sm"
            >
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Mark Attended</span>
            </button>
            <button
              onClick={() => onMarkAbsent(volunteer)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex-1 sm:flex-initial text-sm"
            >
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Mark Absent</span>
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 text-base sm:text-lg font-semibold">
                  {name.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {name}
                </p>
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-lg font-semibold bg-gray-900 text-white">
                  Attended
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
                {email}
              </p>
              <p className="text-xs sm:text-sm text-gray-700">
                Sự kiện: {eventName ?? "—"} • ID: {eventId ?? "—"}
              </p>
              <p className="text-xs sm:text-sm text-gray-700">
                {hoursLogged} hours logged
              </p>
            </div>
          </div>

          {/* Mark Completed Button */}
          <button
            onClick={() => onMarkCompleted(volunteer)}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors w-full sm:w-auto"
          >
            <Award className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Mark Completed</span>
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 text-base sm:text-lg font-semibold">
                  {name.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {name}
                </p>
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-lg font-semibold bg-green-100 text-green-700">
                  Completed
                </span>
                <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 truncate">
                {email}
              </p>
              <p className="text-xs sm:text-sm text-gray-700">
                Sự kiện: {eventName ?? "—"} • ID: {eventId ?? "—"}
              </p>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 mb-2 flex-wrap">
                <span className="font-medium">{hoursLogged} hours logged</span>
              </div>
              {feedback && (
                <p className="text-xs sm:text-sm text-gray-600 italic line-clamp-2">
                  "{feedback}"
                </p>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => onEditCompletion(volunteer)}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors w-full sm:w-auto"
          >
            <PencilLine className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Edit Completion</span>
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 text-base sm:text-lg font-semibold">
                  {name.charAt(0)}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900 text-sm sm:text-base">
                  {name}
                </p>
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-lg font-semibold bg-red-500 text-white">
                  Absent
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {email}
              </p>
              <p className="text-xs sm:text-sm text-gray-700">
                Sự kiện: {eventName ?? "—"} • ID: {eventId ?? "—"}
              </p>
            </div>
          </div>

          {/* Undo Button */}
          <button
            onClick={() => onUndo(volunteer)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors w-full sm:w-auto text-xs sm:text-sm"
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
